import { Controller, Post, Query, Body, Get, Param } from '@nestjs/common';
import { ResearchService } from './research.service.js';
import {
  CreateResearchDto,
  FindAllResearchDto,
  CompleteTabDto,
} from './dto/index.js';

@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  create(@Body() createResearchDto: CreateResearchDto) {
    return this.researchService.create(createResearchDto);
  }

  @Get()
  findAll(@Query() findAllResearchDto: FindAllResearchDto) {
    return this.researchService.findAll(findAllResearchDto);
  }

  @Get(':id/progress')
  getProgress(@Param('id') id: string) {
    return this.researchService.getProgress(id);
  }

  @Post(':id/progress/complete')
  completeTab(@Param('id') id: string, @Body() dto: CompleteTabDto) {
    return this.researchService.completeTab(id, dto.tab);
  }
}
