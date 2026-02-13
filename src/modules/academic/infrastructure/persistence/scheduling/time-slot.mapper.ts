import type { TimeSlot as PrismaTimeSlot } from '@prisma/client';
import { TimeSlot } from '../../../domain/scheduling/time-slot.entity';
import {
  minutesToTime,
  timeToMinutes,
} from '../../../domain/scheduling/helpers/time.utils';

export class TimeSlotMapper {
  static toDomain(row: PrismaTimeSlot): TimeSlot {
    return new TimeSlot({
      id: row.id,
      schoolId: row.schoolId,
      name: row.name,
      dayOfWeek: row.dayOfWeek,
      startTime: minutesToTime(row.startTimeMinutes),
      endTime: minutesToTime(row.endTimeMinutes),
    });
  }

  static toPersistence(timeSlot: TimeSlot): {
    id: string;
    schoolId: string;
    name: string;
    dayOfWeek: number;
    startTimeMinutes: number;
    endTimeMinutes: number;
  } {
    return {
      id: timeSlot.id,
      schoolId: timeSlot.schoolId,
      name: timeSlot.name,
      dayOfWeek: timeSlot.dayOfWeek,
      startTimeMinutes: timeToMinutes(timeSlot.startTime),
      endTimeMinutes: timeToMinutes(timeSlot.endTime),
    };
  }
}
