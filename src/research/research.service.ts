import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../../prisma/src/generated/prisma/client.js';

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ResearchCreateInput) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.research.create({ data });
      });
    } catch (error) {
      console.error(error);
    }
  }
}
