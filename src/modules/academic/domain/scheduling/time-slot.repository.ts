import { TimeSlot } from './time-slot.entity';

export abstract class TimeSlotRepository {
  abstract save(timeSlot: TimeSlot): Promise<void>;
  abstract findById(id: string): Promise<TimeSlot | null>;
  abstract findBySchoolId(schoolId: string): Promise<TimeSlot[]>;
}
