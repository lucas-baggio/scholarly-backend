import { DomainException } from '../../../../../@shared/domain/exceptions/domain.exception';

export class SchoolNotFoundException extends DomainException {
  constructor(id: string) {
    super(`School with ID ${id} not found`, 'SCHOOL_NOT_FOUND');
  }
}
