import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const organizationPolicyResponseSchema = z.object({
  organizationId: z.string().uuid(),
  requireMfa: z.boolean(),
  restrictExternalSharing: z.boolean(),
  sessionTimeoutMinutes: z.number().int().min(5).max(1440),
  maxDevicesPerUser: z.number().int().min(1).max(50),
  policyVersion: z.string(),
  updatedAt: z.string().datetime().nullable(),
});

export const upsertOrganizationPolicyRequestSchema = z.object({
  requireMfa: z.boolean(),
  restrictExternalSharing: z.boolean(),
  sessionTimeoutMinutes: z.number().int().min(5).max(1440),
  maxDevicesPerUser: z.number().int().min(1).max(50),
});

export class OrganizationPolicyResponseDto extends createZodDto(
  organizationPolicyResponseSchema,
) {}

export class UpsertOrganizationPolicyRequestDto extends createZodDto(
  upsertOrganizationPolicyRequestSchema,
) {}
