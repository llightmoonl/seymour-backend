import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDocsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['BASICS', 'ALGORITHMS', 'ADVANCED', 'OTHER'] })
  @IsOptional()
  @IsEnum(['BASICS', 'ALGORITHMS', 'ADVANCED', 'OTHER'])
  section?: string;

  @ApiPropertyOptional({ enum: ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'] })
  @IsOptional()
  @IsEnum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'])
  status?: string;

  @ApiPropertyOptional({ example: 'updatedAt:desc' })
  @IsOptional()
  @IsString()
  @Matches(/^\w+:(asc|desc)$/)
  sort?: string = 'updatedAt:desc';
}
