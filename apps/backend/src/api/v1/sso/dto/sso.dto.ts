import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const domainSummarySchema = z.object({
  domainId: z.string().uuid(),
  domain: z.string(),
  verificationToken: z.string(),
  verifiedAt: z.string().datetime().nullable(),
  isPrimary: z.boolean(),
});

export const upsertSsoConfigurationRequestSchema = z.object({
  tenantId: z.string().min(1).max(255),
  clientId: z.string().min(1).max(255),
  clientSecretRef: z.string().max(255).optional(),
  redirectUri: z.string().url(),
  domains: z.array(z.string().min(3).max(255)).min(1).max(10),
  primaryDomain: z.string().min(3).max(255),
});

export const ssoConfigurationResponseSchema = z.object({
  configId: z.string().uuid(),
  organizationId: z.string().uuid(),
  provider: z.literal('entra_oidc'),
  tenantId: z.string(),
  clientId: z.string(),
  clientSecretRef: z.string().nullable(),
  redirectUri: z.string().url(),
  issuer: z.string().url(),
  authorizationEndpoint: z.string().url(),
  tokenEndpoint: z.string().url(),
  scopes: z.string(),
  isActive: z.boolean(),
  domains: z.array(domainSummarySchema),
});

export const verifySsoDomainRequestSchema = z.object({
  verificationToken: z.string().min(1).max(255),
});

export class UpsertSsoConfigurationRequestDto extends createZodDto(
  upsertSsoConfigurationRequestSchema,
) {}

export class SsoConfigurationResponseDto extends createZodDto(
  ssoConfigurationResponseSchema,
) {}

export class VerifySsoDomainRequestDto extends createZodDto(
  verifySsoDomainRequestSchema,
) {}
