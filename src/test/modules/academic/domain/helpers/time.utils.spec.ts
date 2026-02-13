import {
  timeToMinutes,
  minutesToTime,
  timeRangesOverlap,
} from '../../../../../modules/academic/domain/scheduling/helpers/time.utils';

describe('time.utils', () => {
  describe('timeToMinutes', () => {
    it('should convert HH:mm to minutes since midnight', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('07:00')).toBe(420);
      expect(timeToMinutes('07:50')).toBe(470);
      expect(timeToMinutes('12:30')).toBe(750);
      expect(timeToMinutes('23:59')).toBe(1439);
    });

    it('should accept single-digit hour', () => {
      expect(timeToMinutes('9:00')).toBe(540);
    });

    it('should throw on invalid format', () => {
      expect(() => timeToMinutes('25:00')).toThrow('Invalid time format');
      expect(() => timeToMinutes('07:60')).toThrow('Invalid time format');
      expect(() => timeToMinutes('invalid')).toThrow('Invalid time format');
    });
  });

  describe('minutesToTime', () => {
    it('should convert minutes since midnight to HH:mm', () => {
      expect(minutesToTime(0)).toBe('00:00');
      expect(minutesToTime(420)).toBe('07:00');
      expect(minutesToTime(470)).toBe('07:50');
      expect(minutesToTime(750)).toBe('12:30');
      expect(minutesToTime(1439)).toBe('23:59');
    });

    it('should throw when out of range', () => {
      expect(() => minutesToTime(-1)).toThrow('Invalid totalMinutes');
      expect(() => minutesToTime(24 * 60)).toThrow('Invalid totalMinutes');
    });
  });

  describe('timeRangesOverlap', () => {
    it('should return true when ranges overlap', () => {
      expect(timeRangesOverlap('07:00', '07:50', '07:30', '08:00')).toBe(true);
      expect(timeRangesOverlap('07:30', '08:00', '07:00', '07:50')).toBe(true);
      expect(timeRangesOverlap('07:00', '08:00', '07:15', '07:45')).toBe(true);
    });

    it('should return false when ranges do not overlap', () => {
      expect(timeRangesOverlap('07:00', '07:50', '07:50', '08:30')).toBe(false);
      expect(timeRangesOverlap('07:50', '08:30', '07:00', '07:50')).toBe(false);
      expect(timeRangesOverlap('08:00', '09:00', '07:00', '07:50')).toBe(false);
    });

    it('should use numeric comparison (470 > 420)', () => {
      expect(timeRangesOverlap('07:00', '07:50', '07:00', '07:50')).toBe(true);
      expect(timeRangesOverlap('07:00', '07:50', '07:49', '08:00')).toBe(true);
    });
  });
});
