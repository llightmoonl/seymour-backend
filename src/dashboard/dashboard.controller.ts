import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@CurrentUser('id') userId: string) {
    return this.dashboardService.getSummary(userId);
  }
}
