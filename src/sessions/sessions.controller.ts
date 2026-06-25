import { Controller, Delete, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { RequestUser } from '../auth/interfaces/index.js';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('sessions')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.sessionsService.findAll(user.id, user.sessionId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteOne(@CurrentUser() user: RequestUser, @Param('id') sessionId: string) {
    return this.sessionsService.deleteOne(user.id, sessionId, user.sessionId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAllExceptCurrent(@CurrentUser() user: RequestUser) {
    return this.sessionsService.deleteAllExceptCurrent(user.id, user.sessionId);
  }
}
