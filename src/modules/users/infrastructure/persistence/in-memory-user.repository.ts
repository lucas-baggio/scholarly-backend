import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';

export class InMemoryUserRepository implements UserRepository {
  public users: User[] = [];

  save(user: User): Promise<void> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
    return Promise.resolve();
  }

  findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id) || null;
    return Promise.resolve(user);
  }

  findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email) || null;
    return Promise.resolve(user);
  }

  findAllActive(): Promise<User[]> {
    const users = this.users.filter((u) => u.isActive);
    return Promise.resolve(users);
  }

  async existsWithSubject(userId: string, subjectId: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) return false;

    return user.subjects.includes(subjectId);
  }
}
