import { Body, Controller, Delete, HttpCode, HttpStatus, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AccountService } from './account.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ApiBody, ApiCookieAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

class DeleteAccountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;
}

@ApiTags('account')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: DeleteAccountDto })
  deleteAccount(
    @CurrentUser('id') userId: string,
    @Body() body: DeleteAccountDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.accountService.requestDeletion(userId, body.password, res);
  }
}
