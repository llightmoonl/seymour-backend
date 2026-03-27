import { IsString } from 'class-validator';

export class CompleteTabDto {
  @IsString()
  tab: string;
}
