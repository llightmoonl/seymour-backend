import { Module } from '@nestjs/common';
import { HebbianService } from './hebbian.service';
import { HebbianController } from './hebbian.controller';

@Module({
  controllers: [HebbianController],
  providers: [HebbianService],
})
export class HebbianModule {}
