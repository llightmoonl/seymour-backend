import { IsArray, IsNumber, IsString } from 'class-validator';

export class RecognitionDto {
  @IsString()
  id: string;

  @IsArray()
  @IsNumber({}, { each: true })
  x: number[];
}
