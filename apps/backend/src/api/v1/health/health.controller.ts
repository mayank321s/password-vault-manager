import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Public } from '../../../common/decorators/public.decorator';

@Controller()
@Public()
export class HealthController {
  constructor(
    @InjectConnection()
    private sequelize: Sequelize,
  ) {}

  @Get()
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('db')
  async checkDatabase() {
    try {
      await this.sequelize.authenticate();
      return {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
