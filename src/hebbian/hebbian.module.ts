import { Module } from '@nestjs/common';
import { HebbianService } from './hebbian.service.js';
import { HebbianController } from './hebbian.controller.js';

@Module({
  controllers: [HebbianController],
  providers: [HebbianService],
})
export class HebbianModule {}
