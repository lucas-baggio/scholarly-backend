import { User } from '../../../../modules/users/domain/user.entity';
import { UserRole } from '../../../../modules/users/domain/enums/user-role.enum';

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
    expect(user.role).toBe(UserRole.TEACHER);
    expect(user.subjects).toEqual([]);
    expect(user.schoolIds).toEqual([]);
  });

  it('should default role to TEACHER and schoolIds to empty array when not provided', () => {
    const user = new User(validProps);

    expect(user.role).toBe(UserRole.TEACHER);
    expect(user.schoolIds).toEqual([]);
  });

  it('should create user with ADMIN role when provided', () => {
    const user = new User({ ...validProps, role: UserRole.ADMIN });

    expect(user.role).toBe(UserRole.ADMIN);
    expect(user.isAdmin()).toBe(true);
    expect(user.isTeacher()).toBe(false);
  });

  it('should create user with TEACHER role and isTeacher returns true', () => {
    const user = new User({ ...validProps, role: UserRole.TEACHER });

    expect(user.isTeacher()).toBe(true);
    expect(user.isAdmin()).toBe(false);
  });

  it('should assign user to school with assignToSchool', () => {
    const user = new User(validProps);

    expect(user.schoolIds).toEqual([]);
    user.assignToSchool('school-1');
    expect(user.schoolIds).toEqual(['school-1']);
    user.assignToSchool('school-2');
    expect(user.schoolIds).toEqual(['school-1', 'school-2']);
    user.assignToSchool('school-1');
    expect(user.schoolIds).toEqual(['school-1', 'school-2']);
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

  it('should throw error if role is invalid', () => {
    expect(() => {
      new User({ ...validProps, role: 'INVALID' as UserRole });
    }).toThrow('Invalid user role');
  });
});
