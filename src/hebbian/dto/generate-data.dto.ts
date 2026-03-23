import { IsInt, IsArray} from 'class-validator';

export class GenerateDataDto {
  @IsInt()
  id: number;

  @IsArray()
  x: number[][][];
}
