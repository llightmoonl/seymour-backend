import { Controller, Post, Query, Body, Get, UseGuards } from '@nestjs/common';
import { ResearchService } from './research.service.js';
import { CreateResearchDto, FindAllResearchDto } from './dto/index.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('research')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() createResearchDto: CreateResearchDto,
  ) {
    return this.researchService.create(userId, createResearchDto);
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query() findAllResearchDto: FindAllResearchDto,
  ) {
    return this.researchService.findAll(userId, findAllResearchDto);
  }
}
