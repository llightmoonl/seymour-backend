export class LearningNeuroDto {
  x: number[][];
  w: number[][];
  number: number;
  neuron: number;
  learningSets: {
    x: number[][];
    number: number;
  }[];
  step: number;
  isHebbian: boolean;
}
