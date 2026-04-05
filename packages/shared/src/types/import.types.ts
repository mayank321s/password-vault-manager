import z from 'zod';
import {
  importDuplicateGroupSchema,
  importFieldSchema,
  importIssueSchema,
  importedNoteContentSchema,
  importedPasswordContentSchema,
  importedVaultRecordSchema,
  importProviderSchema,
  importSummarySchema,
  parseImportRequestSchema,
  parseImportResponseSchema,
} from '../schemas';

export type ImportProvider = z.infer<typeof importProviderSchema>;
export type ImportField = z.infer<typeof importFieldSchema>;
export type ImportIssue = z.infer<typeof importIssueSchema>;
export type ImportDuplicateGroup = z.infer<typeof importDuplicateGroupSchema>;
export type ImportedPasswordContent = z.infer<
  typeof importedPasswordContentSchema
>;
export type ImportedNoteContent = z.infer<typeof importedNoteContentSchema>;
export type ImportedVaultRecord = z.infer<typeof importedVaultRecordSchema>;
export type ImportSummary = z.infer<typeof importSummarySchema>;
export type ParseImportRequest = z.infer<typeof parseImportRequestSchema>;
export type ParseImportResponse = z.infer<typeof parseImportResponseSchema>;
