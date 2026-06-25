import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service.js';
import { PaginationQueryDto } from '../common/dto/pagination.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('activity')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() dto: PaginationQueryDto) {
    return this.activityService.findAll(userId, dto);
  }
}
