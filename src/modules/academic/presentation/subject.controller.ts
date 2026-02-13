import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateSubjectUseCase } from '../application/use-cases/subject/create-subject.use-case';
import { ListSubjectsBySchoolUseCase } from '../application/use-cases/subject/list-subjects-by-school.use-case';
import { CreateSubjectDto } from '../application/dtos/subject/create-subject.dto';
import { Subject } from '../domain/subject/subject.entity';

function toSubjectResponse(subject: Subject) {
  return {
    id: subject.id,
    name: subject.name,
    schoolId: subject.schoolId,
    isActive: subject.isActive,
  };
}

@Controller('subjects')
export class SubjectController {
  constructor(
    private readonly createSubjectUseCase: CreateSubjectUseCase,
    private readonly listSubjectsBySchoolUseCase: ListSubjectsBySchoolUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateSubjectDto) {
    const subject = await this.createSubjectUseCase.execute(dto);
    return toSubjectResponse(subject);
  }

  @Get('school/:schoolId')
  async listBySchool(@Param('schoolId') schoolId: string) {
    const subjects = await this.listSubjectsBySchoolUseCase.execute(schoolId);
    return subjects.map(toSubjectResponse);
  }
}
