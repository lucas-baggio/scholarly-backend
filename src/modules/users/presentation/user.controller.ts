import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../application/dtos/create-user.dto';
import { ListActiveUsersUseCase } from '../application/use-cases/list-active-users.use-case';
import { GetUserByIdUseCase } from '../application/use-cases/get-user-by-id.use-case';
import { DeactivateUserUseCase } from '../application/use-cases/deactivate-user.use-case';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getActiveUsersUseCase: ListActiveUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
  ) {}

  @Get()
  async findAll() {
    const users = await this.getActiveUsersUseCase.execute();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subjects: user.subjects,
      schoolIds: user.schoolIds,
    }));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(createUserDto);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      subjects: user.subjects,
      schoolIds: user.schoolIds,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.getUserByIdUseCase.execute(id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      subjects: user.subjects,
      schoolIds: user.schoolIds,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.deactivateUserUseCase.execute(id);
  }
}
