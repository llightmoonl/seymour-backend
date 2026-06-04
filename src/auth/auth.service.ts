import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { hash } from 'argon2';
import { RegisterDto } from './dto/index.js';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/index.js';
import { ConfigService } from '@nestjs/config';
import { ms, StringValue } from '../common/utils/index.js';
import { User } from '../../prisma/src/generated/prisma/client.js';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN: StringValue;
  private readonly JWT_REFRESH_TOKEN: StringValue;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN = configService.getOrThrow<StringValue>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    this.JWT_REFRESH_TOKEN = configService.getOrThrow<StringValue>(
      'JWT_REFRESH_TOKEN_TTL',
    );
  }

  public async register(dto: RegisterDto) {
    const { firstName, lastName, email, password } = dto;

    const exists = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (exists)
      throw new ConflictException('A user with this email already exists');

    const hashedPassword = await hash(password);

    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    return this.generateToken(user);
  }

  private async generateToken(user: User) {
    const payload: JwtPayload = {
      id: user.id,
    };

    const refreshTokenExpires = new Date(
      Date.now() + ms(this.JWT_ACCESS_TOKEN),
    );

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN,
    });

    return {
      accessToken,
      refreshToken,
      refreshTokenExpires,
    };
  }
}
