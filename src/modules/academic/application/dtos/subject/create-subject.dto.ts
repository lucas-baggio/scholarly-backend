import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Subject name is required' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'School ID is required' })
  schoolId!: string;
}
