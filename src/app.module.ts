import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HebbianModule } from './hebbian/hebbian.module';

@Module({
  imports: [HebbianModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
