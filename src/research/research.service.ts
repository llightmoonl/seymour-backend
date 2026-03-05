import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../../prisma/src/generated/prisma/client.js';
import { random } from "../lib/random.js";

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ResearchCreateInput) {
      const newData: Prisma.ResearchCreateInput = {
          ...data,
          algorithm: {
              create: {
                  w: Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => random(1, 3))),
                  y: 0,
                  neuron: random(1, 3),
                  s: 0,
                  epoch: 0,
              }
          }
      }
      return this.prisma.research.create({ data: newData })
  }
}
