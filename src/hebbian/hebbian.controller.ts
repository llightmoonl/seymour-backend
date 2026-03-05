import { Controller, Post, Body } from '@nestjs/common';
import { HebbianService } from './hebbian.service.js';

@Controller('research')
export class HebbianController {
  constructor(private readonly HebbianService: HebbianService) {}

  @Post()
  create(@Body() createResearchDto: CreateResearchDto) {
    return this.HebbianService.create(createResearchDto);
  }
}
