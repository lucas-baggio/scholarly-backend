import { DomainException } from '../../../../@shared/domain/exceptions/domain.exception';

export class SchoolInactiveException extends DomainException {
  constructor(name: string) {
    super(
      `The school ${name} is inactive and cannot perform this operation`,
      'SCHOOL_INACTIVE',
    );
  }
}
