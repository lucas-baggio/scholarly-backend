import { Injectable, NotFoundException } from '@nestjs/common';
import { SchoolRepository } from '../../domain/school.repository';
import { SubjectRepository } from '../../domain/subject.repository';
import { Subject } from '../../domain/subject.entity';
import { CreateSubjectDto } from '../dtos/create-subject.dto';
import { SchoolNotFoundException } from '../../domain/exceptions/school-not-found.exception';
import { SchoolInactiveException } from '../../domain/exceptions/school-inactive.exception';

@Injectable()
export class CreateSubjectUseCase {
  constructor(
    private readonly subjectRepository: SubjectRepository,
    private readonly schoolRepository: SchoolRepository,
  ) {}

  async execute(dto: CreateSubjectDto): Promise<Subject> {
    const school = await this.schoolRepository.findById(dto.schoolId);

    if (!school) {
      throw new NotFoundException(
        new SchoolNotFoundException(dto.schoolId).message,
      );
    }

    if (!school.isActive) {
      throw new SchoolInactiveException(school.name);
    }

    const subject = new Subject({
      id: crypto.randomUUID(),
      name: dto.name.trim(),
      schoolId: dto.schoolId,
      isActive: true,
      createdAt: new Date(),
    });

    await this.subjectRepository.save(subject);

    return subject;
  }
}
