import { IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllResearchDto {
  @Type(() => Number)
  @IsInt()
  page: number;

  @Type(() => Number)
  @IsInt()
  limit: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  filter?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\w+:(asc|desc)$/)
  sort?: string = 'updatedAt:desc';
}
