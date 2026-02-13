import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UserMapper } from './mappers/user.mapper';

export class PrismaUserRepository implements UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: typeof UserMapper,
  ) {}

  async save(user: User): Promise<void> {
    const data = this.mapper.toPersistence(user);
    await this.prisma.client.user.upsert({
      where: { id: user.id! },
      create: data,
      update: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        isActive: data.isActive,
        updatedAt: new Date(),
      },
    });
  }

  private async loadSchoolIdsAndSubjects(userId: string): Promise<{
    schoolIds: string[];
    subjects: string[];
  }> {
    const allocations = await this.prisma.client.allocation.findMany({
      where: { teacherId: userId },
      select: { schoolId: true, subjectId: true },
    });
    const schoolIds = [...new Set(allocations.map((a) => a.schoolId))];
    const subjects = [...new Set(allocations.map((a) => a.subjectId))];
    return { schoolIds, subjects };
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.client.user.findUnique({ where: { id } });
    if (!row) return null;
    const { schoolIds, subjects } = await this.loadSchoolIdsAndSubjects(id);
    return this.mapper.toDomain(row, { schoolIds, subjects });
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.client.user.findUnique({ where: { email } });
    if (!row) return null;
    const { schoolIds, subjects } = await this.loadSchoolIdsAndSubjects(row.id);
    return this.mapper.toDomain(row, { schoolIds, subjects });
  }

  async findAllActive(): Promise<User[]> {
    const rows = await this.prisma.client.user.findMany({
      where: { isActive: true },
    });
    const result: User[] = [];
    for (const row of rows) {
      const { schoolIds, subjects } = await this.loadSchoolIdsAndSubjects(
        row.id,
      );
      result.push(this.mapper.toDomain(row, { schoolIds, subjects }));
    }
    return result;
  }

  async existsWithSubject(userId: string, subjectId: string): Promise<boolean> {
    const count = await this.prisma.client.allocation.count({
      where: { teacherId: userId, subjectId },
    });
    return count > 0;
  }
}
