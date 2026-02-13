import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateAllocationUseCase } from '../application/use-cases/allocation/create-allocation.use-case';
import { ListAllocationsByTeacherUseCase } from '../application/use-cases/allocation/list-allocations-by-teacher.use-case';
import { CreateAllocationDto } from '../application/dtos/allocation/create-allocation.dto';
import { Allocation } from '../domain/allocation/allocation.entity';

function toAllocationResponse(allocation: Allocation) {
  return {
    id: allocation.id,
    teacherId: allocation.teacherId,
    schoolId: allocation.schoolId,
    subjectId: allocation.subjectId,
  };
}

@Controller('allocations')
export class AllocationController {
  constructor(
    private readonly createAllocationUseCase: CreateAllocationUseCase,
    private readonly listAllocationsByTeacherUseCase: ListAllocationsByTeacherUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAllocationDto) {
    const allocation = await this.createAllocationUseCase.execute(dto);
    return toAllocationResponse(allocation);
  }

  @Get('teacher/:teacherId')
  async listByTeacher(@Param('teacherId') teacherId: string) {
    const allocations =
      await this.listAllocationsByTeacherUseCase.execute(teacherId);
    return allocations.map(toAllocationResponse);
  }
}
