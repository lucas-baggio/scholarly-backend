import { DomainException } from '../../../../../@shared/domain/exceptions/domain.exception';

export class AdminRequiredException extends DomainException {
  constructor() {
    super('Admin ID is required to create a school', 'ADMIN_REQUIRED');
  }
}
