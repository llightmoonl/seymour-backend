import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { IsString } from 'class-validator';

class VerifyTokenDto {
  @ApiProperty()
  @IsString()
  token: string;
}

class AvatarUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}

const avatarStorage = diskStorage({
  destination: 'uploads/avatars',
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

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

  @Post('avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AvatarUploadDto })
  @UseInterceptors(FileInterceptor('file', { storage: avatarStorage }))
  uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp|gif)/ }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.profileService.updateAvatar(userId, file.filename);
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
