export interface SubjectProps {
  id: string;
  name: string;
  schoolId: string;
  isActive: boolean;
  createdAt: Date;
}

export class Subject {
  constructor(private props: SubjectProps) {
    this.validate();
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim() === '') {
      throw new Error('Subject name is required');
    }
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get schoolId(): string {
    return this.props.schoolId;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  deactivate(): void {
    this.props.isActive = false;
  }

  activate(): void {
    this.props.isActive = true;
  }
}
