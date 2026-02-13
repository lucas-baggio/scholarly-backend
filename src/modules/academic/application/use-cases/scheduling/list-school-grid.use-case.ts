import { Injectable } from '@nestjs/common';
import { TimeSlotRepository } from '../../../domain/scheduling/time-slot.repository';
import { ScheduleRepository } from '../../../domain/scheduling/schedule.repository';
import { AllocationRepository } from '../../../domain/allocation/allocation.repository';
import { UserRepository } from '../../../../users/domain/user.repository';
import { SubjectRepository } from '../../../domain/subject/subject.repository';

export interface GridSlotItem {
  timeSlot: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
  };
  occupied: boolean;
  schedule?: {
    professorName: string;
    subjectName: string;
  };
}

@Injectable()
export class ListSchoolGridUseCase {
  constructor(
    private readonly timeSlotRepository: TimeSlotRepository,
    private readonly scheduleRepository: ScheduleRepository,
    private readonly allocationRepository: AllocationRepository,
    private readonly userRepository: UserRepository,
    private readonly subjectRepository: SubjectRepository,
  ) {}

  async execute(schoolId: string): Promise<GridSlotItem[]> {
    const timeSlots = await this.timeSlotRepository.findBySchoolId(schoolId);
    if (timeSlots.length === 0) {
      return [];
    }

    const result: GridSlotItem[] = [];

    for (const slot of timeSlots) {
      const schedule = await this.scheduleRepository.findByTimeSlotId(slot.id);

      if (!schedule) {
        result.push({
          timeSlot: {
            id: slot.id,
            name: slot.name,
            startTime: slot.startTime,
            endTime: slot.endTime,
            dayOfWeek: slot.dayOfWeek,
          },
          occupied: false,
        });
        continue;
      }

      const allocation = await this.allocationRepository.findById(
        schedule.allocationId,
      );
      const teacher = allocation
        ? await this.userRepository.findById(allocation.teacherId)
        : null;
      const subject = allocation
        ? await this.subjectRepository.findById(allocation.subjectId)
        : null;

      result.push({
        timeSlot: {
          id: slot.id,
          name: slot.name,
          startTime: slot.startTime,
          endTime: slot.endTime,
          dayOfWeek: slot.dayOfWeek,
        },
        occupied: true,
        schedule: {
          professorName: teacher?.name ?? 'Unknown',
          subjectName: subject?.name ?? 'Unknown',
        },
      });
    }

    return result;
  }
}
