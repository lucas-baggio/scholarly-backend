import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateScheduleUseCase } from '../../../../modules/academic/application/use-cases/scheduling/create-schedule.use-case';
import { Allocation } from '../../../../modules/academic/domain/allocation/allocation.entity';
import { Schedule } from '../../../../modules/academic/domain/scheduling/schedule.entity';
import { TimeSlot } from '../../../../modules/academic/domain/scheduling/time-slot.entity';
import { InMemoryAllocationRepository } from '../../../../modules/academic/infrastructure/persistence/allocation/in-memory-allocation.repository';
import { InMemoryScheduleRepository } from '../../../../modules/academic/infrastructure/persistence/scheduling/in-memory-schedule.repository';
import { InMemoryTimeSlotRepository } from '../../../../modules/academic/infrastructure/persistence/scheduling/in-memory-time-slot.repository';

describe('CreateScheduleUseCase', () => {
  let sut: CreateScheduleUseCase;
  let scheduleRepository: InMemoryScheduleRepository;
  let allocationRepository: InMemoryAllocationRepository;
  let timeSlotRepository: InMemoryTimeSlotRepository;

  const schoolId = 'school-id';
  const allocationId = 'allocation-id';
  const teacherId = 'teacher-id';
  const timeSlotId = 'timeslot-id';

  beforeEach(() => {
    scheduleRepository = new InMemoryScheduleRepository();
    allocationRepository = new InMemoryAllocationRepository();
    timeSlotRepository = new InMemoryTimeSlotRepository();
    sut = new CreateScheduleUseCase(
      scheduleRepository,
      allocationRepository,
      timeSlotRepository,
    );
  });

  it('should create schedule when allocation and timeSlot match and no conflicts', async () => {
    const allocation = new Allocation({
      id: allocationId,
      teacherId,
      schoolId,
      subjectId: 'subject-id',
      createAt: new Date(),
    });
    await allocationRepository.save(allocation);

    const timeSlot = new TimeSlot({
      id: timeSlotId,
      schoolId,
      name: '1ª Aula',
      startTime: '07:00',
      endTime: '07:50',
      dayOfWeek: 1,
    });
    await timeSlotRepository.save(timeSlot);

    const result = await sut.execute({ allocationId, timeSlotId });

    expect(result).toBeInstanceOf(Schedule);
    expect(result.allocationId).toBe(allocationId);
    expect(result.timeSlotId).toBe(timeSlotId);
    expect(scheduleRepository.schedules).toHaveLength(1);
  });

  it('should throw NotFoundException when allocation does not exist', async () => {
    const timeSlot = new TimeSlot({
      id: timeSlotId,
      schoolId,
      name: '1ª Aula',
      startTime: '07:00',
      endTime: '07:50',
      dayOfWeek: 1,
    });
    await timeSlotRepository.save(timeSlot);

    await expect(
      sut.execute({ allocationId: 'non-existent', timeSlotId }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException when timeSlot belongs to different school', async () => {
    const allocation = new Allocation({
      id: allocationId,
      teacherId,
      schoolId,
      subjectId: 'subject-id',
      createAt: new Date(),
    });
    await allocationRepository.save(allocation);

    const timeSlotOtherSchool = new TimeSlot({
      id: timeSlotId,
      schoolId: 'other-school-id',
      name: '1ª Aula',
      startTime: '07:00',
      endTime: '07:50',
      dayOfWeek: 1,
    });
    await timeSlotRepository.save(timeSlotOtherSchool);

    await expect(sut.execute({ allocationId, timeSlotId })).rejects.toThrow(
      ConflictException,
    );
    await expect(sut.execute({ allocationId, timeSlotId })).rejects.toThrow(
      'TimeSlot must belong to the same school as the allocation',
    );
    expect(scheduleRepository.schedules).toHaveLength(0);
  });

  it('should throw ConflictException when timeSlot is already occupied (local conflict)', async () => {
    const allocation = new Allocation({
      id: allocationId,
      teacherId,
      schoolId,
      subjectId: 'subject-id',
      createAt: new Date(),
    });
    await allocationRepository.save(allocation);

    const timeSlot = new TimeSlot({
      id: timeSlotId,
      schoolId,
      name: '1ª Aula',
      startTime: '07:00',
      endTime: '07:50',
      dayOfWeek: 1,
    });
    await timeSlotRepository.save(timeSlot);

    const existingSchedule = new Schedule({
      id: 'existing-id',
      allocationId: 'other-allocation-id',
      timeSlotId,
    });
    await scheduleRepository.save(existingSchedule);

    await expect(sut.execute({ allocationId, timeSlotId })).rejects.toThrow(
      ConflictException,
    );
    await expect(sut.execute({ allocationId, timeSlotId })).rejects.toThrow(
      'This time slot is already occupied at this school',
    );
    expect(scheduleRepository.schedules).toHaveLength(1);
  });

  it('should throw ConflictException when teacher has overlapping schedule same day (global conflict)', async () => {
    const allocation1 = new Allocation({
      id: allocationId,
      teacherId,
      schoolId,
      subjectId: 'subject-1',
      createAt: new Date(),
    });
    await allocationRepository.save(allocation1);

    const timeSlot1 = new TimeSlot({
      id: timeSlotId,
      schoolId,
      name: '1ª Aula',
      startTime: '07:00',
      endTime: '07:50',
      dayOfWeek: 1,
    });
    await timeSlotRepository.save(timeSlot1);

    const otherSchoolId = 'other-school-id';
    const allocation2 = new Allocation({
      id: 'allocation-2',
      teacherId,
      schoolId: otherSchoolId,
      subjectId: 'subject-2',
      createAt: new Date(),
    });
    await allocationRepository.save(allocation2);

    const timeSlot2 = new TimeSlot({
      id: 'timeslot-2',
      schoolId: otherSchoolId,
      name: '1ª Aula',
      startTime: '07:00',
      endTime: '07:50',
      dayOfWeek: 1,
    });
    await timeSlotRepository.save(timeSlot2);

    const existingSchedule = new Schedule({
      id: 'existing-id',
      allocationId: allocation2.id,
      timeSlotId: timeSlot2.id,
    });
    await scheduleRepository.save(existingSchedule);

    await expect(sut.execute({ allocationId, timeSlotId })).rejects.toThrow(
      ConflictException,
    );
    await expect(sut.execute({ allocationId, timeSlotId })).rejects.toThrow(
      'Teacher already has a schedule at the same day and time',
    );
    expect(scheduleRepository.schedules).toHaveLength(1);
  });

  it('should allow same teacher when other schedule is different day', async () => {
    const allocation1 = new Allocation({
      id: allocationId,
      teacherId,
      schoolId,
      subjectId: 'subject-1',
      createAt: new Date(),
    });
    await allocationRepository.save(allocation1);

    const timeSlot1 = new TimeSlot({
      id: timeSlotId,
      schoolId,
      name: '1ª Aula Segunda',
      startTime: '07:00',
      endTime: '07:50',
      dayOfWeek: 1,
    });
    await timeSlotRepository.save(timeSlot1);

    const allocation2 = new Allocation({
      id: 'allocation-2',
      teacherId,
      schoolId: 'other-school',
      subjectId: 'subject-2',
      createAt: new Date(),
    });
    await allocationRepository.save(allocation2);

    const timeSlot2 = new TimeSlot({
      id: 'timeslot-2',
      schoolId: 'other-school',
      name: '1ª Aula Terça',
      startTime: '07:00',
      endTime: '07:50',
      dayOfWeek: 2,
    });
    await timeSlotRepository.save(timeSlot2);

    await scheduleRepository.save(
      new Schedule({
        id: 'existing-id',
        allocationId: allocation2.id,
        timeSlotId: timeSlot2.id,
      }),
    );

    const result = await sut.execute({ allocationId, timeSlotId });
    expect(result).toBeInstanceOf(Schedule);
    expect(scheduleRepository.schedules).toHaveLength(2);
  });

  it('should allow same teacher when other schedule is same day but different time', async () => {
    const allocation1 = new Allocation({
      id: allocationId,
      teacherId,
      schoolId,
      subjectId: 'subject-1',
      createAt: new Date(),
    });
    await allocationRepository.save(allocation1);

    const timeSlot1 = new TimeSlot({
      id: timeSlotId,
      schoolId,
      name: '1ª Aula',
      startTime: '07:00',
      endTime: '07:50',
      dayOfWeek: 1,
    });
    await timeSlotRepository.save(timeSlot1);

    const allocation2 = new Allocation({
      id: 'allocation-2',
      teacherId,
      schoolId,
      subjectId: 'subject-2',
      createAt: new Date(),
    });
    await allocationRepository.save(allocation2);

    const timeSlot2 = new TimeSlot({
      id: 'timeslot-2',
      schoolId,
      name: '2ª Aula',
      startTime: '08:00',
      endTime: '08:50',
      dayOfWeek: 1,
    });
    await timeSlotRepository.save(timeSlot2);

    await scheduleRepository.save(
      new Schedule({
        id: 'existing-id',
        allocationId: allocation2.id,
        timeSlotId: timeSlot2.id,
      }),
    );

    const result = await sut.execute({ allocationId, timeSlotId });
    expect(result).toBeInstanceOf(Schedule);
    expect(scheduleRepository.schedules).toHaveLength(2);
  });
});
