import { School } from '../../domain/school.entity';
import { SchoolRepository } from '../../domain/school.repository';

export class InMemorySchoolRepository implements SchoolRepository {
  public schools: School[] = [];

  save(school: School): Promise<void> {
    const index = this.schools.findIndex((s) => s.id === school.id);

    if (index >= 0) {
      this.schools[index] = school;
    } else {
      this.schools.push(school);
    }

    return Promise.resolve();
  }

  findById(id: string): Promise<School | null> {
    const school = this.schools.find((s) => s.id === id) || null;
    return Promise.resolve(school);
  }

  findAllActive(): Promise<School[]> {
    const schools = this.schools.filter((s) => s.isActive);
    return Promise.resolve(schools);
  }

  async findByAdminId(adminId: string): Promise<School[]> {
    return Promise.resolve(this.schools.filter((s) => s.adminId === adminId));
  }

  async existsByName(name: string): Promise<boolean> {
    return Promise.resolve(
      this.schools.some((s) => s.name.toLowerCase() === name.toLowerCase()),
    );
  }
}
