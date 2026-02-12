import { Injectable } from '@nestjs/common';
import { SubjectRepository } from '../../domain/subject.repository';
import { Subject } from '../../domain/subject.entity';

@Injectable()
export class ListSubjectsBySchoolUseCase {
  constructor(private readonly subjectRepository: SubjectRepository) {}

  async execute(schoolId: string): Promise<Subject[]> {
    return this.subjectRepository.findBySchoolId(schoolId);
  }
}
