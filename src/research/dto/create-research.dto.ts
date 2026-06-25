import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

const ruleToType: Record<string, number> = {
  HEBB: 0,
  DELTA: 1,
  BACKPROP: 2,
};

export class CreateResearchDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  rule?: string;

  @IsOptional()
  @IsNumber()
  @Transform(
    ({ value, obj }: { value: unknown; obj: Record<string, unknown> }) => {
      if (value !== undefined) return value;
      const rule = obj['rule'];
      if (typeof rule === 'string') return ruleToType[rule] ?? 0;
      return 0;
    },
  )
  type?: number;
}
