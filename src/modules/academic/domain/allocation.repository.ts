import { Allocation } from './allocation.entity';

export abstract class AllocationRepository {
  abstract save(allocation: Allocation): Promise<void>;
  abstract findById(id: string): Promise<Allocation | null>;
  abstract findByTeacherId(teacherId: string): Promise<Allocation[]>;
  abstract findBySchoolId(schoolId: string): Promise<Allocation[]>;
  abstract exists(
    teacherId: string,
    schoolId: string,
    subjectId: string,
  ): Promise<boolean>;
}
