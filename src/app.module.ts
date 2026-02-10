import { Module } from '@nestjs/common';
import { UserModules } from './modules/users/users.module';

@Module({
  imports: [UserModules],
  controllers: [],
  providers: [],
})
export class AppModule {}
