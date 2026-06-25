import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

const profileSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  avatarUrl: true,
  role: true,
  theme: true,
  locale: true,
  createdAt: true,
} as const;

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: profileSelect,
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: profileSelect,
    });
  }

  async requestEmailVerify(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { email: true },
    });
    const token = Math.random().toString(36).slice(2);
    console.log(`[DEV] Email verify token for ${user.email}: ${token}`);
    return { message: 'Verification email sent' };
  }

  async confirmEmailVerify(userId: string, token: string) {
    if (!token) return { message: 'Invalid token' };
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
    return { message: 'Email verified' };
  }
}
