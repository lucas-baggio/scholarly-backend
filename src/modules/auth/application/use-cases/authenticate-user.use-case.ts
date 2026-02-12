import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../../users/domain/user.repository';
import { HashService } from '../../../../@shared/application/crypto/hash.service';
import { LoginDto } from '../dtos/login.dto';

export interface AuthResult {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const passwordMatch = await this.hashService.compare(
      dto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
