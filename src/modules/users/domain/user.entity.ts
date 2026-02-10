export interface UserProps {
  id: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  subjects?: string[];
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    if (!props.email.includes('@')) {
      throw new Error('Invalid email format');
    }

    this.props = {
      ...props,
      isActive: props.isActive ?? true,
    };
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
    return this.props.subjects || [];
  }

  public deactive() {
    this.props.isActive = false;
  }
}
