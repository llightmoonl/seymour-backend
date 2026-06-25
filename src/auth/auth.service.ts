import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { hash, verify } from 'argon2';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/index.js';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, RequestUser } from './interfaces/index.js';
import { ConfigService } from '@nestjs/config';
import { ms, StringValue } from '../common/utils/index.js';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN: StringValue;
  private readonly JWT_REFRESH_TOKEN_SHORT: StringValue;
  private readonly JWT_REFRESH_TOKEN_LONG: StringValue;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN = configService.getOrThrow<StringValue>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    this.JWT_REFRESH_TOKEN_SHORT = configService.getOrThrow<StringValue>(
      'JWT_REFRESH_TOKEN_TTL_SHORT',
    );
    this.JWT_REFRESH_TOKEN_LONG = configService.getOrThrow<StringValue>(
      'JWT_REFRESH_TOKEN_TTL_LONG',
    );
  }

  async register(dto: RegisterDto, res: Response, req: Request) {
    const { name, email, password } = dto;

    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists)
      throw new ConflictException('Пользователь с таким email уже существует');

    const passwordHash = await hash(password);
    const user = await this.prisma.user.create({
      data: { name, email, passwordHash },
    });

    return this.createSession(user.id, user.role, false, res, req);
  }

  async login(dto: LoginDto, res: Response, req: Request) {
    const { email, password, rememberMe = false } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Неверный логин или пароль');

    const isValid = await verify(user.passwordHash, password);
    if (!isValid) throw new UnauthorizedException('Неверный логин или пароль');

    return this.createSession(user.id, user.role, rememberMe, res, req);
  }

  async refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token not found');

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const session = await this.prisma.session.findFirst({
      where: { id: payload.sessionId, userId: payload.id },
      include: { user: { select: { id: true, role: true } } },
    });

    if (!session) throw new UnauthorizedException('Session not found');

    const isValid = await verify(session.refreshTokenHash, refreshToken);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const sessionId = session.id;
    const { accessToken, newRefreshToken } = await this.generateTokens(
      session.user.id,
      session.user.role,
      sessionId,
      session.rememberMe,
    );

    const newHash = await hash(newRefreshToken);
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { refreshTokenHash: newHash, lastActiveAt: new Date() },
    });

    this.setCookies(res, accessToken, newRefreshToken, session.rememberMe);
    return { message: 'Token refreshed' };
  }

  async logout(user: RequestUser, res: Response) {
    await this.prisma.session.deleteMany({ where: { id: user.sessionId } });
    this.clearCookies(res);
    return null;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const isValid = await verify(user.passwordHash, dto.currentPassword);
    if (!isValid) throw new BadRequestException('Текущий пароль неверный');

    const passwordHash = await hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });

    await this.prisma.session.deleteMany({ where: { userId } });
    return null;
  }

  private async createSession(
    userId: string,
    role: string,
    rememberMe: boolean,
    res: Response,
    req: Request,
  ) {
    const uaStr = req.headers['user-agent'];
    const ua = new UAParser(uaStr);
    const result = ua.getResult();
    const device = result.device.vendor
      ? `${result.device.vendor} ${result.device.model}`
      : result.os.name || 'Unknown Device';
    const browser = result.browser.name
      ? `${result.browser.name} ${result.browser.version}`
      : 'Unknown Browser';
    const forwarded = req.headers['x-forwarded-for'] as string | undefined;
    const ip = forwarded?.split(',')[0]?.trim() ?? req.ip ?? null;

    const sessionId = randomUUID();
    const { accessToken, newRefreshToken } = await this.generateTokens(
      userId,
      role,
      sessionId,
      rememberMe,
    );
    const refreshTokenHash = await hash(newRefreshToken);

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId,
        refreshTokenHash,
        rememberMe,
        device,
        browser,
        ip,
        lastActiveAt: new Date(),
      },
    });

    this.setCookies(res, accessToken, newRefreshToken, rememberMe);
    return { message: 'Success' };
  }

  private async generateTokens(
    userId: string,
    role: string,
    sessionId: string,
    rememberMe: boolean,
  ) {
    const payload: JwtPayload = { id: userId, role, sessionId };
    const refreshTtl = rememberMe
      ? this.JWT_REFRESH_TOKEN_LONG
      : this.JWT_REFRESH_TOKEN_SHORT;

    const [accessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: this.JWT_ACCESS_TOKEN }),
      this.jwtService.signAsync(payload, { expiresIn: refreshTtl }),
    ]);

    return { accessToken, newRefreshToken };
  }

  private setCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    rememberMe = false,
  ) {
    const refreshTtl = rememberMe
      ? this.JWT_REFRESH_TOKEN_LONG
      : this.JWT_REFRESH_TOKEN_SHORT;
    const isProduction = process.env.NODE_ENV === 'production';
    const base = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('access_token', accessToken, {
      ...base,
      maxAge: ms(this.JWT_ACCESS_TOKEN),
    });
    res.cookie('refresh_token', refreshToken, {
      ...base,
      maxAge: ms(refreshTtl),
    });
  }

  private clearCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }
}
