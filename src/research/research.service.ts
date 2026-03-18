import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../../prisma/src/generated/prisma/client.js';
import { random } from '../lib/random.js';
import { FindAllResearchDto } from './dto/find-all-research.dto.js';

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ResearchCreateInput) {
    const newData: Prisma.ResearchCreateInput = {
      ...data,
      algorithm: {
        create: {
          w: Array.from({ length: 5 }, () =>
            Array.from({ length: 3 }, () => random(1, 3)),
          ),
          y: 0,
          neuron: random(1, 3),
          s: 0,
          epoch: 0,
        },
      },
    };
    return this.prisma.research.create({ data: newData });
  }

  async findAll(dto: FindAllResearchDto) {
    const { page, limit } = dto;
    const [research, totalCount] = await this.prisma.$transaction([
      this.prisma.research.findMany({
        skip: (page - 1) * limit,
        take: +limit,
      }),
      this.prisma.research.count(),
    ]);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: research,
      pagination: {
        currentPage: +page,
        limit: +limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
