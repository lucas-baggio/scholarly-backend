import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateSchoolUseCase } from '../application/use-cases/school/create-school.use-case';
import { GetSchoolByIdUseCase } from '../application/use-cases/school/get-school-by-id.use-case';
import { ListActiveSchoolsUseCase } from '../application/use-cases/school/list-active-schools.use-case';
import { GetSchoolsByAdminUseCase } from '../application/use-cases/school/get-school-by-admin-id.use-case';
import { CreateSchoolDto } from '../application/dtos/school/create-school.dto';

@Controller('schools')
export class SchoolController {
  constructor(
    private readonly createSchoolUseCase: CreateSchoolUseCase,
    private readonly getSchoolByIdUseCase: GetSchoolByIdUseCase,
    private readonly listAllActiveSchoolsUseCase: ListActiveSchoolsUseCase,
    private readonly getSchoolsByAdminUseCase: GetSchoolsByAdminUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateSchoolDto) {
    const school = await this.createSchoolUseCase.execute(dto);
    return {
      id: school.id,
      name: school.name,
      adminId: school.adminId,
      isActive: school.isActive,
    };
  }

  @Get()
  async listAll() {
    const schools = await this.listAllActiveSchoolsUseCase.execute();
    return schools.map((school) => ({
      id: school.id,
      name: school.name,
      adminId: school.adminId,
      isActive: school.isActive,
    }));
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.getSchoolByIdUseCase.execute(id);
  }

  @Get('admin/:adminId')
  async getByAdmin(@Param('adminId') adminId: string) {
    return await this.getSchoolsByAdminUseCase.execute(adminId);
  }
}
