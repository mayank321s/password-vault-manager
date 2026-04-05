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

export const importIssueSeveritySchema = z.enum(['warning', 'error']);

export const importIssueCodeSchema = z.enum([
  'missing_password',
  'malformed_row',
  'duplicate_record',
  'archived_item',
  'favorite_metadata_only',
]);

export const importIssueSchema = z.object({
  rowNumber: z.number().int().positive(),
  severity: importIssueSeveritySchema,
  code: importIssueCodeSchema,
  message: z.string().min(1),
  field: z.string().nullable(),
  suggestedAction: z.string().min(1),
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
  rowNumber: z.number().int().positive(),
  provider: importProviderSchema,
  title: z.string().min(1),
  folder: z.string().nullable(),
  tags: z.array(z.string()),
  urls: z.array(z.string()),
  warnings: z.array(z.string()),
  reviewRequired: z.boolean(),
  content: z.union([importedPasswordContentSchema, importedNoteContentSchema]),
});

export const importDuplicateGroupSchema = z.object({
  signature: z.string().min(1),
  rowNumbers: z.array(z.number().int().positive()).min(2),
  suggestedAction: z.string().min(1),
});

export const importSummarySchema = z.object({
  totalRows: z.number().int().nonnegative(),
  parsedCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
  requiresReviewCount: z.number().int().nonnegative(),
  duplicateGroupCount: z.number().int().nonnegative(),
  issueCount: z.number().int().nonnegative(),
  errorCount: z.number().int().nonnegative(),
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
  issues: z.array(importIssueSchema),
  duplicateGroups: z.array(importDuplicateGroupSchema),
  summary: importSummarySchema,
});
