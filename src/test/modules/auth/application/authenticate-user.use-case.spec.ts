import { JwtService } from '@nestjs/jwt';
import { HashService } from '../../../../@shared/application/crypto/hash.service';
import { AuthenticateUserUseCase } from '../../../../modules/auth/application/use-cases/authenticate-user.use-case';
import { User } from '../../../../modules/users/domain/user.entity';
import { InMemoryUserRepository } from '../../../../modules/users/infrastructure/persistence/in-memory-user.repository';

const mockHashService: jest.Mocked<HashService> = {
  hash: jest.fn(),
  compare: jest.fn().mockResolvedValue(true),
};

const mockJwtService: jest.Mocked<Pick<JwtService, 'signAsync'>> = {
  signAsync: jest.fn().mockResolvedValue('jwt-token-123'),
};

describe('AuthenticateUserUseCase', () => {
  let sut: AuthenticateUserUseCase;
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHashService.compare.mockResolvedValue(true);
    mockJwtService.signAsync.mockResolvedValue('jwt-token-123');
    repository = new InMemoryUserRepository();
    sut = new AuthenticateUserUseCase(
      repository,
      mockHashService,
      mockJwtService as unknown as JwtService,
    );
  });

  it('deve retornar accessToken e user ao autenticar com credenciais válidas', async () => {
    const user = new User({
      id: 'user-1',
      name: 'João',
      email: 'joao@email.com',
      password: 'hashed_password',
      isActive: true,
    });
    await repository.save(user);

    const result = await sut.execute({
      email: 'joao@email.com',
      password: 'senha123',
    });

    expect(result.accessToken).toBe('jwt-token-123');
    expect(result.user).toEqual({
      id: 'user-1',
      name: 'João',
      email: 'joao@email.com',
      role: 'TEACHER',
    });
    expect(mockHashService.compare.mock.calls).toEqual([
      ['senha123', 'hashed_password'],
    ]);
    expect(mockJwtService.signAsync.mock.calls).toEqual([
      [
        {
          sub: 'user-1',
          email: 'joao@email.com',
        },
      ],
    ]);
  });

  it('deve lançar UnauthorizedException quando o e-mail não existe', async () => {
    await expect(
      sut.execute({
        email: 'inexistente@email.com',
        password: 'senha123',
      }),
    ).rejects.toThrow('E-mail ou senha inválidos');

    expect(mockHashService.compare.mock.calls).toHaveLength(0);
  });

  it('deve lançar UnauthorizedException quando a senha estiver incorreta', async () => {
    const user = new User({
      id: 'user-1',
      name: 'João',
      email: 'joao@email.com',
      password: 'hashed_password',
      isActive: true,
    });
    await repository.save(user);
    mockHashService.compare.mockResolvedValueOnce(false);

    await expect(
      sut.execute({
        email: 'joao@email.com',
        password: 'senha_errada',
      }),
    ).rejects.toThrow('E-mail ou senha inválidos');
  });

  it('deve lançar UnauthorizedException quando o usuário estiver inativo', async () => {
    const user = new User({
      id: 'user-inativo',
      name: 'Inativo',
      email: 'inativo@email.com',
      password: 'hashed_password',
      isActive: false,
    });
    await repository.save(user);

    await expect(
      sut.execute({
        email: 'inativo@email.com',
        password: 'senha123',
      }),
    ).rejects.toThrow('Usuário inativo');

    expect(mockHashService.compare.mock.calls).toHaveLength(0);
  });
});
