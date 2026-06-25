import { Module } from '@nestjs/common';
import { AdminDocsService } from './admin-docs.service.js';
import { AdminDocsController } from './admin-docs.controller.js';

@Module({
  controllers: [AdminDocsController],
  providers: [AdminDocsService],
})
export class AdminDocsModule {}
