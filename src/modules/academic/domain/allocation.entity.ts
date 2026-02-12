export interface AllocationProps {
  id: string;
  teacherId: string;
  schoolId: string;
  subjectId: string;
  createAt: Date;
}

export class Allocation {
  constructor(private props: AllocationProps) {}

  get id() {
    return this.props.id;
  }

  get teacherId() {
    return this.props.teacherId;
  }

  get schoolId() {
    return this.props.schoolId;
  }

  get subjectId() {
    return this.props.subjectId;
  }

  get createAt() {
    return this.props.createAt;
  }
}
