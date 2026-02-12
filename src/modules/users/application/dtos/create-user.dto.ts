import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../domain/enums/user-role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail({}, { message: 'O e-mail informado é inválido' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password!: string;

  @IsEnum(UserRole, { message: 'Papel do usuário deve ser ADMIN ou TEACHER' })
  @IsOptional()
  role?: UserRole;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subjects?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  schoolIds?: string[];
}
