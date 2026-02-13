import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool | null = null;
  private _client: PrismaClient | null = null;

  get client(): PrismaClient {
    if (!this._client) {
      throw new Error('PrismaClient not initialized. Is DATABASE_URL set?');
    }
    return this._client;
  }

  get isConnected(): boolean {
    return this._client != null;
  }

  async onModuleInit(): Promise<void> {
    const url = process.env.DATABASE_URL;
    if (!url) return;
    this.pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(this.pool);
    this._client = new PrismaClient({ adapter });
    await this._client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this._client) {
      await this._client.$disconnect();
      this._client = null;
    }
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async ping(): Promise<boolean> {
    if (!this._client) return false;
    try {
      await this._client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
