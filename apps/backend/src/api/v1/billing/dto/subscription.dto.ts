import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const subscriptionStateSchema = z.object({
  organizationId: z.string().uuid(),
  stripeCustomerId: z.string().min(1),
  stripeSubscriptionId: z.string().min(1),
  stripePriceId: z.string().min(1),
  planType: z.enum(['family', 'business']),
  billingInterval: z.enum(['monthly', 'yearly']),
  lifecycleStatus: z.enum(['trial', 'active', 'grace', 'failure', 'canceled']),
  trialEndsAt: z.string().datetime().nullable(),
  currentPeriodEndAt: z.string().datetime().nullable(),
  lastStripeEventId: z.string().nullable(),
});

export class SubscriptionStateDto extends createZodDto(subscriptionStateSchema) {}

