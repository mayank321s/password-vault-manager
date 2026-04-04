import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const billingPortalSessionSchema = z.object({
  url: z.string().url(),
});

export class BillingPortalSessionDto extends createZodDto(
  billingPortalSessionSchema,
) {}

