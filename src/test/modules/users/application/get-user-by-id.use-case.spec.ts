import { NotFoundException } from '@nestjs/common';
import { GetUserByIdUseCase } from '../../../../modules/users/application/use-cases/get-user-by-id.use-case';
import { User } from '../../../../modules/users/domain/user.entity';
import { InMemoryUserRepository } from '../../../../modules/users/infrastructure/persistence/in-memory-user.repository';

describe('GetUserByIdUseCase', () => {
  let sut: GetUserByIdUseCase;
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    sut = new GetUserByIdUseCase(repository);
  });

  it('Deve retornar um usuário existente', async () => {
    const user = new User({
      id: 'any-uuid',
      name: 'Professor Girafales',
      email: 'girafales@example.com',
      password: '12345678',
      isActive: true,
      subjects: ['math-id'],
    });

    await repository.save(user);

    const result = await sut.execute(user.id);
    expect(result).toBeInstanceOf(User);
    expect(result.id).toBe('any-uuid');
    expect(result.name).toBe('Professor Girafales');
  });

  it('Deve lançar NotFoundException se o professor não for encontrado', async () => {
    await expect(sut.execute('non-existent-id')).rejects.toThrow(
      new NotFoundException('Professor com ID non-existent-id não encontrado!'),
    );
  });
});
