import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const statusSchema = z.enum([
  'pending_acceptance',
  'active',
  'revoked',
  'declined',
]);

export const createEmergencyAccessGrantRequestSchema = z.object({
  granteeEmail: z.string().email(),
  recoveryDelayHours: z.number().int().min(24).max(24 * 30),
  note: z.string().max(500).optional(),
});

export const emergencyAccessGrantSummarySchema = z.object({
  grantId: z.string().uuid(),
  organizationId: z.string().uuid(),
  grantorUserId: z.string().uuid(),
  grantorEmail: z.string().email(),
  grantorUsername: z.string(),
  granteeUserId: z.string().uuid(),
  granteeEmail: z.string().email(),
  granteeUsername: z.string(),
  status: statusSchema,
  recoveryDelayHours: z.number().int(),
  note: z.string().nullable(),
  acceptedAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
  revokedByUserId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const emergencyAccessGrantListResponseSchema = z.object({
  outgoing: z.array(emergencyAccessGrantSummarySchema),
  incoming: z.array(emergencyAccessGrantSummarySchema),
});

export class CreateEmergencyAccessGrantRequestDto extends createZodDto(
  createEmergencyAccessGrantRequestSchema,
) {}

export class EmergencyAccessGrantSummaryDto extends createZodDto(
  emergencyAccessGrantSummarySchema,
) {}

export class EmergencyAccessGrantListResponseDto extends createZodDto(
  emergencyAccessGrantListResponseSchema,
) {}
