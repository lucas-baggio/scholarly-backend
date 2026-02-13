import { Subject } from '../../../../modules/academic/domain/subject/subject.entity';

describe('Subject Entity', () => {
  const validProps = {
    id: 'subject-id',
    name: 'Matemática',
    schoolId: 'school-id',
    isActive: true,
    createdAt: new Date(),
  };

  it('should create a valid subject', () => {
    const subject = new Subject(validProps);

    expect(subject.id).toBe(validProps.id);
    expect(subject.name).toBe(validProps.name);
    expect(subject.schoolId).toBe(validProps.schoolId);
    expect(subject.isActive).toBe(true);
    expect(subject.createdAt).toEqual(validProps.createdAt);
  });

  it('should throw Error if name is empty', () => {
    expect(() => {
      new Subject({ ...validProps, name: '' });
    }).toThrow('Subject name is required');
  });

  it('should throw Error if name is only whitespace', () => {
    expect(() => {
      new Subject({ ...validProps, name: '   ' });
    }).toThrow('Subject name is required');
  });

  it('should be able to deactivate a subject', () => {
    const subject = new Subject(validProps);
    subject.deactivate();
    expect(subject.isActive).toBe(false);
  });

  it('should be able to activate a subject', () => {
    const subject = new Subject({ ...validProps, isActive: false });
    subject.activate();
    expect(subject.isActive).toBe(true);
  });
});
