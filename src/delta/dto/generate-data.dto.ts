import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class DataDto {
  @IsArray()
  x: number[];

  @IsArray()
  y_true: number[];
}

export class GenerateDataDto {
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => DataDto)
  data: DataDto[];
}
