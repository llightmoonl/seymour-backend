import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { DocsService } from './docs.service.js';
import { CreateDocDto } from './dto/create-doc.dto.js';
import { UpdateDocDto } from './dto/update-doc.dto.js';

@Controller('docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Post()
  create(@Body() dto: CreateDocDto) {
    return this.docsService.create(dto);
  }

  @Get()
  findAll() {
    return this.docsService.findAll(true);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.docsService.findOne(slug, true);
  }

  @Patch(':id')
  update(@Param('slug') slug: string, @Body() dto: UpdateDocDto) {
    return this.docsService.update(slug, dto);
  }

  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.docsService.remove(slug);
  }
}
