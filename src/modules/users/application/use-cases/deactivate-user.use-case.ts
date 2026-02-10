import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';

@Injectable()
export class DeactivateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`Professor com ID ${id} não encontrado!`);
    }

    user.deactive();

    await this.userRepository.save(user);
  }
}
