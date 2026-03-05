import { Module } from '@nestjs/common';
import { HebbianService } from './hebbian.service.js';
import { HebbianGateway } from './hebbian.gateway.js';

@Module({
  providers: [HebbianService, HebbianGateway],
})
export class HebbianModule {}
