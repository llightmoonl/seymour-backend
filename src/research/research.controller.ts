import { Controller, Post, Body } from '@nestjs/common';
import { ResearchService } from './research.service.js';
import { CreateResearchDto } from './dto/create-research.dto.js';

@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  create(@Body() createResearchDto: CreateResearchDto) {
    return this.researchService.create(createResearchDto);
  }
}
