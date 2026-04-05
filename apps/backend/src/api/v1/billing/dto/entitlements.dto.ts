import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const entitlementSummarySchema = z.object({
  planType: z.enum(['family', 'business']),
  lifecycleStatus: z.enum(['trial', 'active', 'grace', 'failure', 'canceled']),
  seats: z.object({
    used: z.number().int().nonnegative(),
    max: z.number().int().positive(),
    available: z.number().int().nonnegative(),
  }),
  seatPolicy: z.object({
    softWarningThreshold: z.number().int().positive().nullable(),
    hardLimit: z.number().int().positive(),
    warningState: z.enum(['healthy', 'warning', 'full']),
  }),
  features: z.object({
    externalShares: z.boolean(),
  }),
  addOns: z.object({
    ssoPackAvailable: z.boolean(),
    scimPackAvailable: z.boolean(),
    auditExportPackAvailable: z.boolean(),
    siemConnectorPackAvailable: z.boolean(),
  }),
});

export class EntitlementSummaryDto extends createZodDto(
  entitlementSummarySchema,
) {}

