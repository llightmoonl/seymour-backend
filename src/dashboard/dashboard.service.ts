import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const [totalProjects, trained, inProgress, hebbCount, deltaCount, backpropCount] =
      await this.prisma.$transaction([
        this.prisma.project.count({ where: { userId } }),
        this.prisma.project.count({ where: { userId, status: 'TRAINED' } }),
        this.prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
        this.prisma.project.count({ where: { userId, rule: 'HEBB' } }),
        this.prisma.project.count({ where: { userId, rule: 'DELTA' } }),
        this.prisma.project.count({ where: { userId, rule: 'BACKPROP' } }),
      ]);

    const distribution = [
      { rule: 'HEBB', count: hebbCount },
      { rule: 'DELTA', count: deltaCount },
      { rule: 'BACKPROP', count: backpropCount },
    ].filter((d) => d.count > 0);

    return { totalProjects, trained, inProgress, distribution };
  }
}
