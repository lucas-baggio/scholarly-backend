import { SchoolRepository } from '../../../domain/school/school.repository';
import { School } from '../../../domain/school/school.entity';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { SchoolMapper } from './school.mapper';

export class PrismaSchoolRepository implements SchoolRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: typeof SchoolMapper,
  ) {}

  async save(school: School): Promise<void> {
    const data = this.mapper.toPersistence(school);
    await this.prisma.client.school.upsert({
      where: { id: school.id },
      create: data,
      update: {
        name: data.name,
        isActive: data.isActive,
        updatedAt: new Date(),
      },
    });
  }

  async findById(id: string): Promise<School | null> {
    const row = await this.prisma.client.school.findUnique({ where: { id } });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findAllActive(): Promise<School[]> {
    const rows = await this.prisma.client.school.findMany({
      where: { isActive: true },
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async findByAdminId(adminId: string): Promise<School[]> {
    const rows = await this.prisma.client.school.findMany({
      where: { adminId },
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.client.school.count({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    return count > 0;
  }
}
