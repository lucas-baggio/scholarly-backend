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
import { PrismaSchoolRepository } from './infrastructure/persistence/school/prisma-school.repository';
import { PrismaSubjectRepository } from './infrastructure/persistence/subject/prisma-subject.repository';
import { PrismaAllocationRepository } from './infrastructure/persistence/allocation/prisma-allocation.repository';
import { PrismaTimeSlotRepository } from './infrastructure/persistence/scheduling/prisma-time-slot.repository';
import { PrismaScheduleRepository } from './infrastructure/persistence/scheduling/prisma-schedule.repository';
import { SchoolMapper } from './infrastructure/persistence/school/school.mapper';
import { SubjectMapper } from './infrastructure/persistence/subject/subject.mapper';
import { AllocationMapper } from './infrastructure/persistence/allocation/allocation.mapper';
import { TimeSlotMapper } from './infrastructure/persistence/scheduling/time-slot.mapper';
import { ScheduleMapper } from './infrastructure/persistence/scheduling/schedule.mapper';
import { UserModules } from '../users/users.module';
import { PrismaService } from '../../prisma/prisma.service';

const usePrisma = !!process.env.DATABASE_URL;

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
      useFactory: (prisma: PrismaService) =>
        usePrisma
          ? new PrismaSchoolRepository(prisma, SchoolMapper)
          : new InMemorySchoolRepository(),
      inject: [PrismaService],
    },
    {
      provide: SubjectRepository,
      useFactory: (prisma: PrismaService) =>
        usePrisma
          ? new PrismaSubjectRepository(prisma, SubjectMapper)
          : new InMemorySubjectRepository(),
      inject: [PrismaService],
    },
    {
      provide: AllocationRepository,
      useFactory: (prisma: PrismaService) =>
        usePrisma
          ? new PrismaAllocationRepository(prisma, AllocationMapper)
          : new InMemoryAllocationRepository(),
      inject: [PrismaService],
    },
    {
      provide: TimeSlotRepository,
      useFactory: (prisma: PrismaService) =>
        usePrisma
          ? new PrismaTimeSlotRepository(prisma, TimeSlotMapper)
          : new InMemoryTimeSlotRepository(),
      inject: [PrismaService],
    },
    {
      provide: ScheduleRepository,
      useFactory: (prisma: PrismaService) =>
        usePrisma
          ? new PrismaScheduleRepository(prisma, ScheduleMapper)
          : new InMemoryScheduleRepository(),
      inject: [PrismaService],
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
