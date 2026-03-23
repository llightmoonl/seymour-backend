import { Injectable } from '@nestjs/common';
import { GenerateWeightDto, LearningNeuroDto } from './dto/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { GenerateDataDto } from './dto/generate-data.dto.js';

@Injectable()
export class HebbianService {
  constructor(private prisma: PrismaService) {}

  async generateData(dto: GenerateDataDto) {
    const { id, x } = dto;
    const algorithm = await this.prisma.algorithm.findUnique({ where: { id } });

    if (!algorithm) {
      throw new Error(`Algorithm with id ${id} not found`);
    }

    if (algorithm.x !== null) {
      throw new Error('You have already filled in the X field.');
    }

    return this.prisma.algorithm.update({
      where: { id },
      data: { x },
    });
  }

  copyWeight(w: number[][]) {
    return w.map((row) => [...row]);
  }

  defaultValue() {
    return Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => 0));
  }

  algorithmHebbian(x: number[][], y: number, w: number[][]) {
    const newW = this.copyWeight(w);

    for (let i = 0; i < x.length; i++) {
      for (let j = 0; j < x[i].length; j++) {
        if (y === 0) {
          newW[i][j] += x[i][j];
        } else {
          newW[i][j] -= x[i][j];
        }
      }
    }
    return newW;
  }

  activation(xElement: number, wElement: number, s: number) {
    return s + xElement * wElement;
  }

  generateWeight(dto: GenerateWeightDto) {
    const { x, w, number, neuron } = dto;
    let error = 0; // pseudo
    let epoch = 0; // pseudo
    let newW = this.copyWeight(w);
    let s = this.activation(x[i][j], w[j], s);

    if (j <= 15) {
      let y = s >= neuron ? 1 : 0;

      if (y !== number) {
        error++;
        newW = this.algorithmHebbian(x, y, newW);
      }

      return {
        x: x,
        y: y,
        w: newW,
        s: s,
        neuron: neuron,
        isLearning: true,
        isHebbian: true,
      };
    }

    if(error) {
      error = 0;
      epoch++;
    }
  }

  learningNeuro(dto: LearningNeuroDto) {
    const { x, w, number, neuron, learningSets, step, isHebbian } = dto;

    let newW = this.copyWeight(w);
    let s = this.activation(x, newW);
    let y = s >= neuron ? 1 : 0;

    if (y !== number) {
      newW = this.algorithmHebbian(x, y, newW);
      s = this.activation(x, newW);
      y = s >= neuron ? 1 : 0;

      return {
        x: x,
        y: y,
        w: newW,
        s: s,
        neuron: neuron,
        isLearning: true,
        isHebbian: true,
      };
    }

    if (learningSets.length > 1 && learningSets.length !== step && isHebbian) {
      let checkHebbian = false;
      s = this.activation(learningSets[step].x, newW);
      y = s >= neuron ? 1 : 0;

      if (y !== learningSets[step].number) {
        newW = this.algorithmHebbian(learningSets[step].x, y, newW);
        checkHebbian = true;
      }

      const response = {
        x: x,
        y: y,
        w: newW,
        s: s,
        neuron: neuron,
        step: step,
        isLearning: true,
      };

      if (checkHebbian) {
        response.step = 0;
      }
    }

    return {
      x: x,
      y: y,
      w: newW,
      s: s,
      neuron: neuron,
      step: step,
      isLearning: false,
      isHebbian: false,
    };
  }
}
