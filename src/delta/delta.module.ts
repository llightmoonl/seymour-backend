import { Module } from '@nestjs/common';
import { DeltaService } from './delta.service.js';
import { DeltaController } from './delta.controller.js';

@Module({
  controllers: [DeltaController],
  providers: [DeltaService],
})
export class DeltaModule {}
