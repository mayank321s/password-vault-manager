import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const invoiceSummarySchema = z.object({
  invoiceId: z.string().min(1),
  number: z.string().nullable(),
  status: z.string().nullable(),
  amountDue: z.number().int().nonnegative(),
  amountPaid: z.number().int().nonnegative(),
  currency: z.string().min(1),
  hostedInvoiceUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
});

export const invoiceListSchema = z.object({
  invoices: z.array(invoiceSummarySchema),
});

export class InvoiceListDto extends createZodDto(invoiceListSchema) {}

