import { Schedule } from './schedule.entity';

export abstract class ScheduleRepository {
  abstract save(schedule: Schedule): Promise<void>;
  abstract findById(id: string): Promise<Schedule | null>;
  abstract findByTimeSlotId(timeSlotId: string): Promise<Schedule | null>;
  abstract findByAllocationIds(allocationIds: string[]): Promise<Schedule[]>;
}
