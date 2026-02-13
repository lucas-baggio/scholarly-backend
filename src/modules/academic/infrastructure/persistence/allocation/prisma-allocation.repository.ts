import { AllocationRepository } from '../../../domain/allocation/allocation.repository';
import { Allocation } from '../../../domain/allocation/allocation.entity';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { AllocationMapper } from './allocation.mapper';

export class PrismaAllocationRepository implements AllocationRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: typeof AllocationMapper,
  ) {}

  async save(allocation: Allocation): Promise<void> {
    const data = this.mapper.toPersistence(allocation);
    await this.prisma.client.allocation.upsert({
      where: { id: allocation.id },
      create: data,
      update: { updatedAt: new Date() },
    });
  }

  async findById(id: string): Promise<Allocation | null> {
    const row = await this.prisma.client.allocation.findUnique({
      where: { id },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findByTeacherId(teacherId: string): Promise<Allocation[]> {
    const rows = await this.prisma.client.allocation.findMany({
      where: { teacherId },
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async findBySchoolId(schoolId: string): Promise<Allocation[]> {
    const rows = await this.prisma.client.allocation.findMany({
      where: { schoolId },
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async exists(
    teacherId: string,
    schoolId: string,
    subjectId: string,
  ): Promise<boolean> {
    const count = await this.prisma.client.allocation.count({
      where: { teacherId, schoolId, subjectId },
    });
    return count > 0;
  }
}
