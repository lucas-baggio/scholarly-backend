import { IsNotEmpty, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty({ message: 'Allocation ID is required' })
  allocationId!: string;

  @IsString()
  @IsNotEmpty({ message: 'TimeSlot ID is required' })
  timeSlotId!: string;
}
