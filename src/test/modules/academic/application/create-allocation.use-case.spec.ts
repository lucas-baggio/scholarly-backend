import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateAllocationUseCase } from '../../../../modules/academic/application/use-cases/create-allocation.use-case';
import { SchoolInactiveException } from '../../../../modules/academic/domain/exceptions/school-inactive.exception';
import { School } from '../../../../modules/academic/domain/school.entity';
import { Subject } from '../../../../modules/academic/domain/subject.entity';
import { InMemoryAllocationRepository } from '../../../../modules/academic/infrastructure/persistence/in-memory-allocation.repository';
import { InMemorySchoolRepository } from '../../../../modules/academic/infrastructure/persistence/in-memory-school.repository';
import { InMemorySubjectRepository } from '../../../../modules/academic/infrastructure/persistence/in-memory-subject.repository';
import { User } from '../../../../modules/users/domain/user.entity';
import { UserRole } from '../../../../modules/users/domain/enums/user-role.enum';
import { InMemoryUserRepository } from '../../../../modules/users/infrastructure/persistence/in-memory-user.repository';

describe('CreateAllocationUseCase', () => {
  let sut: CreateAllocationUseCase;
  let allocationRepository: InMemoryAllocationRepository;
  let schoolRepository: InMemorySchoolRepository;
  let subjectRepository: InMemorySubjectRepository;
  let userRepository: InMemoryUserRepository;

  const schoolId = 'school-id';
  const subjectId = 'subject-id';
  const teacherId = 'teacher-id';

  beforeEach(() => {
    allocationRepository = new InMemoryAllocationRepository();
    schoolRepository = new InMemorySchoolRepository();
    subjectRepository = new InMemorySubjectRepository();
    userRepository = new InMemoryUserRepository();
    sut = new CreateAllocationUseCase(
      allocationRepository,
      schoolRepository,
      subjectRepository,
      userRepository,
    );
  });

  it('should create allocation and sync teacher schoolIds and subjects', async () => {
    const teacher = new User({
      id: teacherId,
      name: 'Professor',
      email: 'prof@escola.com',
      password: '123456',
      role: UserRole.TEACHER,
      schoolIds: [],
      subjects: [],
    });
    await userRepository.save(teacher);

    const school = new School({
      id: schoolId,
      name: 'Escola Ativa',
      adminId: 'admin-id',
      isActive: true,
      createdAt: new Date(),
    });
    await schoolRepository.save(school);

    const subject = new Subject({
      id: subjectId,
      name: 'Matemática',
      schoolId,
      isActive: true,
      createdAt: new Date(),
    });
    await subjectRepository.save(subject);

    const result = await sut.execute({
      teacherId,
      schoolId,
      subjectId,
    });

    expect(result.teacherId).toBe(teacherId);
    expect(result.schoolId).toBe(schoolId);
    expect(result.subjectId).toBe(subjectId);
    expect(allocationRepository.allocations).toHaveLength(1);

    const updatedTeacher = await userRepository.findById(teacherId);
    expect(updatedTeacher?.schoolIds).toContain(schoolId);
    expect(updatedTeacher?.subjects).toContain(subjectId);
  });

  it('should throw NotFoundException when teacher does not exist', async () => {
    await expect(
      sut.execute({
        teacherId: 'non-existent',
        schoolId,
        subjectId,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when user is not a teacher', async () => {
    const admin = new User({
      id: 'admin-id',
      name: 'Admin',
      email: 'admin@escola.com',
      password: '123456',
      role: UserRole.ADMIN,
    });
    await userRepository.save(admin);

    const school = new School({
      id: schoolId,
      name: 'Escola',
      adminId: 'admin-id',
      isActive: true,
      createdAt: new Date(),
    });
    await schoolRepository.save(school);
    const subject = new Subject({
      id: subjectId,
      name: 'Mat',
      schoolId,
      isActive: true,
      createdAt: new Date(),
    });
    await subjectRepository.save(subject);

    await expect(
      sut.execute({
        teacherId: 'admin-id',
        schoolId,
        subjectId,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw SchoolInactiveException when school is inactive', async () => {
    const teacher = new User({
      id: teacherId,
      name: 'Professor',
      email: 'p@e.com',
      password: '123456',
      role: UserRole.TEACHER,
    });
    await userRepository.save(teacher);

    const inactiveSchool = new School({
      id: 'inactive-school-id',
      name: 'Escola Inativa',
      adminId: 'admin-id',
      isActive: false,
      createdAt: new Date(),
    });
    await schoolRepository.save(inactiveSchool);

    const subject = new Subject({
      id: subjectId,
      name: 'Mat',
      schoolId: 'inactive-school-id',
      isActive: true,
      createdAt: new Date(),
    });
    await subjectRepository.save(subject);

    await expect(
      sut.execute({
        teacherId,
        schoolId: 'inactive-school-id',
        subjectId,
      }),
    ).rejects.toThrow(SchoolInactiveException);
    expect(allocationRepository.allocations).toHaveLength(0);
  });

  it('should throw NotFoundException when subject does not belong to school', async () => {
    const teacher = new User({
      id: teacherId,
      name: 'Professor',
      email: 'p@e.com',
      password: '123456',
      role: UserRole.TEACHER,
    });
    await userRepository.save(teacher);
    const school = new School({
      id: schoolId,
      name: 'Escola',
      adminId: 'admin-id',
      isActive: true,
      createdAt: new Date(),
    });
    await schoolRepository.save(school);
    const subject = new Subject({
      id: subjectId,
      name: 'Mat',
      schoolId: 'other-school-id',
      isActive: true,
      createdAt: new Date(),
    });
    await subjectRepository.save(subject);

    await expect(
      sut.execute({
        teacherId,
        schoolId,
        subjectId,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException when allocation already exists', async () => {
    const teacher = new User({
      id: teacherId,
      name: 'Professor',
      email: 'p@e.com',
      password: '123456',
      role: UserRole.TEACHER,
    });
    await userRepository.save(teacher);
    const school = new School({
      id: schoolId,
      name: 'Escola',
      adminId: 'admin-id',
      isActive: true,
      createdAt: new Date(),
    });
    await schoolRepository.save(school);
    const subject = new Subject({
      id: subjectId,
      name: 'Mat',
      schoolId,
      isActive: true,
      createdAt: new Date(),
    });
    await subjectRepository.save(subject);

    await sut.execute({ teacherId, schoolId, subjectId });

    await expect(
      sut.execute({ teacherId, schoolId, subjectId }),
    ).rejects.toThrow(ConflictException);
    expect(allocationRepository.allocations).toHaveLength(1);
  });
});
