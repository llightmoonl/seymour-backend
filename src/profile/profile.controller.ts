import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ApiBody, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class VerifyTokenDto {
  @ApiProperty()
  @IsString()
  token: string;
}

@ApiTags('profile')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUser('id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Patch()
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(userId, dto);
  }

  @Post('email/verify/request')
  requestEmailVerify(@CurrentUser('id') userId: string) {
    return this.profileService.requestEmailVerify(userId);
  }

  @Post('email/verify/confirm')
  @ApiBody({ type: VerifyTokenDto })
  confirmEmailVerify(
    @CurrentUser('id') userId: string,
    @Body('token') token: string,
  ) {
    return this.profileService.confirmEmailVerify(userId, token);
  }
}
