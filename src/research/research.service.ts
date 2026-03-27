import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../../prisma/src/generated/prisma/client.js';
import { random, randomFloat } from '../lib/random.js';
import { FindAllResearchDto } from './dto/find-all-research.dto.js';

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ResearchCreateInput) {
    const isDelta = data.type === 1;

    const newData: Prisma.ResearchCreateInput = {
      ...data,
      ...(isDelta
        ? {
            algorithmDelta: {
              create: {
                w: Array.from(
                  { length: 3 },
                  () => Array.from({ length: 16 }, () => random(1, 3)), // 3 нейрона, 16 весов (x₀..x₁₅)
                ),
                y_pred: [0, 0, 0],
                i: 0,
                j: 0,
                k: 0,
                eta: randomFloat(0.05, 1), // η
                s: [0, 0, 0],
                epoch: 0,
                epsilon: [0, 0, 0],
                error: 0,
                isTrained: false,
              },
            },
          }
        : {
            algorithm: {
              create: {
                w: Array.from({ length: 15 }, () => random(1, 3)),
                y_pred: 0,
                i: 0,
                j: 0,
                neuron: random(1, 3),
                s: 0,
                epoch: 0,
                error: 0,
                isTrained: false,
              },
            },
          }),
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

  getProgress(id: string) {
    return this.prisma.researchTab.findMany({
      where: { researchId: id },
      select: { key: true, completed: true },
    });
  }

  completeTab(id: string, tab: string) {
    return this.prisma.researchTab.upsert({
      where: { researchId_key: { researchId: id, key: tab } },
      create: { researchId: id, key: tab, completed: true },
      update: { completed: true },
      select: { key: true, completed: true },
    });
  }
}
