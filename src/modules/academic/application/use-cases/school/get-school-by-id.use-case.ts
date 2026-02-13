import { Injectable, NotFoundException } from '@nestjs/common';
import { SchoolRepository } from '../../../domain/school/school.repository';
import { School } from '../../../domain/school/school.entity';

@Injectable()
export class GetSchoolByIdUseCase {
  constructor(private readonly schoolRepository: SchoolRepository) {}

  async execute(id: string): Promise<School | null> {
    const school = await this.schoolRepository.findById(id);
    if (!school) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }
    return school;
  }
}
