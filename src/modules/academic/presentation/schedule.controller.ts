import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateScheduleUseCase } from '../application/use-cases/scheduling/create-schedule.use-case';
import { ListSchoolGridUseCase } from '../application/use-cases/scheduling/list-school-grid.use-case';
import { CreateScheduleDto } from '../application/dtos/scheduling/create-schedule.dto';
import { Schedule } from '../domain/scheduling/schedule.entity';

function toScheduleResponse(schedule: Schedule) {
  return {
    id: schedule.id,
    allocationId: schedule.allocationId,
    timeSlotId: schedule.timeSlotId,
  };
}

@Controller()
export class ScheduleController {
  constructor(
    private readonly createScheduleUseCase: CreateScheduleUseCase,
    private readonly listSchoolGridUseCase: ListSchoolGridUseCase,
  ) {}

  @Post('schedules')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateScheduleDto) {
    const schedule = await this.createScheduleUseCase.execute(dto);
    return toScheduleResponse(schedule);
  }

  @Get('school-grid/:schoolId')
  async listSchoolGrid(@Param('schoolId') schoolId: string) {
    return this.listSchoolGridUseCase.execute(schoolId);
  }
}
