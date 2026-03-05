import { Module } from '@nestjs/common';
import { HebbianService } from './hebbian.service.js';
import { HebbianGateway } from './hebbian.gateway.js';
import {HebbianController} from "./hebbian.controller.js";

@Module({
  controllers: [HebbianController],
  providers: [HebbianService, HebbianGateway],
})
export class HebbianModule {}
