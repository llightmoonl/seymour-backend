import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: ['STUDENT', 'TEACHER', 'ADMIN'] })
  @IsOptional()
  @IsEnum(['STUDENT', 'TEACHER', 'ADMIN'])
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  group?: string;

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'BLOCKED'])
  status?: string;
}
