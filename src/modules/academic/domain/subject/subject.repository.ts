import { Subject } from './subject.entity';

export abstract class SubjectRepository {
  abstract save(subject: Subject): Promise<void>;
  abstract findById(id: string): Promise<Subject | null>;
  abstract findBySchoolId(schoolId: string): Promise<Subject[]>;
  abstract findAllActive(): Promise<Subject[]>;
}
