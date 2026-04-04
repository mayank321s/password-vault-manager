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
  features: z.object({
    externalShares: z.boolean(),
  }),
});

export class EntitlementSummaryDto extends createZodDto(
  entitlementSummarySchema,
) {}

