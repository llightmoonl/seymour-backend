import { Module } from '@nestjs/common';
import { ResearchService } from './research.service.js';
import { ResearchController } from './research.controller.js';

@Module({
  controllers: [ResearchController],
  providers: [ResearchService],
})
export class ResearchModule {}
