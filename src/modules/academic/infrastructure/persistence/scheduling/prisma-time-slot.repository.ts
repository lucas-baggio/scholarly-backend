import { TimeSlotRepository } from '../../../domain/scheduling/time-slot.repository';
import { TimeSlot } from '../../../domain/scheduling/time-slot.entity';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { TimeSlotMapper } from './time-slot.mapper';

export class PrismaTimeSlotRepository implements TimeSlotRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: typeof TimeSlotMapper,
  ) {}

  async save(timeSlot: TimeSlot): Promise<void> {
    const data = this.mapper.toPersistence(timeSlot);
    await this.prisma.client.timeSlot.upsert({
      where: { id: timeSlot.id },
      create: data,
      update: {
        name: data.name,
        dayOfWeek: data.dayOfWeek,
        startTimeMinutes: data.startTimeMinutes,
        endTimeMinutes: data.endTimeMinutes,
        updatedAt: new Date(),
      },
    });
  }

  async findById(id: string): Promise<TimeSlot | null> {
    const row = await this.prisma.client.timeSlot.findUnique({
      where: { id },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findBySchoolId(schoolId: string): Promise<TimeSlot[]> {
    const rows = await this.prisma.client.timeSlot.findMany({
      where: { schoolId },
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }
}
