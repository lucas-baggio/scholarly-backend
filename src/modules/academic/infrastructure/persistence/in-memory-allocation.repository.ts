import { Allocation } from '../../domain/allocation.entity';
import { AllocationRepository } from '../../domain/allocation.repository';

export class InMemoryAllocationRepository implements AllocationRepository {
  public allocations: Allocation[] = [];

  save(allocation: Allocation): Promise<void> {
    const index = this.allocations.findIndex((a) => a.id === allocation.id);
    if (index >= 0) {
      this.allocations[index] = allocation;
    } else {
      this.allocations.push(allocation);
    }
    return Promise.resolve();
  }

  findById(id: string): Promise<Allocation | null> {
    const allocation = this.allocations.find((a) => a.id === id) ?? null;
    return Promise.resolve(allocation);
  }

  findByTeacherId(teacherId: string): Promise<Allocation[]> {
    return Promise.resolve(
      this.allocations.filter((a) => a.teacherId === teacherId),
    );
  }

  findBySchoolId(schoolId: string): Promise<Allocation[]> {
    return Promise.resolve(
      this.allocations.filter((a) => a.schoolId === schoolId),
    );
  }

  exists(
    teacherId: string,
    schoolId: string,
    subjectId: string,
  ): Promise<boolean> {
    return Promise.resolve(
      this.allocations.some(
        (a) =>
          a.teacherId === teacherId &&
          a.schoolId === schoolId &&
          a.subjectId === subjectId,
      ),
    );
  }
}
