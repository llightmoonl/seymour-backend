import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Иван Петров' })
  @IsString()
  public name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  public email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  public password: string;
}
