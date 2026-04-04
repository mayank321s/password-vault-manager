import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const scimTokenResponseSchema = z.object({
  tokenId: z.string().uuid(),
  label: z.string(),
  tokenPrefix: z.string(),
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
});

export const createScimTokenRequestSchema = z.object({
  label: z.string().min(1).max(120),
});

export const createScimTokenResponseSchema = scimTokenResponseSchema.extend({
  plainTextToken: z.string(),
});

export const scimTokenListResponseSchema = z.object({
  tokens: z.array(scimTokenResponseSchema),
});

export const scimProvisioningLogSchema = z.object({
  eventId: z.string().uuid(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string().nullable(),
  status: z.enum(['success', 'failure']),
  detail: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const scimDiagnosticsSchema = z.object({
  organizationId: z.string().uuid(),
  tokenStatus: z.object({
    activeTokenCount: z.number().int().nonnegative(),
    revokedTokenCount: z.number().int().nonnegative(),
    latestTokenUseAt: z.string().datetime().nullable(),
  }),
  provisioningStatus: z.object({
    lastSuccessAt: z.string().datetime().nullable(),
    lastFailureAt: z.string().datetime().nullable(),
    recentFailureCount: z.number().int().nonnegative(),
  }),
  endpoints: z.object({
    baseUrl: z.string(),
    usersUrl: z.string(),
    groupsUrl: z.string(),
  }),
  recentEvents: z.array(scimProvisioningLogSchema),
  tokens: z.array(scimTokenResponseSchema),
});

export class ScimTokenResponseDto extends createZodDto(scimTokenResponseSchema) {}
export class CreateScimTokenRequestDto extends createZodDto(createScimTokenRequestSchema) {}
export class CreateScimTokenResponseDto extends createZodDto(createScimTokenResponseSchema) {}
export class ScimTokenListResponseDto extends createZodDto(scimTokenListResponseSchema) {}
export class ScimProvisioningLogDto extends createZodDto(scimProvisioningLogSchema) {}
export class ScimDiagnosticsDto extends createZodDto(scimDiagnosticsSchema) {}
