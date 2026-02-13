import { ScheduleRepository } from '../../../domain/scheduling/schedule.repository';
import { Schedule } from '../../../domain/scheduling/schedule.entity';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { ScheduleMapper } from './schedule.mapper';

export class PrismaScheduleRepository implements ScheduleRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: typeof ScheduleMapper,
  ) {}

  async save(schedule: Schedule): Promise<void> {
    const data = this.mapper.toPersistence(schedule);
    await this.prisma.client.schedule.upsert({
      where: { id: schedule.id },
      create: data,
      update: { updatedAt: new Date() },
    });
  }

  async findById(id: string): Promise<Schedule | null> {
    const row = await this.prisma.client.schedule.findUnique({
      where: { id },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findByTimeSlotId(timeSlotId: string): Promise<Schedule | null> {
    const row = await this.prisma.client.schedule.findFirst({
      where: { timeSlotId },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findByAllocationIds(allocationIds: string[]): Promise<Schedule[]> {
    if (allocationIds.length === 0) return [];
    const rows = await this.prisma.client.schedule.findMany({
      where: { allocationId: { in: allocationIds } },
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }
}
