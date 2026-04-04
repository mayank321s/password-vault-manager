import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const ssoLookupResponseSchema = z.object({
  requiresSso: z.boolean(),
  organizationId: z.string().uuid().nullable(),
  provider: z.enum(['entra_oidc']).nullable(),
  primaryDomain: z.string().nullable(),
});

export const ssoStartResponseSchema = z.object({
  redirectUrl: z.string().url(),
  state: z.string(),
  organizationId: z.string().uuid(),
  provider: z.literal('entra_oidc'),
});

export const ssoCallbackResponseSchema = z.object({
  organizationId: z.string().uuid(),
  provider: z.literal('entra_oidc'),
  emailDomain: z.string(),
  authorizationCode: z.string(),
  tokenExchangePending: z.boolean(),
});

export class SsoLookupResponseDto extends createZodDto(
  ssoLookupResponseSchema,
) {}

export class SsoStartResponseDto extends createZodDto(
  ssoStartResponseSchema,
) {}

export class SsoCallbackResponseDto extends createZodDto(
  ssoCallbackResponseSchema,
) {}
