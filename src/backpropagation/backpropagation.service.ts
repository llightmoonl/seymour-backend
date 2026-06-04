import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateStepsDto } from './dto/index.js';
import { FindUniqueDto } from './dto/index.js';

@Injectable()
export class BackpropagationService {
  constructor(private prisma: PrismaService) {}

  async updateSteps(dto: UpdateStepsDto) {
    const { id, data } = dto;

    const FORWARD_LAST_STEP = 5;
    const FIRST_STEPS = 0;
    const LAST_STEPS = 13;

    const isStepsBoundaries =
      data.steps >= FIRST_STEPS && data.steps <= LAST_STEPS;

    if (!id) {
      throw new NotFoundException('The id does not exist');
    }

    if (!isStepsBoundaries) {
      throw new BadRequestException(
        'You have gone beyond the boundary of steps',
      );
    }

    const currentPass = data.steps > FORWARD_LAST_STEP ? 'backward' : 'forward';
    return this.prisma.research.update({
      where: { id },
      data: {
        algorithmPropagation: {
          update: {
            steps: data.steps,
            currentPass,
          },
        },
      },
    });
  }

  async findUnique(dto: FindUniqueDto) {
    const { id } = dto;

    const research = await this.prisma.research.findUnique({
      where: { id },
      include: {
        algorithm: true,
      },
    });

    if (!research) throw new Error(`Research with ID ${id} not found`);

    return research.algorithm;
  }
}
