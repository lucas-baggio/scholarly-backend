import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UserRepository } from './domain/user.repository';
import { HashService } from '../../@shared/application/crypto/hash.service';
import { BcryptHashService } from '../../@shared/infrastructure/crypto/bcrypt-hash.service';
import { InMemoryUserRepository } from './infrastructure/persistence/in-memory-user.repository';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { UserMapper } from './infrastructure/persistence/mappers/user.mapper';
import { UserController } from './presentation/user.controller';
import { ListActiveUsersUseCase } from './application/use-cases/list-active-users.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { DeactivateUserUseCase } from './application/use-cases/deactivate-user.use-case';
import { PrismaService } from '../../prisma/prisma.service';

const usePrisma = !!process.env.DATABASE_URL;

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
      useFactory: (prisma: PrismaService) =>
        usePrisma
          ? new PrismaUserRepository(prisma, UserMapper)
          : new InMemoryUserRepository(),
      inject: [PrismaService],
    },
    {
      provide: HashService,
      useClass: BcryptHashService,
    },
  ],
  exports: [UserRepository, HashService],
})
export class UserModules {}
