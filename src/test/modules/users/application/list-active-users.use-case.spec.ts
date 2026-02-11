import { ListActiveUsersUseCase } from '../../../../modules/users/application/use-cases/list-active-users.use-case';
import { User } from '../../../../modules/users/domain/user.entity';
import { InMemoryUserRepository } from '../../../../modules/users/infrastructure/persistence/in-memory-user.repository';

describe('ListActiveUsersUseCase', () => {
  let sut: ListActiveUsersUseCase;
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    sut = new ListActiveUsersUseCase(repository);
  });

  it('Deve listar apenas os usuários ativos', async () => {
    const user1 = new User({
      id: '1',
      name: 'Professor Ativo',
      email: 'teste@.c.com',
      password: '12345678',
      isActive: true,
      subjects: ['math-id'],
    });

    const user2 = new User({
      id: '2',
      name: 'Professor Inativo',
      email: 'teste2@.c.com',
      password: '12345678',
      isActive: false,
      subjects: ['math-id'],
    });

    await repository.save(user1);
    await repository.save(user2);

    const result = await sut.execute();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].isActive).toBe(true);
  });

  it('deve retornar um array vazio se não houver usuários ativos', async () => {
    const result = await sut.execute();
    expect(result).toEqual([]);
  });
});
