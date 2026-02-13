import type { Subject as PrismaSubject } from '@prisma/client';
import { Subject } from '../../../domain/subject/subject.entity';

export class SubjectMapper {
  static toDomain(row: PrismaSubject): Subject {
    return new Subject({
      id: row.id,
      name: row.name,
      schoolId: row.schoolId,
      isActive: row.isActive,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(subject: Subject): {
    id: string;
    name: string;
    schoolId: string;
    isActive: boolean;
    createdAt: Date;
  } {
    return {
      id: subject.id,
      name: subject.name,
      schoolId: subject.schoolId,
      isActive: subject.isActive,
      createdAt: subject.createdAt,
    };
  }
}
