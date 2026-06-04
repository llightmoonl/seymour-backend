import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HebbianModule } from './hebbian/hebbian.module.js';
import { DeltaModule } from './delta/delta.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ResearchModule } from './research/research.module.js';
import { DocsModule } from './docs/docs.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BackpropagationModule } from './backpropagation/backpropagation.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HebbianModule,
    DeltaModule,
    PrismaModule,
    ResearchModule,
    DocsModule,
    AuthModule,
    BackpropagationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
