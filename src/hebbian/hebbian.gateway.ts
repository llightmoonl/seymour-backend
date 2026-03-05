import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { HebbianService } from './hebbian.service.js';
import { GenerateWeightDto, LearningNeuroDto } from './dto/index.js';

@WebSocketGateway(3002, {
  namespace: 'hebbian',
  cors: {
    origin: '*',
  },
})
export class HebbianGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly hebbianService: HebbianService) {}

  @SubscribeMessage('generateWeight')
  generateWeight(@MessageBody() generateWeightDto: GenerateWeightDto) {
    return this.hebbianService.generateWeight(generateWeightDto);
  }

  @SubscribeMessage('learningNeuro')
  learningNeuro(@MessageBody() learningNeuroDto: LearningNeuroDto) {
    return this.hebbianService.learningNeuro(learningNeuroDto);
  }
}
