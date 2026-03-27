import { Module } from '@nestjs/common';
import { DeltaService } from './delta.service.js';
import { DeltaGateway } from './delta.gateway.js';
import { DeltaController } from './delta.controller.js';

@Module({
  controllers: [DeltaController],
  providers: [DeltaService, DeltaGateway],
})
export class DeltaModule {}
