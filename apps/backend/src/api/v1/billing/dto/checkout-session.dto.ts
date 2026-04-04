import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createCheckoutSessionRequestSchema = z.object({
  plan: z.enum(['family', 'business']),
  interval: z.enum(['monthly', 'yearly']),
});

export const createCheckoutSessionResponseSchema = z.object({
  checkoutSessionId: z.string().min(1),
  checkoutUrl: z.string().url(),
  priceId: z.string().min(1),
  plan: z.enum(['family', 'business']),
  interval: z.enum(['monthly', 'yearly']),
});

export class CreateCheckoutSessionRequestDto extends createZodDto(
  createCheckoutSessionRequestSchema,
) {}

export class CreateCheckoutSessionResponseDto extends createZodDto(
  createCheckoutSessionResponseSchema,
) {}

