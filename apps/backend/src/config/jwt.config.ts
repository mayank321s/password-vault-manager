import { Injectable } from '@nestjs/common';
import { ConfigService, registerAs } from '@nestjs/config';
import { mapZodErrorMessage } from 'src/utils/zod.utils';
import z from 'zod';

const jwtConfigSchema = z.object({
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRATION: z.string().min(1),
});

export const jwtConfiguration = registerAs('jwt', () => {
  const parser = jwtConfigSchema.safeParse(process.env);
  if (!parser.success) {
    throw new Error(mapZodErrorMessage(parser.error));
  }
  return parser.data;
});

@Injectable()
export class JwtConfig {
  private readonly config: z.infer<typeof jwtConfigSchema>;
  constructor(configService: ConfigService) {
    this.config = configService.get('jwt');
  }

  get secret(): string {
    return this.config.JWT_SECRET;
  }

  get expiration(): string {
    return this.config.JWT_EXPIRATION;
  }
}
