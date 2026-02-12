import { Subject } from '../../domain/subject.entity';
import { SubjectRepository } from '../../domain/subject.repository';

export class InMemorySubjectRepository implements SubjectRepository {
  public subjects: Subject[] = [];

  save(subject: Subject): Promise<void> {
    const index = this.subjects.findIndex((s) => s.id === subject.id);

    if (index >= 0) {
      this.subjects[index] = subject;
    } else {
      this.subjects.push(subject);
    }

    return Promise.resolve();
  }

  findById(id: string): Promise<Subject | null> {
    const subject = this.subjects.find((s) => s.id === id) ?? null;
    return Promise.resolve(subject);
  }

  findBySchoolId(schoolId: string): Promise<Subject[]> {
    return Promise.resolve(
      this.subjects.filter((s) => s.schoolId === schoolId),
    );
  }

  findAllActive(): Promise<Subject[]> {
    return Promise.resolve(this.subjects.filter((s) => s.isActive));
  }
}
