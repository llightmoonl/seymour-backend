import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../../prisma/src/generated/prisma/client.js';
import { random, randomFloat } from '../lib/random.js';
import { CreateResearchDto, FindAllResearchDto } from './dto/index.js';

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateResearchDto) {
    const type = data.type ?? 0;
    const isDelta = type === 1;
    const isBackpropagation = type === 2;

    let algorithmRelation: Partial<Prisma.ResearchCreateInput>;

    if (isDelta) {
      algorithmRelation = {
        algorithmDelta: {
          create: {
            w: Array.from({ length: 3 }, () =>
              Array.from({ length: 16 }, () => random(1, 3)),
            ),
            y_pred: [0, 0, 0],
            i: 0,
            j: 0,
            k: 0,
            eta: randomFloat(0.05, 1),
            s: [0, 0, 0],
            epoch: 0,
            epsilon: [0, 0, 0],
            error: 0,
            isTrained: false,
            activeStage: 'generation',
          },
        },
      };
    } else if (isBackpropagation) {
      algorithmRelation = {
        algorithmPropagation: {
          create: {
            steps: 0,
            currentPass: 'forward',
          },
        },
      };
    } else {
      algorithmRelation = {
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
            correction: 'none',
            activeStage: 'generation',
          },
        },
      };
    }

    return this.prisma.research.create({
      data: {
        title: data.title,
        type,
        user: { connect: { id: userId } },
        ...algorithmRelation,
      },
    });
  }

  async findAll(userId: string, dto: FindAllResearchDto) {
    const {
      page,
      limit,
      search,
      filter,
      status,
      sort = 'updatedAt:desc',
    } = dto;
    const [field, direction] = sort.split(':') as [string, 'asc' | 'desc'];

    const filterMap: Record<string, number> = {
      hebbian: 0,
      delta: 1,
      backpropagation: 2,
    };

    const where: Prisma.ResearchWhereInput = { userId };

    if (filter && filter !== 'all' && filterMap[filter] !== undefined)
      where.type = filterMap[filter];

    if (search)
      where.title = { contains: search, mode: 'insensitive' as const };

    if (status)
      where.status = status as Prisma.EnumProjectStatusFilter['equals'];

    const [research, totalCount] = await this.prisma.$transaction([
      this.prisma.research.findMany({
        where,
        orderBy: { [field]: direction },
        skip: (page - 1) * limit,
        take: +limit,
      }),
      this.prisma.research.count({ where }),
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
