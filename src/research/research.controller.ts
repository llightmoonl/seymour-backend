import { Controller, Post, Query, Body, Get } from '@nestjs/common';
import { ResearchService } from './research.service.js';
import { CreateResearchDto, FindAllResearchDto } from './dto/index.js';

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
