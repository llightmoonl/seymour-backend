import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto.js';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, dto: PaginationQueryDto) {
    const { page = 1, limit = 6 } = dto;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          researchId: true,
          createdAt: true,
          research: { select: { title: true } },
        },
      }),
      this.prisma.activity.count({ where: { userId } }),
    ]);

    const mapped = items.map((a) => ({
      id: a.id,
      type: a.type,
      researchId: a.researchId,
      researchTitle: a.research.title,
      createdAt: a.createdAt,
    }));

    return paginate(mapped, total, page, limit);
  }
}
