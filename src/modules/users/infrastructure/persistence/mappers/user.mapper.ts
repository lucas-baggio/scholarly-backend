import type { User as PrismaUser } from '@prisma/client';
import { User } from '../../../domain/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';

export class UserMapper {
  static toDomain(
    row: PrismaUser,
    options?: { schoolIds?: string[]; subjects?: string[] },
  ): User {
    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role as UserRole,
      isActive: row.isActive,
      subjects: options?.subjects ?? [],
      schoolIds: options?.schoolIds ?? [],
      createdAt: row.createdAt,
    });
  }

  static toPersistence(user: User): {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'TEACHER';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: user.id!,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role as 'ADMIN' | 'TEACHER',
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
    };
  }
}
