import { Injectable } from '@nestjs/common';
import { ConfigService, registerAs } from '@nestjs/config';
import { mapZodErrorMessage } from 'src/utils/zod.utils';
import z from 'zod';

const databaseConfigSchema = z.object({
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().int(),
  DATABASE_NAME: z.string().min(1),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(0),
  DATABASE_SSL: z.string().transform((val) => val.toLowerCase() === 'true'),
  DATABASE_LOGGING: z.string().transform((val) => val.toLowerCase() === 'true'),
});

export default registerAs('database', () => {
  const parsed = databaseConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    throw mapZodErrorMessage(parsed.error);
  }

  return parsed.data;
});

@Injectable()
export class DatabaseConfig {
  private readonly config: z.infer<typeof databaseConfigSchema>;
  constructor(configService: ConfigService) {
    this.config = configService.get('database');
  }

  static configure(configService: ConfigService) {
    const db =
      configService.get<z.infer<typeof databaseConfigSchema>>('database');
    return {
      host: db.DATABASE_HOST,
      port: db.DATABASE_PORT,
      username: db.DATABASE_USER,
      password: db.DATABASE_PASSWORD,
      database: db.DATABASE_NAME,
      ssl: db.DATABASE_SSL,
      logging: db.DATABASE_LOGGING,
    };
  }

  get host(): string {
    return this.config.DATABASE_HOST;
  }

  get port(): number {
    return this.config.DATABASE_PORT;
  }

  get username(): string {
    return this.config.DATABASE_USER;
  }

  get password(): string {
    return this.config.DATABASE_PASSWORD;
  }

  get database(): string {
    return this.config.DATABASE_NAME;
  }

  get ssl(): boolean {
    return this.config.DATABASE_SSL;
  }

  get logging(): boolean {
    return this.config.DATABASE_LOGGING;
  }
}
