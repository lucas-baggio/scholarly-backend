import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SchoolRepository } from '../../../domain/school/school.repository';
import { UserRepository } from '../../../../users/domain/user.repository';
import { School } from '../../../domain/school/school.entity';
import { CreateSchoolDto } from '../../dtos/school/create-school.dto';

@Injectable()
export class CreateSchoolUseCase {
  constructor(
    private readonly schoolRepository: SchoolRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: CreateSchoolDto): Promise<School> {
    const adminExists = await this.userRepository.findById(dto.adminId);
    if (!adminExists) {
      throw new NotFoundException(
        `Admin user with ID ${dto.adminId} not found`,
      );
    }

    const nameAlreadyUsed = await this.schoolRepository.existsByName(dto.name);
    if (nameAlreadyUsed) {
      throw new ConflictException(
        `School name "${dto.name}" is already in use`,
      );
    }

    const school = new School({
      id: crypto.randomUUID(),
      name: dto.name,
      adminId: dto.adminId,
      isActive: true,
      createdAt: new Date(),
    });

    await this.schoolRepository.save(school);

    return school;
  }
}
