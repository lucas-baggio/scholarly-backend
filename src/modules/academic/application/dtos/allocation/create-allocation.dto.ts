import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAllocationDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Teacher ID is required' })
  teacherId!: string;

  @IsUUID()
  @IsNotEmpty({ message: 'School ID is required' })
  schoolId!: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Subject ID is required' })
  subjectId!: string;
}
