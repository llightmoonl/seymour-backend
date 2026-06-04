import { Module } from '@nestjs/common';
import { BackpropagationService } from './backpropagation.service.js';
import { BackpropagationController } from './backpropagation.controller.js';

@Module({
  controllers: [BackpropagationController],
  providers: [BackpropagationService],
})
export class BackpropagationModule {}
