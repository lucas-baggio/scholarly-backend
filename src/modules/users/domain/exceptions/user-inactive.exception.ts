import { DomainException } from '../../../../@shared/domain/exceptions/domain.exception';

export class UserInactiveException extends DomainException {
  constructor(userId: string) {
    super(
      `Professor ${userId} is inactive and cannot perform this action.`,
      'USER_INACTIVE',
    );
  }
}
