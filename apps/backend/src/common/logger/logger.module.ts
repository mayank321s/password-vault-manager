import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfig, appConfiguration } from 'src/config/app.config';
import { LoggingService } from './logger.service';

@Module({
  imports: [ConfigModule.forFeature(appConfiguration)],
  providers: [LoggingService, AppConfig],
  exports: [LoggingService],
})
export class LoggerModule {}
