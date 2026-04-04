import { Injectable } from '@nestjs/common';
import { ConfigService, registerAs } from '@nestjs/config';
import { mapZodErrorMessage } from 'src/utils/zod.utils';
import z from 'zod';

const ssoConfigSchema = z.object({
  SSO_STATE_SECRET: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(1),
});

export const ssoConfiguration = registerAs('sso', () => {
  const parser = ssoConfigSchema.safeParse(process.env);
  if (!parser.success) {
    throw new Error(mapZodErrorMessage(parser.error));
  }
  return parser.data;
});

@Injectable()
export class SsoConfig {
  private readonly config: z.infer<typeof ssoConfigSchema>;

  constructor(configService: ConfigService) {
    this.config = configService.get('sso');
  }

  get stateSecret(): string {
    return this.config.SSO_STATE_SECRET ?? this.config.JWT_SECRET;
  }
}
