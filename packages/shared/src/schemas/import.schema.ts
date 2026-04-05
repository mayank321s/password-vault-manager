import { z } from 'zod';

export const importProviderSchema = z.enum([
  'generic_csv',
  'lastpass_csv',
  'onepassword_csv',
]);

export const importFieldSchema = z.object({
  label: z.string().min(1),
  value: z.string(),
});

export const importedPasswordContentSchema = z.object({
  type: z.literal('password'),
  fields: z.array(importFieldSchema),
});

export const importedNoteContentSchema = z.object({
  type: z.literal('note'),
  content: z.string(),
});

export const importedVaultRecordSchema = z.object({
  provider: importProviderSchema,
  title: z.string().min(1),
  folder: z.string().nullable(),
  tags: z.array(z.string()),
  urls: z.array(z.string()),
  warnings: z.array(z.string()),
  content: z.union([importedPasswordContentSchema, importedNoteContentSchema]),
});

export const parseImportRequestSchema = z.object({
  provider: importProviderSchema,
  content: z.string().min(1),
});

export const parseImportResponseSchema = z.object({
  provider: importProviderSchema,
  totalRows: z.number().int().nonnegative(),
  parsedCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
  records: z.array(importedVaultRecordSchema),
});
