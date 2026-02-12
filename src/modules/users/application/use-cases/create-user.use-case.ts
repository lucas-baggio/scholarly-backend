import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../../domain/user.entity';
import { HashService } from '../../../../@shared/application/crypto/hash.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const emailExists = await this.userRepository.findByEmail(dto.email);
    if (emailExists) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await this.hashService.hash(dto.password);

    const user = new User({
      id: crypto.randomUUID(),
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      isActive: true,
      role: dto.role,
      subjects: dto.subjects ?? [],
      schoolIds: dto.schoolIds ?? [],
    });

    await this.userRepository.save(user);

    return user;
  }
}
