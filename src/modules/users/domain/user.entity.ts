import { UserRole } from './enums/user-role.enum';

export interface UserProps {
  id?: string;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
  subjects?: string[];
  schoolIds?: string[];
  createdAt?: Date;
}

type UserPropsResolved = Required<
  Pick<UserProps, 'name' | 'email' | 'password'>
> &
  Partial<UserProps> & {
    isActive: boolean;
    subjects: string[];
    schoolIds: string[];
    role: UserRole;
    createdAt: Date;
  };

export class User {
  private props: UserPropsResolved;

  constructor(props: UserProps) {
    const resolved: UserPropsResolved = {
      ...props,
      isActive: props.isActive ?? true,
      subjects: props.subjects ?? [],
      schoolIds: props.schoolIds ?? [],
      role: props.role ?? UserRole.TEACHER,
      createdAt: props.createdAt ?? new Date(),
    };
    this.props = resolved;
    this.validate();
  }

  private validate() {
    if (!this.props || !this.props.name || this.props.name.trim() === '') {
      throw new Error('User name is required');
    }

    if (!this.props.email || !this.props.email.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (!Object.values(UserRole).includes(this.props.role)) {
      throw new Error('Invalid user role');
    }
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get email() {
    return this.props.email;
  }
  get password() {
    return this.props.password;
  }
  get isActive() {
    return this.props.isActive;
  }
  get subjects() {
    return this.props.subjects;
  }

  get schoolIds() {
    return this.props.schoolIds;
  }

  get role() {
    return this.props.role;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  public deactive() {
    this.props.isActive = false;
  }

  public isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  public isTeacher(): boolean {
    return this.props.role === UserRole.TEACHER;
  }

  public assignToSchool(schoolId: string): void {
    if (!this.props.schoolIds.includes(schoolId)) {
      this.props.schoolIds.push(schoolId);
    }
  }
}
