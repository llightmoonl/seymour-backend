import { IsString } from 'class-validator';

export type Stage = 'generation' | 'training' | 'quality' | 'recognition';

export class NextStageDto {
  @IsString()
  id: string;
}
