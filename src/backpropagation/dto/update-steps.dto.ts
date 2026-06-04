import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DataDto {
  @IsNumber()
  steps: number;
}

export class UpdateStepsDto {
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => DataDto)
  data: DataDto;
}
