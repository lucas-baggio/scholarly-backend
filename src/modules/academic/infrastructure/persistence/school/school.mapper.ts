import type { School as PrismaSchool } from '@prisma/client';
import { School } from '../../../domain/school/school.entity';

export class SchoolMapper {
  static toDomain(row: PrismaSchool): School {
    return new School({
      id: row.id,
      name: row.name,
      adminId: row.adminId,
      isActive: row.isActive,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(school: School): {
    id: string;
    name: string;
    adminId: string;
    isActive: boolean;
    createdAt: Date;
  } {
    return {
      id: school.id,
      name: school.name,
      adminId: school.adminId,
      isActive: school.isActive,
      createdAt: school.createdAt,
    };
  }
}
