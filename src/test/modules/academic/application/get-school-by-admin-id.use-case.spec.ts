import { GetSchoolsByAdminUseCase } from '../../../../modules/academic/application/use-cases/school/get-school-by-admin-id.use-case';
import { School } from '../../../../modules/academic/domain/school/school.entity';
import { InMemorySchoolRepository } from '../../../../modules/academic/infrastructure/persistence/school/in-memory-school.repository';

describe('GetSchoolsByAdminUseCase', () => {
  let sut: GetSchoolsByAdminUseCase;
  let schoolRepository: InMemorySchoolRepository;

  beforeEach(() => {
    schoolRepository = new InMemorySchoolRepository();
    sut = new GetSchoolsByAdminUseCase(schoolRepository);
  });

  it('should return all schools for a specific admin', async () => {
    const adminId = 'admin-01';

    await schoolRepository.save(
      new School({
        id: '1',
        name: 'Escola A',
        adminId,
        isActive: true,
        createdAt: new Date(),
      }),
    );
    await schoolRepository.save(
      new School({
        id: '2',
        name: 'Escola B',
        adminId,
        isActive: true,
        createdAt: new Date(),
      }),
    );
    await schoolRepository.save(
      new School({
        id: '3',
        name: 'Outra Escola',
        adminId: 'outro-admin',
        isActive: true,
        createdAt: new Date(),
      }),
    );

    const result = await sut.execute(adminId);

    expect(result).toHaveLength(2);
    expect(result.every((s) => s.adminId === adminId)).toBe(true);
  });

  it('should return an empty array if the admin has no schools', async () => {
    const result = await sut.execute('new-admin');
    expect(result).toEqual([]);
  });
});
