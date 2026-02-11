import { Module } from '@nestjs/common';
import { UserModules } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [UserModules, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
