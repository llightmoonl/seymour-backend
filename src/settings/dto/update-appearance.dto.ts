import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAppearanceDto {
  @ApiPropertyOptional({ enum: ['LIGHT', 'DARK'] })
  @IsOptional()
  @IsEnum(['LIGHT', 'DARK'])
  theme?: 'LIGHT' | 'DARK';

  @ApiPropertyOptional({ enum: ['RU', 'EN'] })
  @IsOptional()
  @IsEnum(['RU', 'EN'])
  locale?: 'RU' | 'EN';
}
