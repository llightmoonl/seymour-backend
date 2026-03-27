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
export class DeltaService {
  constructor(private prisma: PrismaService) {}

  async generateData(dto: GenerateDataDto) {
    const { id, data } = dto;

    return this.prisma.research.update({
      where: { id },
      data: {
        algorithmDelta: {
          update: {
            data: data as unknown as InputJsonValue,
          },
        },
      },
    });
  }

  algorithmDelta(x: number[], epsilon: number, w: number[], n: number) {
    const newW = [...w];
    for (let i = 0; i < newW.length; i++) {
      newW[i] += n * epsilon * x[i];
    }
    return newW;
  }

  activation(xElement: number, wElement: number, s: number) {
    return s + xElement * wElement;
  }

  calculateActivation(x: number[], w: number[][]) {
    const xWithBias = [1, ...x];
    return w.map((wi) =>
      xWithBias.reduce((acc, val, i) => acc + val * wi[i], 0),
    );
  }

  async generateWeight(dto: GenerateWeightDto) {
    const { id } = dto;

    const research = await this.prisma.research.findUnique({
      where: { id },
      include: {
        algorithmDelta: true,
      },
    });

    const algorithm = research?.algorithmDelta;
    if (!algorithm) throw new Error(`AlgorithmDelta with ID ${id} not found`);

    const { data, w, eta } = algorithm;
    let { i, j, k, epoch, isTrained } = algorithm;

    let error = (algorithm.error ?? 0) as number;
    const epsilon = (algorithm.epsilon ?? [0, 0, 0]) as number[];

    const newW = (w as number[][]).map((row) => [...row]);
    const sArr = [...(algorithm.s as number[])];
    let y_pred = [...(algorithm.y_pred as number[])];

    if (!data) throw new Error(`No data found for algorithm ${id}.`);

    const item = data[i] as DataDto;
    const x = item?.x;
    const y_true = item?.y_true;
    const xWithBias = [1, ...x];

    if (!isTrained) {
      sArr[k] = this.activation(xWithBias[j], newW[k][j], sArr[k]);

      k++;

      if (k === 3) {
        k = 0;
        j++;
      }

      if (j === 16) {
        j = 0;
        y_pred = sArr.map((si) => (si >= 0 ? 1 : 0));

        let hasError = false;
        for (let m = 0; m < 3; m++) {
          epsilon[m] = y_true[m] - y_pred[m];
          if (epsilon[m] !== 0) {
            hasError = true;
            newW[m] = this.algorithmDelta(xWithBias, epsilon[m], newW[m], eta);
          }
        }

        if (hasError) error++;

        sArr.fill(0);

        const dataArr = data as unknown as DataDto[];
        if (i === dataArr.length - 1) {
          i = 0;
          if (error === 0) {
            isTrained = true;
          } else {
            error = 0;
            epoch++;
          }
        } else {
          i++;
        }
      }
    }

    await this.prisma.research.update({
      where: { id },
      data: {
        algorithmDelta: {
          update: {
            w: newW,
            i,
            j,
            k,
            s: sArr,
            y_pred,
            epsilon,
            epoch,
            error,
            isTrained,
          },
        },
      },
    });

    return {
      w: newW,
      i,
      j,
      k,
      s: sArr,
      y_pred,
      epoch,
      epsilon,
      error,
      isTrained,
    };
  }

  async recognition(dto: RecognitionDto) {
    const { x, id } = dto;
    const research = await this.prisma.research.findUnique({
      where: { id },
      include: {
        algorithmDelta: true,
      },
    });

    const algorithm = research?.algorithmDelta;

    if (!algorithm) throw new Error(`Algorithm with id ${id} not found`);

    const w = algorithm.w as number[][];
    const s = this.calculateActivation(x, w);
    const y_pred = s.map((si) => (si >= 0 ? 1 : 0));

    let result = 'Ошибка';

    if (y_pred[0] === 1) result = 'Буква A';
    else if (y_pred[1] === 1) result = 'Буква B';
    else if (y_pred[2] === 1) result = 'Буква C';

    await this.prisma.research.update({
      where: { id },
      data: {
        algorithmDelta: {
          update: {
            data: { s, y_pred },
          },
        },
      },
    });

    return { result, y_pred, s };
  }

  async findUnique(dto: FindUniqueDto) {
    const { id } = dto;

    const research = await this.prisma.research.findUnique({
      where: { id },
      include: { algorithmDelta: true },
    });

    if (!research) throw new Error(`Research with ID ${id} not found`);

    return research.algorithmDelta;
  }
}
