import { Controller, Get, Param } from '@nestjs/common';
import { DocsService } from './docs.service.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('docs')
@Controller('docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get()
  findAll() {
    return this.docsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.docsService.findOne(id);
  }
}
