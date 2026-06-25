import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { FindProjectsDto } from './dto/find-projects.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('projects')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() dto: FindProjectsDto) {
    return this.projectsService.findAll(userId, dto);
  }
}
