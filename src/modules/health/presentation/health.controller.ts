import { Controller, Get } from '@nestjs/common';
import * as packageJson from '../../../../package.json';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${process.uptime().toFixed(2)}s`,
      version: packageJson.version,
    };
  }
}
