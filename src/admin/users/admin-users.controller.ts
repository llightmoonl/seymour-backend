import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AdminUsersService } from './admin-users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { QueryUsersDto } from './dto/query-users.dto.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('admin/users')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('stats')
  getStats() {
    return this.adminUsersService.getStats();
  }

  @Get('export')
  export(@Query() dto: QueryUsersDto, @Res() res: Response) {
    return this.adminUsersService.exportAllCsv(dto, res);
  }

  @Get()
  findAll(@Query() dto: QueryUsersDto) {
    return this.adminUsersService.findAll(dto);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.adminUsersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminUsersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser('id') currentUserId: string) {
    return this.adminUsersService.remove(id, currentUserId);
  }

  @Get(':id/projects')
  getUserProjects(@Param('id') id: string) {
    return this.adminUsersService.getUserProjects(id);
  }

  @Get(':id/projects/report')
  exportUserProjectsCsv(@Param('id') id: string, @Res() res: Response) {
    return this.adminUsersService.exportUserProjectsCsv(id, res);
  }
}
