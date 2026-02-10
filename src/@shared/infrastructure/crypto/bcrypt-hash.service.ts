import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashService } from 'src/@shared/application/crypto/hash.service';

@Injectable()
export class BcryptHashService implements HashService {
  private readonly SALT_ROUNDS = 10;

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.SALT_ROUNDS);
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
