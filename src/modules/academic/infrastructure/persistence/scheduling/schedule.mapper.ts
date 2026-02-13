import type { Schedule as PrismaSchedule } from '@prisma/client';
import { Schedule } from '../../../domain/scheduling/schedule.entity';

export class ScheduleMapper {
  static toDomain(row: PrismaSchedule): Schedule {
    return new Schedule({
      id: row.id,
      allocationId: row.allocationId,
      timeSlotId: row.timeSlotId,
    });
  }

  static toPersistence(schedule: Schedule): {
    id: string;
    allocationId: string;
    timeSlotId: string;
  } {
    return {
      id: schedule.id,
      allocationId: schedule.allocationId,
      timeSlotId: schedule.timeSlotId,
    };
  }
}
