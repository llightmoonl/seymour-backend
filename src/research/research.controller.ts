import { Controller, Post, Query, Body, Get } from '@nestjs/common';
import { ResearchService } from './research.service.js';
import { CreateResearchDto } from './dto/create-research.dto.js';
import { FindAllResearchDto } from './dto/find-all-research.dto.js';

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
}
