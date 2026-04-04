import { registerAs } from '@nestjs/config';
import { mapZodErrorMessage } from 'src/utils/zod.utils';
import z from 'zod';

const catalogEntrySchema = z.object({
  productId: z.string().min(1),
  monthlyPriceId: z.string().min(1),
  yearlyPriceId: z.string().min(1),
});

const billingConfigSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1).default('sk_test_placeholder'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).default('whsec_placeholder'),
  STRIPE_CATALOG_FAMILY_PRODUCT_ID: z.string().min(1).default('prod_family'),
  STRIPE_CATALOG_FAMILY_MONTHLY_PRICE_ID: z
    .string()
    .min(1)
    .default('price_family_monthly'),
  STRIPE_CATALOG_FAMILY_YEARLY_PRICE_ID: z
    .string()
    .min(1)
    .default('price_family_yearly'),
  STRIPE_CATALOG_BUSINESS_PRODUCT_ID: z.string().min(1).default('prod_business'),
  STRIPE_CATALOG_BUSINESS_MONTHLY_PRICE_ID: z
    .string()
    .min(1)
    .default('price_business_monthly'),
  STRIPE_CATALOG_BUSINESS_YEARLY_PRICE_ID: z
    .string()
    .min(1)
    .default('price_business_yearly'),
});

type BillingConfigSchema = z.infer<typeof billingConfigSchema>;

export type BillingCatalog = {
  family: z.infer<typeof catalogEntrySchema>;
  business: z.infer<typeof catalogEntrySchema>;
};

export const billingConfiguration = registerAs('billing', () => {
  const parser = billingConfigSchema.safeParse(process.env);
  if (!parser.success) {
    throw new Error(mapZodErrorMessage(parser.error));
  }

  const values: BillingConfigSchema = parser.data;

  return {
    stripeSecretKey: values.STRIPE_SECRET_KEY,
    stripeWebhookSecret: values.STRIPE_WEBHOOK_SECRET,
    catalog: {
      family: catalogEntrySchema.parse({
        productId: values.STRIPE_CATALOG_FAMILY_PRODUCT_ID,
        monthlyPriceId: values.STRIPE_CATALOG_FAMILY_MONTHLY_PRICE_ID,
        yearlyPriceId: values.STRIPE_CATALOG_FAMILY_YEARLY_PRICE_ID,
      }),
      business: catalogEntrySchema.parse({
        productId: values.STRIPE_CATALOG_BUSINESS_PRODUCT_ID,
        monthlyPriceId: values.STRIPE_CATALOG_BUSINESS_MONTHLY_PRICE_ID,
        yearlyPriceId: values.STRIPE_CATALOG_BUSINESS_YEARLY_PRICE_ID,
      }),
    } satisfies BillingCatalog,
  };
});

