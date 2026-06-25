import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { FindProjectsDto } from './dto/find-projects.dto.js';
import { paginate } from '../common/dto/pagination.dto.js';
import { Prisma } from '../../prisma/src/generated/prisma/client.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, dto: FindProjectsDto) {
    const { page = 1, limit = 10, status, rule, sort = 'updatedAt:desc' } = dto;
    const [field, direction] = sort.split(':') as [string, 'asc' | 'desc'];
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = { userId };
    if (status) where.status = { equals: status as Prisma.EnumProjectStatusFilter['equals'] };
    if (rule) where.rule = { equals: rule as Prisma.EnumLearningRuleFilter['equals'] };

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [field]: direction },
        select: {
          id: true,
          name: true,
          rule: true,
          status: true,
          updatedAt: true,
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return paginate(items, total, page, limit);
  }
}
