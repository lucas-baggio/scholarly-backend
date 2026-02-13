import { School } from './school.entity';

export abstract class SchoolRepository {
  abstract save(school: School): Promise<void>;
  abstract findById(id: string): Promise<School | null>;
  abstract findAllActive(): Promise<School[]>;
  abstract findByAdminId(adminId: string): Promise<School[]>;
  abstract existsByName(name: string): Promise<boolean>;
}
