import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  @IsNotEmpty()
  adminId!: string;
}
