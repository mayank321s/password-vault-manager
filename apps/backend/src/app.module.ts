import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiV1Module } from './api/v1/api-v1.module';
import { JwtAuthGuard } from './api/v1/auth/guards/jwt-auth.guard';
import { LoggerModule } from './common/logger/logger.module';
import configs from './config';
import { AppConfig } from './config/app.config';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: ['.env.local', '.env'],
    }),
    // Logger module
    LoggerModule,
    // Database module
    DatabaseModule,
    // Rate limiting / throttling
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttle.ttl', 60),
          limit: config.get<number>('throttle.limit', 100),
        },
      ],
    }),
    ApiV1Module,
  ],
  providers: [
    AppConfig,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
