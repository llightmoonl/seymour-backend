import { IsString } from 'class-validator';

export class GenerateWeightDto {
  @IsString()
  id: string;
}
