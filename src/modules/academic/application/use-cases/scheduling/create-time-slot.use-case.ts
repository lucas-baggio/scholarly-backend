import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SchoolRepository } from '../../../domain/school/school.repository';
import { TimeSlotRepository } from '../../../domain/scheduling/time-slot.repository';
import { TimeSlot } from '../../../domain/scheduling/time-slot.entity';
import { CreateTimeSlotDto } from '../../dtos/scheduling/create-time-slot.dto';

@Injectable()
export class CreateTimeSlotUseCase {
  constructor(
    private readonly timeSlotRepository: TimeSlotRepository,
    private readonly schoolRepository: SchoolRepository,
  ) {}

  async execute(
    dto: CreateTimeSlotDto,
    adminUserId: string,
  ): Promise<TimeSlot> {
    const school = await this.schoolRepository.findById(dto.schoolId);
    if (!school) {
      throw new NotFoundException(`School with ID ${dto.schoolId} not found`);
    }
    if (school.adminId !== adminUserId) {
      throw new ForbiddenException(
        'Only the school admin can create time slots for this school',
      );
    }

    const timeSlot = new TimeSlot({
      id: crypto.randomUUID(),
      schoolId: dto.schoolId,
      name: dto.name.trim(),
      startTime: dto.startTime,
      endTime: dto.endTime,
      dayOfWeek: dto.dayOfWeek,
    });

    await this.timeSlotRepository.save(timeSlot);
    return timeSlot;
  }
}
