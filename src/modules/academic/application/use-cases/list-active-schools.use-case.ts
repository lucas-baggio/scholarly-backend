import { Injectable } from '@nestjs/common';
import { SchoolRepository } from '../../domain/school.repository';
import { School } from '../../domain/school.entity';

@Injectable()
export class ListActiveSchoolsUseCase {
  constructor(private readonly schoolRepository: SchoolRepository) {}

  async execute(): Promise<School[]> {
    return this.schoolRepository.findAllActive();
  }
}
