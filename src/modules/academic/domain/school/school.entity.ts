import { AdminRequiredException } from './exceptions/admin-required.exception';

export interface SchoolProps {
  id: string;
  name: string;
  adminId: string;
  isActive: boolean;
  createdAt: Date;
}

export class School {
  constructor(private props: SchoolProps) {
    this.validate();
  }

  private validate() {
    if (!this.props.name || this.props.name.trim() === '') {
      throw new Error('School name is required');
    }

    if (!this.props.adminId) {
      throw new AdminRequiredException();
    }
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get adminId(): string {
    return this.props.adminId;
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
