import type { Allocation as PrismaAllocation } from '@prisma/client';
import { Allocation } from '../../../domain/allocation/allocation.entity';

export class AllocationMapper {
  static toDomain(row: PrismaAllocation): Allocation {
    return new Allocation({
      id: row.id,
      teacherId: row.teacherId,
      schoolId: row.schoolId,
      subjectId: row.subjectId,
      createAt: row.createdAt,
    });
  }

  static toPersistence(allocation: Allocation): {
    id: string;
    teacherId: string;
    schoolId: string;
    subjectId: string;
    createdAt: Date;
  } {
    return {
      id: allocation.id,
      teacherId: allocation.teacherId,
      schoolId: allocation.schoolId,
      subjectId: allocation.subjectId,
      createdAt: allocation.createAt,
    };
  }
}
