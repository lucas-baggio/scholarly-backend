import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateTimeSlotUseCase } from '../../../../modules/academic/application/use-cases/scheduling/create-time-slot.use-case';
import { School } from '../../../../modules/academic/domain/school/school.entity';
import { InMemorySchoolRepository } from '../../../../modules/academic/infrastructure/persistence/school/in-memory-school.repository';
import { InMemoryTimeSlotRepository } from '../../../../modules/academic/infrastructure/persistence/scheduling/in-memory-time-slot.repository';

describe('CreateTimeSlotUseCase', () => {
  let sut: CreateTimeSlotUseCase;
  let timeSlotRepository: InMemoryTimeSlotRepository;
  let schoolRepository: InMemorySchoolRepository;

  const adminId = 'admin-id';
  const schoolId = 'school-id';

  beforeEach(() => {
    timeSlotRepository = new InMemoryTimeSlotRepository();
    schoolRepository = new InMemorySchoolRepository();
    sut = new CreateTimeSlotUseCase(timeSlotRepository, schoolRepository);
  });

  it('should create time slot when requester is the school admin', async () => {
    const school = new School({
      id: schoolId,
      name: 'Escola',
      adminId,
      isActive: true,
      createdAt: new Date(),
    });
    await schoolRepository.save(school);

    const result = await sut.execute(
      {
        schoolId,
        name: '1ª Aula',
        startTime: '07:00',
        endTime: '07:50',
        dayOfWeek: 1,
      },
      adminId,
    );

    expect(result.id).toBeDefined();
    expect(result.name).toBe('1ª Aula');
    expect(result.schoolId).toBe(schoolId);
    expect(result.startTime).toBe('07:00');
    expect(result.endTime).toBe('07:50');
    expect(result.dayOfWeek).toBe(1);
    expect(timeSlotRepository.timeSlots).toHaveLength(1);
  });

  it('should throw NotFoundException when school does not exist', async () => {
    await expect(
      sut.execute(
        {
          schoolId: 'non-existent',
          name: '1ª Aula',
          startTime: '07:00',
          endTime: '07:50',
          dayOfWeek: 1,
        },
        adminId,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when requester is not the school admin', async () => {
    const school = new School({
      id: schoolId,
      name: 'Escola',
      adminId,
      isActive: true,
      createdAt: new Date(),
    });
    await schoolRepository.save(school);

    await expect(
      sut.execute(
        {
          schoolId,
          name: '1ª Aula',
          startTime: '07:00',
          endTime: '07:50',
          dayOfWeek: 1,
        },
        'other-user-id',
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(timeSlotRepository.timeSlots).toHaveLength(0);
  });
});
