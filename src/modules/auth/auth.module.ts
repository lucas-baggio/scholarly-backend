import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModules } from '../users/users.module';
import { AuthenticateUserUseCase } from './application/use-cases/authenticate-user.use-case';
import { AuthController } from './presentation/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

@Module({
  imports: [
    UserModules,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'default-secret-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthenticateUserUseCase, JwtStrategy],
  exports: [AuthenticateUserUseCase, JwtStrategy],
})
export class AuthModule {}
