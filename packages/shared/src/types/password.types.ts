import z from 'zod';
import {
  accessOneTimeShareResponseSchema,
  createOneTimeShareRequestSchema,
  createPasswordRequestSchema,
  deletePasswordResponseSchema,
  externalPasswordShareSchema,
  grantPasswordPermissionRequestSchema,
  oneTimeShareResponseSchema,
  passwordPermissionResponseSchema,
  passwordResponseSchema,
  refreshPasswordSharesRequestSchema,
  sharedPasswordItemSchema,
  updatePasswordRequestSchema,
} from '../schemas';

export type CreatePasswordRequest = z.infer<typeof createPasswordRequestSchema>;
export type UpdatePasswordRequest = z.infer<typeof updatePasswordRequestSchema>;
export type PasswordResponse = z.infer<typeof passwordResponseSchema>;
export type ExternalPasswordShare = z.infer<typeof externalPasswordShareSchema>;
export type DeletePasswordResponse = z.infer<
  typeof deletePasswordResponseSchema
>;
export type GrantPasswordPermissionRequest = z.infer<
  typeof grantPasswordPermissionRequestSchema
>;
export type passwordPermissionResponse = z.infer<
  typeof passwordPermissionResponseSchema
>;
export type SharedPasswordItem = z.infer<typeof sharedPasswordItemSchema>;
export type createOneTimeShareRequest = z.infer<
  typeof createOneTimeShareRequestSchema
>;
export type oneTimeShareResponse = z.infer<typeof oneTimeShareResponseSchema>;
export type accessOneTimeShareResponse = z.infer<
  typeof accessOneTimeShareResponseSchema
>;
export type RefreshPasswordSharesRequest = z.infer<
  typeof refreshPasswordSharesRequestSchema
>;
