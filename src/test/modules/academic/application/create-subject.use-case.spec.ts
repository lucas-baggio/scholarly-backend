import { NotFoundException } from '@nestjs/common';
import { CreateSubjectUseCase } from '../../../../modules/academic/application/use-cases/subject/create-subject.use-case';
import { SchoolInactiveException } from '../../../../modules/academic/domain/school/exceptions/school-inactive.exception';
import { School } from '../../../../modules/academic/domain/school/school.entity';
import { Subject } from '../../../../modules/academic/domain/subject/subject.entity';
import { InMemorySchoolRepository } from '../../../../modules/academic/infrastructure/persistence/school/in-memory-school.repository';
import { InMemorySubjectRepository } from '../../../../modules/academic/infrastructure/persistence/subject/in-memory-subject.repository';

describe('CreateSubjectUseCase', () => {
  let sut: CreateSubjectUseCase;
  let subjectRepository: InMemorySubjectRepository;
  let schoolRepository: InMemorySchoolRepository;

  beforeEach(() => {
    subjectRepository = new InMemorySubjectRepository();
    schoolRepository = new InMemorySchoolRepository();
    sut = new CreateSubjectUseCase(subjectRepository, schoolRepository);
  });

  it('should create a subject successfully when school exists and is active', async () => {
    const school = new School({
      id: 'school-id',
      name: 'Escola Ativa',
      adminId: 'admin-id',
      isActive: true,
      createdAt: new Date(),
    });
    await schoolRepository.save(school);

    const input = { name: 'Matemática', schoolId: 'school-id' };

    const result = await sut.execute(input);

    expect(result).toBeInstanceOf(Subject);
    expect(result.id).toBeDefined();
    expect(result.name).toBe('Matemática');
    expect(result.schoolId).toBe('school-id');
    expect(result.isActive).toBe(true);

    const saved = await subjectRepository.findById(result.id);
    expect(saved).toBeDefined();
    expect(saved?.name).toBe('Matemática');
  });

  it('should throw NotFoundException when school does not exist', async () => {
    const input = { name: 'Matemática', schoolId: 'non-existent-school-id' };

    await expect(sut.execute(input)).rejects.toThrow(NotFoundException);
    await expect(sut.execute(input)).rejects.toThrow(
      'School with ID non-existent-school-id not found',
    );

    expect(subjectRepository.subjects).toHaveLength(0);
  });

  it('should throw SchoolInactiveException when school is inactive', async () => {
    const inactiveSchool = new School({
      id: 'inactive-school-id',
      name: 'Escola Inativa',
      adminId: 'admin-id',
      isActive: false,
      createdAt: new Date(),
    });
    await schoolRepository.save(inactiveSchool);

    const input = { name: 'Física', schoolId: 'inactive-school-id' };

    await expect(sut.execute(input)).rejects.toThrow(SchoolInactiveException);
    await expect(sut.execute(input)).rejects.toThrow(
      'The school Escola Inativa is inactive and cannot perform this operation',
    );

    expect(subjectRepository.subjects).toHaveLength(0);
  });

  it('should trim subject name when creating', async () => {
    const school = new School({
      id: 'school-id',
      name: 'Escola',
      adminId: 'admin-id',
      isActive: true,
      createdAt: new Date(),
    });
    await schoolRepository.save(school);

    const result = await sut.execute({
      name: '  Química  ',
      schoolId: 'school-id',
    });

    expect(result.name).toBe('Química');
  });
});
