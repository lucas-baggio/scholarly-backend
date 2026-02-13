import { Controller, Get } from '@nestjs/common';
import * as packageJson from '../../../../package.json';
import { PrismaService } from '../../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const dbConnected = this.prisma.isConnected && (await this.prisma.ping());
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${process.uptime().toFixed(2)}s`,
      version: packageJson.version,
      database: dbConnected ? 'connected' : 'disconnected',
    };
  }
}
