import { IsString } from 'class-validator';

const STAGES = ['generation', 'training', 'quality', 'recognition'] as const;
export type Stage = (typeof STAGES)[number];

export class NextStageDto {
  @IsString()
  id: string;
}
