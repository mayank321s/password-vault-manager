import { Injectable } from '@nestjs/common';
import { ConfigService, registerAs } from '@nestjs/config';
import { mapZodErrorMessage } from 'src/utils/zod.utils';
import z from 'zod';

const totpConfigSchema = z.object({
  TOTP_ENCRYPTION_KEY: z
    .string()
    .length(
      64,
      'TOTP_ENCRYPTION_KEY must be a 64-character hex string (32 bytes / 256 bits)',
    )
    .regex(/^[0-9a-fA-F]+$/, 'TOTP_ENCRYPTION_KEY must be a valid hex string'),
});

export const totpConfiguration = registerAs('totp', () => {
  const parser = totpConfigSchema.safeParse(process.env);
  if (!parser.success) {
    throw new Error(mapZodErrorMessage(parser.error));
  }
  return parser.data;
});

@Injectable()
export class TotpConfig {
  private readonly config: z.infer<typeof totpConfigSchema>;

  constructor(configService: ConfigService) {
    this.config = configService.get('totp');
  }

  get encryptionKey(): string {
    return this.config.TOTP_ENCRYPTION_KEY;
  }
}
