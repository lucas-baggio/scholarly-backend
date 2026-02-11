import { NotFoundException } from '@nestjs/common';
import { InMemorySchoolRepository } from '../../../../modules/academic/infrastructure/persistence/in-memory-school.repository';
import { GetSchoolByIdUseCase } from '../../../../modules/academic/application/use-cases/get-school-by-id.use-case';
import { School } from '../../../../modules/academic/domain/school.entity';

describe('GetSchoolByIdUseCase', () => {
  let sut: GetSchoolByIdUseCase;
  let schoolRepository: InMemorySchoolRepository;

  beforeEach(() => {
    schoolRepository = new InMemorySchoolRepository();
    sut = new GetSchoolByIdUseCase(schoolRepository);
  });

  it('should return a school when a valid ID is provided', async () => {
    const school = new School({
      id: 'target-id',
      name: 'Escola de Teste',
      adminId: 'admin-123',
      isActive: true,
      createdAt: new Date(),
    });
    await schoolRepository.save(school);

    const result = await sut.execute('target-id');

    expect(result).not.toBeNull();
    expect(result).toBeDefined();

    expect(result!.id).toBe('target-id');
    expect(result!.name).toBe('Escola de Teste');
  });

  it('should throw NotFoundException when school does not exist', async () => {
    await expect(sut.execute('non-existent-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
