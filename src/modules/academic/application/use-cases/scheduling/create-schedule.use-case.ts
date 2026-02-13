import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AllocationRepository } from '../../../domain/allocation/allocation.repository';
import { TimeSlotRepository } from '../../../domain/scheduling/time-slot.repository';
import { ScheduleRepository } from '../../../domain/scheduling/schedule.repository';
import { Schedule } from '../../../domain/scheduling/schedule.entity';
import { CreateScheduleDto } from '../../dtos/scheduling/create-schedule.dto';
import { timeRangesOverlap } from '../../../domain/scheduling/helpers/time.utils';

@Injectable()
export class CreateScheduleUseCase {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly allocationRepository: AllocationRepository,
    private readonly timeSlotRepository: TimeSlotRepository,
  ) {}

  async execute(dto: CreateScheduleDto): Promise<Schedule> {
    const allocation = await this.allocationRepository.findById(
      dto.allocationId,
    );
    if (!allocation) {
      throw new NotFoundException(
        `Allocation with ID ${dto.allocationId} not found`,
      );
    }

    const timeSlot = await this.timeSlotRepository.findById(dto.timeSlotId);
    if (!timeSlot) {
      throw new NotFoundException(
        `TimeSlot with ID ${dto.timeSlotId} not found`,
      );
    }

    if (timeSlot.schoolId !== allocation.schoolId) {
      throw new ConflictException(
        'TimeSlot must belong to the same school as the allocation',
      );
    }

    const existingAtSlot = await this.scheduleRepository.findByTimeSlotId(
      dto.timeSlotId,
    );
    if (existingAtSlot) {
      throw new ConflictException(
        'This time slot is already occupied at this school',
      );
    }

    const teacherAllocations = await this.allocationRepository.findByTeacherId(
      allocation.teacherId,
    );
    const teacherAllocationIds = teacherAllocations.map((a) => a.id);
    const teacherSchedules =
      await this.scheduleRepository.findByAllocationIds(teacherAllocationIds);

    for (const other of teacherSchedules) {
      const otherSlot = await this.timeSlotRepository.findById(
        other.timeSlotId,
      );
      if (!otherSlot) continue;
      if (otherSlot.dayOfWeek !== timeSlot.dayOfWeek) continue;
      if (
        timeRangesOverlap(
          timeSlot.startTime,
          timeSlot.endTime,
          otherSlot.startTime,
          otherSlot.endTime,
        )
      ) {
        throw new ConflictException(
          'Teacher already has a schedule at the same day and time (conflict with another school or slot)',
        );
      }
    }

    const schedule = new Schedule({
      id: crypto.randomUUID(),
      allocationId: dto.allocationId,
      timeSlotId: dto.timeSlotId,
    });
    await this.scheduleRepository.save(schedule);
    return schedule;
  }
}
