import z from 'zod';
import {
  importFieldSchema,
  importedNoteContentSchema,
  importedPasswordContentSchema,
  importedVaultRecordSchema,
  importProviderSchema,
  parseImportRequestSchema,
  parseImportResponseSchema,
} from '../schemas';

export type ImportProvider = z.infer<typeof importProviderSchema>;
export type ImportField = z.infer<typeof importFieldSchema>;
export type ImportedPasswordContent = z.infer<
  typeof importedPasswordContentSchema
>;
export type ImportedNoteContent = z.infer<typeof importedNoteContentSchema>;
export type ImportedVaultRecord = z.infer<typeof importedVaultRecordSchema>;
export type ParseImportRequest = z.infer<typeof parseImportRequestSchema>;
export type ParseImportResponse = z.infer<typeof parseImportResponseSchema>;
