import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateScheduleDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Allocation ID is required' })
  allocationId!: string;

  @IsUUID()
  @IsNotEmpty({ message: 'TimeSlot ID is required' })
  timeSlotId!: string;
}
