import { Module } from '@nestjs/common';
import { SchoolController } from './presentation/school.controller';
import { SubjectController } from './presentation/subject.controller';
import { AllocationController } from './presentation/allocation.controller';
import { TimeSlotController } from './presentation/time-slot.controller';
import { ScheduleController } from './presentation/schedule.controller';
import { CreateSchoolUseCase } from './application/use-cases/school/create-school.use-case';
import { GetSchoolsByAdminUseCase } from './application/use-cases/school/get-school-by-admin-id.use-case';
import { ListActiveSchoolsUseCase } from './application/use-cases/school/list-active-schools.use-case';
import { GetSchoolByIdUseCase } from './application/use-cases/school/get-school-by-id.use-case';
import { CreateSubjectUseCase } from './application/use-cases/subject/create-subject.use-case';
import { ListSubjectsBySchoolUseCase } from './application/use-cases/subject/list-subjects-by-school.use-case';
import { CreateAllocationUseCase } from './application/use-cases/allocation/create-allocation.use-case';
import { ListAllocationsByTeacherUseCase } from './application/use-cases/allocation/list-allocations-by-teacher.use-case';
import { CreateTimeSlotUseCase } from './application/use-cases/scheduling/create-time-slot.use-case';
import { CreateScheduleUseCase } from './application/use-cases/scheduling/create-schedule.use-case';
import { ListSchoolGridUseCase } from './application/use-cases/scheduling/list-school-grid.use-case';
import { SchoolRepository } from './domain/school/school.repository';
import { SubjectRepository } from './domain/subject/subject.repository';
import { AllocationRepository } from './domain/allocation/allocation.repository';
import { TimeSlotRepository } from './domain/scheduling/time-slot.repository';
import { ScheduleRepository } from './domain/scheduling/schedule.repository';
import { InMemorySchoolRepository } from './infrastructure/persistence/school/in-memory-school.repository';
import { InMemorySubjectRepository } from './infrastructure/persistence/subject/in-memory-subject.repository';
import { InMemoryAllocationRepository } from './infrastructure/persistence/allocation/in-memory-allocation.repository';
import { InMemoryTimeSlotRepository } from './infrastructure/persistence/scheduling/in-memory-time-slot.repository';
import { InMemoryScheduleRepository } from './infrastructure/persistence/scheduling/in-memory-schedule.repository';
import { UserModules } from '../users/users.module';

@Module({
  imports: [UserModules],
  controllers: [
    SchoolController,
    SubjectController,
    AllocationController,
    TimeSlotController,
    ScheduleController,
  ],
  providers: [
    CreateSchoolUseCase,
    GetSchoolByIdUseCase,
    ListActiveSchoolsUseCase,
    GetSchoolsByAdminUseCase,
    CreateSubjectUseCase,
    ListSubjectsBySchoolUseCase,
    CreateAllocationUseCase,
    ListAllocationsByTeacherUseCase,
    CreateTimeSlotUseCase,
    CreateScheduleUseCase,
    ListSchoolGridUseCase,
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
    {
      provide: TimeSlotRepository,
      useClass: InMemoryTimeSlotRepository,
    },
    {
      provide: ScheduleRepository,
      useClass: InMemoryScheduleRepository,
    },
  ],
  exports: [
    SchoolRepository,
    SubjectRepository,
    AllocationRepository,
    TimeSlotRepository,
    ScheduleRepository,
  ],
})
export class SchoolsModule {}
