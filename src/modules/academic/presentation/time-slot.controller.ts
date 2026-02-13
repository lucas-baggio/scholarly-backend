import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { CreateTimeSlotUseCase } from '../application/use-cases/scheduling/create-time-slot.use-case';
import { CreateTimeSlotDto } from '../application/dtos/scheduling/create-time-slot.dto';
import { TimeSlot } from '../domain/scheduling/time-slot.entity';

function toTimeSlotResponse(slot: TimeSlot) {
  return {
    id: slot.id,
    schoolId: slot.schoolId,
    name: slot.name,
    startTime: slot.startTime,
    endTime: slot.endTime,
    dayOfWeek: slot.dayOfWeek,
  };
}

@Controller('time-slots')
export class TimeSlotController {
  constructor(private readonly createTimeSlotUseCase: CreateTimeSlotUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateTimeSlotDto,
    @Req() req: { user?: { userId: string } },
  ) {
    const adminUserId = req.user?.userId ?? dto.adminUserId ?? '';
    const timeSlot = await this.createTimeSlotUseCase.execute(dto, adminUserId);
    return toTimeSlotResponse(timeSlot);
  }
}
