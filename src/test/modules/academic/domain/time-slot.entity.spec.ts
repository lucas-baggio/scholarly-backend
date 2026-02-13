import { TimeSlot } from '../../../../modules/academic/domain/scheduling/time-slot.entity';

describe('TimeSlot Entity', () => {
  const validProps = {
    id: 'slot-id',
    schoolId: 'school-id',
    name: '1ª Aula',
    startTime: '07:00',
    endTime: '07:50',
    dayOfWeek: 1,
  };

  it('should create a valid time slot', () => {
    const slot = new TimeSlot(validProps);
    expect(slot.id).toBe(validProps.id);
    expect(slot.name).toBe(validProps.name);
    expect(slot.startTime).toBe('07:00');
    expect(slot.endTime).toBe('07:50');
    expect(slot.dayOfWeek).toBe(1);
    expect(slot.schoolId).toBe(validProps.schoolId);
  });

  it('should throw if name is empty', () => {
    expect(() => new TimeSlot({ ...validProps, name: '' })).toThrow(
      'TimeSlot name is required',
    );
  });

  it('should throw if dayOfWeek is out of range', () => {
    expect(() => new TimeSlot({ ...validProps, dayOfWeek: 0 })).toThrow(
      'dayOfWeek must be between 1 and 7',
    );
    expect(() => new TimeSlot({ ...validProps, dayOfWeek: 8 })).toThrow(
      'dayOfWeek must be between 1 and 7',
    );
  });

  it('should throw if startTime is not before endTime', () => {
    expect(
      () =>
        new TimeSlot({ ...validProps, startTime: '08:00', endTime: '07:00' }),
    ).toThrow('startTime must be before endTime');
    expect(
      () =>
        new TimeSlot({ ...validProps, startTime: '07:00', endTime: '07:00' }),
    ).toThrow('startTime must be before endTime');
  });
});
