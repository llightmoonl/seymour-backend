import {IsInt, IsString} from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllResearchDto {
  @Type(() => Number)
  @IsInt()
  page: number;

  @Type(() => Number)
  @IsInt()
  limit: number;

  @IsString()
  search?: string;
}
