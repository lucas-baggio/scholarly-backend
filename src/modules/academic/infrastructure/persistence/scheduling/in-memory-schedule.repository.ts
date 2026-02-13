import { Schedule } from '../../../domain/scheduling/schedule.entity';
import { ScheduleRepository } from '../../../domain/scheduling/schedule.repository';

export class InMemoryScheduleRepository implements ScheduleRepository {
  public schedules: Schedule[] = [];

  save(schedule: Schedule): Promise<void> {
    const index = this.schedules.findIndex((s) => s.id === schedule.id);
    if (index >= 0) {
      this.schedules[index] = schedule;
    } else {
      this.schedules.push(schedule);
    }
    return Promise.resolve();
  }

  findById(id: string): Promise<Schedule | null> {
    const schedule = this.schedules.find((s) => s.id === id) ?? null;
    return Promise.resolve(schedule);
  }

  findByTimeSlotId(timeSlotId: string): Promise<Schedule | null> {
    const schedule =
      this.schedules.find((s) => s.timeSlotId === timeSlotId) ?? null;
    return Promise.resolve(schedule);
  }

  findByAllocationIds(allocationIds: string[]): Promise<Schedule[]> {
    const set = new Set(allocationIds);
    return Promise.resolve(
      this.schedules.filter((s) => set.has(s.allocationId)),
    );
  }
}
