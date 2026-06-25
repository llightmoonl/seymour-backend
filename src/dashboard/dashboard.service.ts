import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const [
      totalProjects,
      trained,
      inProgress,
      hebbCount,
      deltaCount,
      backpropCount,
    ] = await this.prisma.$transaction([
      this.prisma.research.count({ where: { userId } }),
      this.prisma.research.count({ where: { userId, status: 'TRAINED' } }),
      this.prisma.research.count({ where: { userId, status: 'IN_PROGRESS' } }),
      this.prisma.research.count({ where: { userId, type: 0 } }),
      this.prisma.research.count({ where: { userId, type: 1 } }),
      this.prisma.research.count({ where: { userId, type: 2 } }),
    ]);

    const distribution = [
      { rule: 'HEBBIAN', count: hebbCount },
      { rule: 'DELTA', count: deltaCount },
      { rule: 'BACKPROPAGATION', count: backpropCount },
    ].filter((d) => d.count > 0);

    return { totalProjects, trained, inProgress, distribution };
  }
}
