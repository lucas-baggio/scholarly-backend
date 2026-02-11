import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UserRepository } from './domain/user.repository';
import { HashService } from 'src/@shared/application/crypto/hash.service';
import { BcryptHashService } from 'src/@shared/infrastructure/crypto/bcrypt-hash.service';
import { InMemoryUserRepository } from './infrastructure/persistence/in-memory-user.repository';
import { UserController } from './presentation/user.controller';
import { ListActiveUsersUseCase } from './application/use-cases/list-active-users.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { DeactivateUserUseCase } from './application/use-cases/deactivate-user.use-case';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    ListActiveUsersUseCase,
    GetUserByIdUseCase,
    DeactivateUserUseCase,
    {
      provide: UserRepository,
      useClass: InMemoryUserRepository,
    },
    {
      provide: HashService,
      useClass: BcryptHashService,
    },
  ],
  exports: [UserRepository],
})
export class UserModules {}
