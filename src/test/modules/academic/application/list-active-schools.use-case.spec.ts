import { ListActiveSchoolsUseCase } from '../../../../modules/academic/application/use-cases/school/list-active-schools.use-case';
import { School } from '../../../../modules/academic/domain/school/school.entity';
import { InMemorySchoolRepository } from '../../../../modules/academic/infrastructure/persistence/school/in-memory-school.repository';

describe('ListActiveSchoolsUseCase', () => {
  let sut: ListActiveSchoolsUseCase;
  let schoolRepository: InMemorySchoolRepository;

  beforeEach(() => {
    schoolRepository = new InMemorySchoolRepository();
    sut = new ListActiveSchoolsUseCase(schoolRepository);
  });

  it('should list all active schools', async () => {
    const school1 = new School({
      id: '1',
      name: 'Active School 01',
      adminId: 'admin-1',
      isActive: true,
      createdAt: new Date(),
    });

    const school2 = new School({
      id: '2',
      name: 'Active School 02',
      adminId: 'admin-2',
      isActive: true,
      createdAt: new Date(),
    });

    const inactiveSchool = new School({
      id: '3',
      name: 'Inactive School',
      adminId: 'admin-3',
      isActive: false,
      createdAt: new Date(),
    });

    await schoolRepository.save(school1);
    await schoolRepository.save(school2);
    await schoolRepository.save(inactiveSchool);

    const result = await sut.execute();

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(school1);
    expect(result).toContainEqual(school2);
    expect(result.some((s) => s.name === 'Inactive School')).toBeFalsy();
  });

  it('should return an empty array if no active schools exist', async () => {
    const result = await sut.execute();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
