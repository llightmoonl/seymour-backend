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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminDocsService } from './admin-docs.service.js';
import { CreateDocDto } from './dto/create-doc.dto.js';
import { UpdateDocDto } from './dto/update-doc.dto.js';
import { QueryDocsDto } from './dto/query-docs.dto.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ApiCookieAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('admin/docs')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/docs')
export class AdminDocsController {
  constructor(private readonly adminDocsService: AdminDocsService) {}

  @Get('stats')
  getStats() {
    return this.adminDocsService.getStats();
  }

  @Get()
  findAll(@Query() dto: QueryDocsDto) {
    return this.adminDocsService.findAll(dto);
  }

  @Post()
  create(@Body() dto: CreateDocDto, @CurrentUser('id') authorId: string) {
    return this.adminDocsService.create(dto, authorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminDocsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDocDto) {
    return this.adminDocsService.update(id, dto);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.adminDocsService.publish(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.adminDocsService.approve(id);
  }

  @Post(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.adminDocsService.unpublish(id);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.adminDocsService.archive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.adminDocsService.remove(id);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  incrementView(@Param('id') id: string) {
    return this.adminDocsService.incrementView(id);
  }

  @Get(':id/export')
  @ApiQuery({ name: 'format', enum: ['pdf', 'md'], required: false })
  exportDoc(
    @Param('id') id: string,
    @Query('format') format: 'md' | 'pdf' = 'md',
    @Res() res: Response,
  ) {
    return this.adminDocsService.exportDoc(id, format, res);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  importDoc(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') authorId: string,
  ) {
    return this.adminDocsService.importDoc(
      file.buffer.toString('utf-8'),
      authorId,
    );
  }
}
