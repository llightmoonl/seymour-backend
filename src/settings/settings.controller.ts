import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { UpdateAppearanceDto } from './dto/update-appearance.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('settings')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Patch('appearance')
  updateAppearance(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAppearanceDto,
  ) {
    return this.settingsService.updateAppearance(userId, dto);
  }
}
