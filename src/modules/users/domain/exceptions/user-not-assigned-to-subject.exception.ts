import { DomainException } from 'src/@shared/domain/exceptions/domain.exception';

export class UserNotAssignedToSubjectException extends DomainException {
  constructor(userId: string, subjectId: string) {
    super(
      `Professor ${userId} is not assigned to subject ${subjectId}.`,
      'USER_NOT_ASSIGNED_TO_SUBJECT',
    );
  }
}
