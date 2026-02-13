import { ListSchoolGridUseCase } from '../../../../modules/academic/application/use-cases/scheduling/list-school-grid.use-case';
import { Allocation } from '../../../../modules/academic/domain/allocation/allocation.entity';
import { Schedule } from '../../../../modules/academic/domain/scheduling/schedule.entity';
import { Subject } from '../../../../modules/academic/domain/subject/subject.entity';
import { TimeSlot } from '../../../../modules/academic/domain/scheduling/time-slot.entity';
import { User } from '../../../../modules/users/domain/user.entity';
import { UserRole } from '../../../../modules/users/domain/enums/user-role.enum';
import { InMemoryAllocationRepository } from '../../../../modules/academic/infrastructure/persistence/allocation/in-memory-allocation.repository';
import { InMemoryScheduleRepository } from '../../../../modules/academic/infrastructure/persistence/scheduling/in-memory-schedule.repository';
import { InMemoryTimeSlotRepository } from '../../../../modules/academic/infrastructure/persistence/scheduling/in-memory-time-slot.repository';
import { InMemoryUserRepository } from '../../../../modules/users/infrastructure/persistence/in-memory-user.repository';
import { InMemorySubjectRepository } from '../../../../modules/academic/infrastructure/persistence/subject/in-memory-subject.repository';

describe('ListSchoolGridUseCase', () => {
  let sut: ListSchoolGridUseCase;
  let timeSlotRepository: InMemoryTimeSlotRepository;
  let scheduleRepository: InMemoryScheduleRepository;
  let allocationRepository: InMemoryAllocationRepository;
  let userRepository: InMemoryUserRepository;
  let subjectRepository: InMemorySubjectRepository;

  const schoolId = 'school-id';

  beforeEach(() => {
    timeSlotRepository = new InMemoryTimeSlotRepository();
    scheduleRepository = new InMemoryScheduleRepository();
    allocationRepository = new InMemoryAllocationRepository();
    userRepository = new InMemoryUserRepository();
    subjectRepository = new InMemorySubjectRepository();
    sut = new ListSchoolGridUseCase(
      timeSlotRepository,
      scheduleRepository,
      allocationRepository,
      userRepository,
      subjectRepository,
    );
  });

  it('should return empty array when school has no time slots', async () => {
    const result = await sut.execute(schoolId);
    expect(result).toEqual([]);
  });

  it('should return slots with occupied false when no schedules', async () => {
    const slot = new TimeSlot({
      id: 'slot-id',
      schoolId,
      name: '1ª Aula',
      startTime: '07:00',
      endTime: '07:50',
      dayOfWeek: 1,
    });
    await timeSlotRepository.save(slot);

    const result = await sut.execute(schoolId);

    expect(result).toHaveLength(1);
    expect(result[0].timeSlot.name).toBe('1ª Aula');
    expect(result[0].occupied).toBe(false);
    expect(result[0].schedule).toBeUndefined();
  });

  it('should return slots with professor and subject when occupied', async () => {
    const slot = new TimeSlot({
      id: 'slot-id',
      schoolId,
      name: '1ª Aula',
      startTime: '07:00',
      endTime: '07:50',
      dayOfWeek: 1,
    });
    await timeSlotRepository.save(slot);

    const teacher = new User({
      id: 'teacher-id',
      name: 'Professor X',
      email: 'prof@escola.com',
      password: '123456',
      role: UserRole.TEACHER,
    });
    await userRepository.save(teacher);

    const subject = new Subject({
      id: 'subject-id',
      name: 'Matemática',
      schoolId,
      isActive: true,
      createdAt: new Date(),
    });
    await subjectRepository.save(subject);

    const allocation = new Allocation({
      id: 'allocation-id',
      teacherId: teacher.id!,
      schoolId,
      subjectId: subject.id,
      createAt: new Date(),
    });
    await allocationRepository.save(allocation);

    const schedule = new Schedule({
      id: 'schedule-id',
      allocationId: allocation.id,
      timeSlotId: slot.id,
    });
    await scheduleRepository.save(schedule);

    const result = await sut.execute(schoolId);

    expect(result).toHaveLength(1);
    expect(result[0].occupied).toBe(true);
    expect(result[0].schedule?.professorName).toBe('Professor X');
    expect(result[0].schedule?.subjectName).toBe('Matemática');
  });
});
