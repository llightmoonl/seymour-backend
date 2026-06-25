import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateAppearanceDto } from './dto/update-appearance.dto.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateAppearance(userId: string, dto: UpdateAppearanceDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { theme: true, locale: true },
    });
    return user;
  }
}
