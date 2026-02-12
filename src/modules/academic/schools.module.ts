import { Module } from '@nestjs/common';
import { SchoolController } from './presentation/school.controller';
import { SubjectController } from './presentation/subject.controller';
import { AllocationController } from './presentation/allocation.controller';
import { CreateSchoolUseCase } from './application/use-cases/create-school.use-case';
import { GetSchoolsByAdminUseCase } from './application/use-cases/get-school-by-admin-id.use-case';
import { ListActiveSchoolsUseCase } from './application/use-cases/list-active-schools.use-case';
import { GetSchoolByIdUseCase } from './application/use-cases/get-school-by-id.use-case';
import { CreateSubjectUseCase } from './application/use-cases/create-subject.use-case';
import { ListSubjectsBySchoolUseCase } from './application/use-cases/list-subjects-by-school.use-case';
import { CreateAllocationUseCase } from './application/use-cases/create-allocation.use-case';
import { ListAllocationsByTeacherUseCase } from './application/use-cases/list-allocations-by-teacher.use-case';
import { SchoolRepository } from './domain/school.repository';
import { SubjectRepository } from './domain/subject.repository';
import { AllocationRepository } from './domain/allocation.repository';
import { InMemorySchoolRepository } from './infrastructure/persistence/in-memory-school.repository';
import { InMemorySubjectRepository } from './infrastructure/persistence/in-memory-subject.repository';
import { InMemoryAllocationRepository } from './infrastructure/persistence/in-memory-allocation.repository';
import { UserModules } from '../users/users.module';

@Module({
  imports: [UserModules],
  controllers: [SchoolController, SubjectController, AllocationController],
  providers: [
    CreateSchoolUseCase,
    GetSchoolByIdUseCase,
    ListActiveSchoolsUseCase,
    GetSchoolsByAdminUseCase,
    CreateSubjectUseCase,
    ListSubjectsBySchoolUseCase,
    CreateAllocationUseCase,
    ListAllocationsByTeacherUseCase,
    {
      provide: SchoolRepository,
      useClass: InMemorySchoolRepository,
    },
    {
      provide: SubjectRepository,
      useClass: InMemorySubjectRepository,
    },
    {
      provide: AllocationRepository,
      useClass: InMemoryAllocationRepository,
    },
  ],
  exports: [SchoolRepository, SubjectRepository, AllocationRepository],
})
export class SchoolsModule {}
