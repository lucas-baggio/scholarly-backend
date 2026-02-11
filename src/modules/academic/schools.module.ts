import { Get, Module } from '@nestjs/common';
import { SchoolController } from './presentation/school.controller';
import { CreateSchoolUseCase } from './application/use-cases/create-school.use-case';
import { GetSchoolsByAdminUseCase } from './application/use-cases/get-school-by-admin-id.use-case';
import { ListActiveSchoolsUseCase } from './application/use-cases/list-active-schools.use-case';
import { GetSchoolByIdUseCase } from './application/use-cases/get-school-by-id.use-case';
import { SchoolRepository } from './domain/school.repository';
import { InMemorySchoolRepository } from './infrastructure/persistence/in-memory-school.repository';
import { UserModules } from '../users/users.module';

@Module({
  imports: [UserModules],
  controllers: [SchoolController],
  providers: [
    CreateSchoolUseCase,
    GetSchoolByIdUseCase,
    ListActiveSchoolsUseCase,
    GetSchoolsByAdminUseCase,
    {
      provide: SchoolRepository,
      useClass: InMemorySchoolRepository,
    },
  ],
  exports: [SchoolRepository],
})
export class SchoolsModule {}
