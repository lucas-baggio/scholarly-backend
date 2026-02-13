import { AdminRequiredException } from '../../../../modules/academic/domain/school/exceptions/admin-required.exception';
import { School } from '../../../../modules/academic/domain/school/school.entity';

describe('School Entity', () => {
  const validProps = {
    id: 'any-id',
    name: 'Escola de Teste',
    adminId: 'admin-id',
    isActive: true,
    createdAt: new Date(),
  };

  it('should create a valid school', () => {
    const school = new School(validProps);

    expect(school.id).toBe(validProps.id);
    expect(school.name).toBe(validProps.name);
    expect(school.adminId).toBe(validProps.adminId);
    expect(school.isActive).toBe(true);
  });

  it('should throw Error if name is empty', () => {
    expect(() => {
      new School({ ...validProps, name: '' });
    }).toThrow('School name is required');
  });

  it('should throw AdminRequiredException if adminId is missing', () => {
    expect(() => {
      new School({ ...validProps, adminId: '' });
    }).toThrow(AdminRequiredException);

    try {
      new School({ ...validProps, adminId: '' });
    } catch (error) {
      if (error instanceof AdminRequiredException) {
        expect(error.code).toBe('ADMIN_REQUIRED');
      } else {
        throw error;
      }
    }
  });

  it('should be able to deactivate a school', () => {
    const school = new School(validProps);
    school.deactivate();
    expect(school.isActive).toBe(false);
  });
});
