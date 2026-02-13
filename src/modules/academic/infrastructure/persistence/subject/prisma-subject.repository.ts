import { SubjectRepository } from '../../../domain/subject/subject.repository';
import { Subject } from '../../../domain/subject/subject.entity';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { SubjectMapper } from './subject.mapper';

export class PrismaSubjectRepository implements SubjectRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: typeof SubjectMapper,
  ) {}

  async save(subject: Subject): Promise<void> {
    const data = this.mapper.toPersistence(subject);
    await this.prisma.client.subject.upsert({
      where: { id: subject.id },
      create: data,
      update: {
        name: data.name,
        isActive: data.isActive,
        updatedAt: new Date(),
      },
    });
  }

  async findById(id: string): Promise<Subject | null> {
    const row = await this.prisma.client.subject.findUnique({ where: { id } });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findBySchoolId(schoolId: string): Promise<Subject[]> {
    const rows = await this.prisma.client.subject.findMany({
      where: { schoolId },
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async findAllActive(): Promise<Subject[]> {
    const rows = await this.prisma.client.subject.findMany({
      where: { isActive: true },
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }
}
