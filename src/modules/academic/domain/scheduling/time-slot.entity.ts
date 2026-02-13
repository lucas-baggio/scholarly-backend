import { timeToMinutes } from './helpers/time.utils';

export interface TimeSlotProps {
  id: string;
  schoolId: string;
  name: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
}

export class TimeSlot {
  constructor(private props: TimeSlotProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim() === '') {
      throw new Error('TimeSlot name is required');
    }
    if (this.props.dayOfWeek < 1 || this.props.dayOfWeek > 7) {
      throw new Error('dayOfWeek must be between 1 and 7');
    }
    const start = timeToMinutes(this.props.startTime);
    const end = timeToMinutes(this.props.endTime);
    if (start >= end) {
      throw new Error('startTime must be before endTime');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get schoolId(): string {
    return this.props.schoolId;
  }

  get name(): string {
    return this.props.name;
  }

  get startTime(): string {
    return this.props.startTime;
  }

  get endTime(): string {
    return this.props.endTime;
  }

  get dayOfWeek(): number {
    return this.props.dayOfWeek;
  }
}
