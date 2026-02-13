import { Injectable } from '@nestjs/common';
import { SchoolRepository } from '../../../domain/school/school.repository';
import { School } from '../../../domain/school/school.entity';

@Injectable()
export class GetSchoolsByAdminUseCase {
  constructor(private readonly schoolRepository: SchoolRepository) {}

  async execute(adminId: string): Promise<School[]> {
    return await this.schoolRepository.findByAdminId(adminId);
  }
}
