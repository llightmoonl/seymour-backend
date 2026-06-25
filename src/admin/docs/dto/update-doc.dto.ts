import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDocDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: ['BASICS', 'ALGORITHMS', 'ADVANCED', 'OTHER'] })
  @IsOptional()
  @IsEnum(['BASICS', 'ALGORITHMS', 'ADVANCED', 'OTHER'])
  section?: string;

  @ApiPropertyOptional({ enum: ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'] })
  @IsOptional()
  @IsEnum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'])
  status?: string;

  @ApiPropertyOptional({ enum: ['ALL', 'STUDENTS', 'TEACHERS'] })
  @IsOptional()
  @IsEnum(['ALL', 'STUDENTS', 'TEACHERS'])
  visibility?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentMd?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
