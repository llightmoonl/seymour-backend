import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HebbianModule } from './hebbian/hebbian.module.js';
import { DeltaModule } from './delta/delta.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ResearchModule } from './research/research.module.js';
import { DocsModule } from './docs/docs.module.js';

@Module({
  imports: [
    HebbianModule,
    DeltaModule,
    PrismaModule,
    ResearchModule,
    DocsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
