import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';

export class FindProjectsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['DRAFT', 'IN_PROGRESS', 'TRAINED'] })
  @IsOptional()
  @IsEnum(['DRAFT', 'IN_PROGRESS', 'TRAINED'])
  status?: string;

  @ApiPropertyOptional({ enum: ['HEBB', 'DELTA', 'BACKPROP'] })
  @IsOptional()
  @IsEnum(['HEBB', 'DELTA', 'BACKPROP'])
  rule?: string;

  @ApiPropertyOptional({ example: 'updatedAt:desc' })
  @IsOptional()
  @IsString()
  @Matches(/^\w+:(asc|desc)$/)
  sort?: string = 'updatedAt:desc';
}
