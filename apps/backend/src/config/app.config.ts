import { Injectable } from '@nestjs/common';
import { ConfigService, registerAs } from '@nestjs/config';
import { mapZodErrorMessage } from 'src/utils/zod.utils';
import z from 'zod';

const appConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  ARGON2_SERVER_SALT: z.string().min(32),
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('info'),
});

export const appConfiguration = registerAs('app', () => {
  const parser = appConfigSchema.safeParse(process.env);
  if (!parser.success) {
    throw new Error(mapZodErrorMessage(parser.error));
  }
  return parser.data;
});

@Injectable()
export class AppConfig {
  private readonly config: z.infer<typeof appConfigSchema>;
  constructor(configService: ConfigService) {
    this.config = configService.get('app');
  }

  get env(): 'development' | 'production' | 'test' {
    return this.config.NODE_ENV;
  }

  get port(): number {
    return this.config.PORT;
  }

  get frontendUrl(): string {
    return this.config.FRONTEND_URL;
  }

  get argon2ServerSalt(): string {
    return this.config.ARGON2_SERVER_SALT;
  }

  get logLevel(): 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly' {
    return this.config.LOG_LEVEL;
  }
}
