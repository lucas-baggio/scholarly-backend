import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';

export class InMemoryUserRepository implements UserRepository {
  public users: User[] = [];

  async save(user: User): Promise<void> {
    const index = this.users.findIndex((u) => u.id === user.id);

    if (index > 0) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null;
  }

  async findAllActive(): Promise<User[]> {
    return this.users.filter((u) => u.isActive);
  }

  async existsWithSubject(userId: string, subjectId: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) return false;

    return user.subjects.includes(subjectId);
  }
}
