import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAllocationDto {
  @IsString()
  @IsNotEmpty({ message: 'Teacher ID is required' })
  teacherId!: string;

  @IsString()
  @IsNotEmpty({ message: 'School ID is required' })
  schoolId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Subject ID is required' })
  subjectId!: string;
}
