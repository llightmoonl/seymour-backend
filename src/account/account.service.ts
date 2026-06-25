import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { verify } from 'argon2';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Response } from 'express';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async requestDeletion(
    userId: string,
    password: string | undefined,
    res: Response,
  ) {
    if (password) {
      const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
      const isValid = await verify(user.passwordHash, password);
      if (!isValid) throw new BadRequestException('Неверный пароль');
    }

    const deletionScheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletionRequestedAt: new Date(),
        deletionScheduledFor,
      },
    });

    await this.prisma.session.deleteMany({ where: { userId } });

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    return null;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupScheduledDeletions() {
    const result = await this.prisma.user.deleteMany({
      where: {
        deletionScheduledFor: { lte: new Date() },
      },
    });
    if (result.count > 0) {
      console.log(`[Cron] Deleted ${result.count} accounts scheduled for deletion`);
    }
  }
}
