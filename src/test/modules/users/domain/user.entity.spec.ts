import { User } from '../../../../modules/users/domain/user.entity';

describe('User Entity', () => {
  const validProps = {
    id: 'user-uuid',
    name: 'João Silva',
    email: 'joao@dev.com',
    password: 'hashed_password',
    isActive: true,
    createdAt: new Date(),
  };

  it('should create a valid user instance', () => {
    const user = new User(validProps);

    expect(user.id).toBe(validProps.id);
    expect(user.name).toBe(validProps.name);
    expect(user.email).toBe(validProps.email);
    expect(user.isActive).toBe(true);
  });

  it('should deactivate a user correctly', () => {
    const user = new User(validProps);

    expect(user.isActive).toBe(true);
    user.deactive();
    expect(user.isActive).toBe(false);
  });

  it('should throw error if name is empty', () => {
    expect(() => {
      new User({ ...validProps, name: '' });
    }).toThrow();
  });
});
