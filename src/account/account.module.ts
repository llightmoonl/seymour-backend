import { Module } from '@nestjs/common';
import { AccountService } from './account.service.js';
import { AccountController } from './account.controller.js';

@Module({
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
