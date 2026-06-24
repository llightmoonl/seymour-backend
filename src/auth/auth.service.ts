import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { hash, verify } from 'argon2';
import { RegisterDto, LoginDto } from './dto/index.js';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/index.js';
import { ConfigService } from '@nestjs/config';
import { ms, StringValue } from '../common/utils/index.js';
import { User } from '../../prisma/src/generated/prisma/client.js';

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

  public async login(dto: LoginDto) {
    const { email, password, rememberMe } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) throw new NotFoundException('Неверный логин или пароль');

    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword)
      throw new NotFoundException('Неверный логин или пароль');

    return this.generateToken(user, rememberMe);
  }

  public async register(dto: RegisterDto) {
    const { name, email, password } = dto;

    const exists = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (exists)
      throw new ConflictException('A user with this email already exists');

    const hashedPassword = await hash(password);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return this.generateToken(user);
  }

  private async generateToken(user: User, rememberMe = false) {
    const payload: JwtPayload = {
      id: user.id,
    };

    const refreshTtl = rememberMe
      ? this.JWT_REFRESH_TOKEN_LONG
      : this.JWT_REFRESH_TOKEN_SHORT;

    const refreshTokenExpires = new Date(Date.now() + ms(refreshTtl));

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: refreshTtl,
    });

    return {
      accessToken,
      refreshToken,
      refreshTokenExpires,
    };
  }
}
