import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AllocationRepository } from '../../domain/allocation.repository';
import { SchoolRepository } from '../../domain/school.repository';
import { SubjectRepository } from '../../domain/subject.repository';
import { UserRepository } from '../../../users/domain/user.repository';
import { Allocation } from '../../domain/allocation.entity';
import { CreateAllocationDto } from '../dtos/create-allocation.dto';
import { SchoolInactiveException } from '../../domain/exceptions/school-inactive.exception';

@Injectable()
export class CreateAllocationUseCase {
  constructor(
    private readonly allocationRepository: AllocationRepository,
    private readonly schoolRepository: SchoolRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: CreateAllocationDto): Promise<Allocation> {
    const teacher = await this.userRepository.findById(dto.teacherId);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${dto.teacherId} not found`);
    }
    if (!teacher.isTeacher()) {
      throw new NotFoundException(`User ${dto.teacherId} is not a teacher`);
    }

    const school = await this.schoolRepository.findById(dto.schoolId);
    if (!school) {
      throw new NotFoundException(`School with ID ${dto.schoolId} not found`);
    }
    if (!school.isActive) {
      throw new SchoolInactiveException(school.name);
    }

    const subject = await this.subjectRepository.findById(dto.subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${dto.subjectId} not found`);
    }
    if (subject.schoolId !== dto.schoolId) {
      throw new NotFoundException(
        `Subject ${dto.subjectId} does not belong to school ${dto.schoolId}`,
      );
    }

    const alreadyExists = await this.allocationRepository.exists(
      dto.teacherId,
      dto.schoolId,
      dto.subjectId,
    );
    if (alreadyExists) {
      throw new ConflictException(
        `Teacher is already allocated to this subject at this school`,
      );
    }

    const allocation = new Allocation({
      id: crypto.randomUUID(),
      teacherId: dto.teacherId,
      schoolId: dto.schoolId,
      subjectId: dto.subjectId,
      createAt: new Date(),
    });
    await this.allocationRepository.save(allocation);

    teacher.assignToSchool(dto.schoolId);
    teacher.assignToSubject(dto.subjectId);
    await this.userRepository.save(teacher);

    return allocation;
  }
}
