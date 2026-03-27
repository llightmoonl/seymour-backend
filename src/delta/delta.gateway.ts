import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { DeltaService } from './delta.service.js';
import { GenerateWeightDto } from './dto/index.js';

@WebSocketGateway(3002, {
  namespace: 'hebbian',
  cors: {
    origin: '*',
  },
})
export class DeltaGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly hebbianService: DeltaService) {}

  @SubscribeMessage('generateWeight')
  generateWeight(@MessageBody() generateWeightDto: GenerateWeightDto) {
    return this.hebbianService.generateWeight(generateWeightDto);
  }
}
