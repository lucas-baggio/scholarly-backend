import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Matches,
} from 'class-validator';

export class CreateTimeSlotDto {
  @IsString()
  @IsNotEmpty({ message: 'School ID is required' })
  schoolId!: string;

  /** For development/testing when auth is not applied. Remove when using JWT + CurrentUser. */
  @IsString()
  @IsOptional()
  adminUserId?: string;

  @IsString()
  @IsNotEmpty({ message: 'TimeSlot name is required' })
  name!: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be HH:mm',
  })
  startTime!: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be HH:mm',
  })
  endTime!: string;

  @IsNumber()
  @Min(1, { message: 'dayOfWeek must be between 1 and 7' })
  @Max(7, { message: 'dayOfWeek must be between 1 and 7' })
  dayOfWeek!: number;
}
