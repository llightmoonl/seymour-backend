import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { ActivityModule } from './activity/activity.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { SessionsModule } from './sessions/sessions.module.js';
import { AccountModule } from './account/account.module.js';
import { AdminUsersModule } from './admin/users/admin-users.module.js';
import { AdminDocsModule } from './admin/docs/admin-docs.module.js';
import { HebbianModule } from './hebbian/hebbian.module.js';
import { DeltaModule } from './delta/delta.module.js';
import { BackpropagationModule } from './backpropagation/backpropagation.module.js';
import { ResearchModule } from './research/research.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    DashboardModule,
    ProjectsModule,
    ActivityModule,
    ProfileModule,
    SettingsModule,
    SessionsModule,
    AccountModule,
    AdminUsersModule,
    AdminDocsModule,
    HebbianModule,
    DeltaModule,
    BackpropagationModule,
    ResearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
