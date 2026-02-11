import { NotFoundException } from '@nestjs/common';
import { User } from '../../../../modules/users/domain/user.entity';
import { DeactivateUserUseCase } from '../../../../modules/users/application/use-cases/deactivate-user.use-case';
import { InMemoryUserRepository } from '../../../../modules/users/infrastructure/persistence/in-memory-user.repository';

describe('DeactivateUserUseCase', () => {
  let sut: DeactivateUserUseCase;
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    sut = new DeactivateUserUseCase(repository);
  });

  it('deve desativar um professor com sucesso (soft delete)', async () => {
    const user = new User({
      id: 'prof-123',
      name: 'Professor Ativo',
      email: 'ativo@escola.com',
      password: '12345678',
      isActive: true,
    });
    await repository.save(user);

    await sut.execute('prof-123');

    const updatedUser = await repository.findById('prof-123');
    expect(updatedUser?.isActive).toBe(false);
  });

  it('deve lançar NotFoundException ao tentar desativar um professor inexistente', async () => {
    await expect(sut.execute('id-que-nao-existe')).rejects.toThrow(
      new NotFoundException(
        'Professor com ID id-que-nao-existe não encontrado!',
      ),
    );
  });

  it('deve manter o professor como desativado se ele já estiver inativo', async () => {
    const user = new User({
      id: 'prof-inativo',
      name: 'Professor Inativo',
      email: 'inativo@escola.com',
      password: '12345678',
      isActive: false,
    });
    await repository.save(user);

    await sut.execute('prof-inativo');

    const updatedUser = await repository.findById('prof-inativo');
    expect(updatedUser?.isActive).toBe(false);
  });
});
