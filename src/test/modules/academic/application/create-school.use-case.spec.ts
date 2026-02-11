import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateSchoolUseCase } from '../../../../modules/academic/application/use-cases/create-school.use-case';
import { InMemorySchoolRepository } from '../../../../modules/academic/infrastructure/persistence/in-memory-school.repository';
import { InMemoryUserRepository } from '../../../../modules/users/infrastructure/persistence/in-memory-user.repository';
import { User } from '../../../../modules/users/domain/user.entity';

describe('CreateSchoolUseCase', () => {
  let sut: CreateSchoolUseCase;
  let schoolRepository: InMemorySchoolRepository;
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    schoolRepository = new InMemorySchoolRepository();
    userRepository = new InMemoryUserRepository();
    sut = new CreateSchoolUseCase(schoolRepository, userRepository);
  });

  it('should create a school successfully when admin exists and name is unique', async () => {
    const admin = new User({
      id: 'admin-id',
      name: 'Admin User',
      email: 'admin@teste.com',
      password: '12345678',
      isActive: true,
    });
    await userRepository.save(admin);

    const input = { name: 'Escola Sênior', adminId: 'admin-id' };

    const result = await sut.execute(input);

    expect(result.id).toBeDefined();
    expect(result.name).toBe('Escola Sênior');
    expect(result.adminId).toBe('admin-id');

    const savedSchool = await schoolRepository.findById(result.id);
    expect(savedSchool).toBeDefined();
  });

  it('should throw NotFoundException if admin does not exist', async () => {
    const input = { name: 'Escola Sênior', adminId: 'non-existent-id' };

    await expect(sut.execute(input)).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException if school name already exists', async () => {
    const admin = new User({
      id: 'admin-id',
      name: 'Admin',
      email: 'a@a.com',
      password: '12345678',
      isActive: true,
    });
    await userRepository.save(admin);

    const input = { name: 'Escola Repetida', adminId: 'admin-id' };
    await sut.execute(input);

    await expect(sut.execute(input)).rejects.toThrow(ConflictException);
  });
});
