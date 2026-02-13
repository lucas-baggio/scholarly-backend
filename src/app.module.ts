import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModules } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { SchoolsModule } from './modules/academic/schools.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [PrismaModule, UserModules, AuthModule, HealthModule, SchoolsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
