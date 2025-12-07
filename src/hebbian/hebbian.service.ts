import { Injectable } from '@nestjs/common';
import { GenerateWeightDto } from './dto/generate-weight.dto';
import { LearningNeuroDto } from './dto/learning-neuro.dto';

@Injectable()
export class HebbianService {
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

  activation(x: number[][], w: number[][]) {
    let s = 0;
    for (let i = 0; i < x.length; i++) {
      for (let j = 0; j < x[i].length; j++) {
        s += x[i][j] * w[i][j];
      }
    }

    return s;
  }

  generateWeight(dto: GenerateWeightDto) {
    const { x, w, number, neuron } = dto;
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

    return {
      x: this.defaultValue(),
      y: y,
      w: newW,
      s: s,
      neuron: neuron,
      isLearning: false,
      isHebbian: false,
    };
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
