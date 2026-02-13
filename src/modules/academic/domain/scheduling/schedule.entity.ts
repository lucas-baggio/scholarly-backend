export interface ScheduleProps {
  id: string;
  allocationId: string;
  timeSlotId: string;
}

export class Schedule {
  constructor(private props: ScheduleProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.allocationId || !this.props.timeSlotId) {
      throw new Error('allocationId and timeSlotId are required');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get allocationId(): string {
    return this.props.allocationId;
  }

  get timeSlotId(): string {
    return this.props.timeSlotId;
  }
}
