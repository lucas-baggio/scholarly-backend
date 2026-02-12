import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Subject name is required' })
  name!: string;

  @IsUUID()
  @IsNotEmpty({ message: 'School ID is required' })
  schoolId!: string;
}
