import { HashService } from '../../../../@shared/application/crypto/hash.service';
import { CreateUserUseCase } from '../../../../modules/users/application/use-cases/create-user.use-case';
import { UserRole } from '../../../../modules/users/domain/enums/user-role.enum';
import { InMemoryUserRepository } from '../../../../modules/users/infrastructure/persistence/in-memory-user.repository';

const mockHashService: jest.Mocked<HashService> = {
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
};

describe('CreateUserUseCase', () => {
  let sut: CreateUserUseCase;
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    sut = new CreateUserUseCase(repository, mockHashService);
  });

  it('Deve criar um professor com sucesso (Caminho Feliz)', async () => {
    const input = {
      name: 'Professor Girafales',
      email: 'girafales@escola.com',
      password: 'password123',
      subjects: ['math-id'],
    };

    const result = await sut.execute(input);

    expect(result.id).toBeDefined();
    expect(result.name).toBe(input.name);
    expect(result.email).toBe(input.email);
    expect(result.password).toBe('hashed_password');
    expect(repository.users).toHaveLength(1);
  });

  it('Deve lançar erro se o e-mail já estiver em uso', async () => {
    const input = {
      name: 'Professor 1',
      email: 'duplicado@escola.com',
      password: 'password123',
    };

    await sut.execute(input);

    await expect(sut.execute(input)).rejects.toThrow('Email already in use');
  });

  it('Deve garantir que a senha do professor seja criptografada', async () => {
    const input = {
      name: 'Professor Saguro',
      email: 'saguro@escola.com',
      password: 'senha-plana-123',
    };

    const result = await sut.execute(input);

    expect(result.password).toBe('hashed_password');
    expect(result.password).not.toBe(input.password);
  });

  it('Deve criar usuário com role e schoolIds quando informados', async () => {
    const input = {
      name: 'Admin Escola',
      email: 'admin@escola.com',
      password: 'password123',
      role: UserRole.ADMIN,
      schoolIds: ['school-1', 'school-2'],
    };

    const result = await sut.execute(input);

    expect(result.role).toBe(UserRole.ADMIN);
    expect(result.schoolIds).toEqual(['school-1', 'school-2']);
    expect(result.isAdmin()).toBe(true);
  });
});
