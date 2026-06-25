import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  public email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  public password: string;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  public rememberMe?: boolean = false;
}
