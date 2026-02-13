import { TimeSlot } from '../../../domain/scheduling/time-slot.entity';
import { TimeSlotRepository } from '../../../domain/scheduling/time-slot.repository';

export class InMemoryTimeSlotRepository implements TimeSlotRepository {
  public timeSlots: TimeSlot[] = [];

  save(timeSlot: TimeSlot): Promise<void> {
    const index = this.timeSlots.findIndex((t) => t.id === timeSlot.id);
    if (index >= 0) {
      this.timeSlots[index] = timeSlot;
    } else {
      this.timeSlots.push(timeSlot);
    }
    return Promise.resolve();
  }

  findById(id: string): Promise<TimeSlot | null> {
    const slot = this.timeSlots.find((t) => t.id === id) ?? null;
    return Promise.resolve(slot);
  }

  findBySchoolId(schoolId: string): Promise<TimeSlot[]> {
    return Promise.resolve(
      this.timeSlots.filter((t) => t.schoolId === schoolId),
    );
  }
}
