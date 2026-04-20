import { Injectable } from '@nestjs/common';
import {
  GenerateWeightDto,
  DataDto,
  GenerateDataDto,
  RecognitionDto,
  FindUniqueDto,
} from './dto/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { InputJsonValue } from '@prisma/client/runtime/client';

@Injectable()
export class HebbianService {
  constructor(private prisma: PrismaService) {}

  async generateData(dto: GenerateDataDto) {
    const { id, data } = dto;

    return this.prisma.research.update({
      where: { id },
      data: {
        algorithm: {
          update: {
            data: data as unknown as InputJsonValue,
          },
        },
      },
    });
  }

  algorithmHebbian(x: number[], yPred: number, yTrue: number, w: number[]) {
    const newW = [...w];
    let correction: 'plus' | 'minus' | 'none' = 'none';

    for (let i = 0; i < x.length; i++) {
      if (yTrue === 1 && yPred === 0) {
        newW[i] += x[i];
        correction = 'plus';
      } else if (yTrue === 0 && yPred === 1) {
        newW[i] -= x[i];
        correction = 'minus';
      }
    }
    return { newW, correction };
  }

  activation(xElement: number, wElement: number, s: number) {
    return s + xElement * wElement;
  }

  calculateActivation(x: number[], w: number[]) {
    return x.reduce((acc, val, i) => acc + val * w[i], 0);
  }

  async generateWeight(dto: GenerateWeightDto) {
    const { id } = dto;

    const research = await this.prisma.research.findUnique({
      where: { id },
      include: {
        algorithm: true,
      },
    });

    const algorithm = research?.algorithm;

    if (!algorithm) throw new Error(`Algorithm with ID ${id} not found`);

    const { data, w, neuron } = algorithm;
    let { i, j, y_pred, s, epoch, error, isTrained } = algorithm;

    if (!data) throw new Error(`No data found for algorithm ${id}.`);

    const item = data[i] as DataDto;
    const x = item?.x;
    const y_true = item?.y_true;

    let newW = [...(w as number[])];
    let correction = 'none';

    if (!isTrained) {
      s = this.activation(x[j], newW[j], s);

      j++;
      if (j === 15) {
        j = 0;
        y_pred = s >= neuron ? 1 : 0;

        if (y_pred !== y_true) {
          error++;
          const result = this.algorithmHebbian(x, y_pred, y_true, newW);
          newW = result.newW;
          correction = result.correction;
        }

        s = 0;

        if (i === 9) {
          i = 0;

          if (error) {
            error = 0;
            epoch++;
          } else {
            isTrained = true;
          }
        } else {
          i++;
        }
      }
    }

    await this.prisma.research.update({
      where: { id },
      data: {
        algorithm: {
          update: {
            data: {
              w: newW,
              i,
              j,
              s,
              y_pred,
              epoch,
              error,
              isTrained,
              correction: correction,
            },
          },
        },
      },
    });

    return {
      w: newW,
      i,
      j,
      s,
      y_pred,
      y_true,
      epoch,
      error,
      isTrained,
      correction,
    };
  }

  async recognition(dto: RecognitionDto) {
    const { x, id } = dto;
    const research = await this.prisma.research.findUnique({
      where: { id },
      include: {
        algorithm: true,
      },
    });

    const algorithm = research?.algorithm;

    if (!algorithm) throw new Error(`Algorithm with id ${id} not found`);

    const { w, neuron } = algorithm;
    const newW = [...(w as number[])];
    const newS = this.calculateActivation(x, newW);

    await this.prisma.research.update({
      where: { id },
      data: {
        algorithm: {
          update: {
            data: { s: newS },
          },
        },
      },
    });

    return {
      result: this.calculateActivation(x, newW) >= neuron ? 1 : 0,
    };
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
