import z from 'zod';
import {
  addVaultMemberRequestSchema,
  createVaultRequestSchema,
  getVaultPasswordsQuerySchema,
  getVaultPasswordsResponseSchema,
  rotateVaultKeysRequestSchema,
  updateVaultMemberRoleRequestSchema,
  updateVaultRequestSchema,
  vaultDetailResponseSchema,
  vaultMemberResponseSchema,
  vaultPasswordListItemSchema,
  vaultResponseSchema,
} from '../schemas';

export type CreateVaultRequest = z.infer<typeof createVaultRequestSchema>;
export type UpdateVaultRequest = z.infer<typeof updateVaultRequestSchema>;
export type VaultMemberResponse = z.infer<typeof vaultMemberResponseSchema>;
export type VaultResponse = z.infer<typeof vaultResponseSchema>;
export type VaultDetailResponse = z.infer<typeof vaultDetailResponseSchema>;
export type AddVaultMemberRequest = z.infer<typeof addVaultMemberRequestSchema>;
export type UpdateVaultMemberRoleRequest = z.infer<
  typeof updateVaultMemberRoleRequestSchema
>;
export type RotateVaultKeyRequest = z.infer<
  typeof rotateVaultKeysRequestSchema
>;
export type VaultPasswordListItem = z.infer<typeof vaultPasswordListItemSchema>;
export type GetVaultPasswordsQuery = z.infer<
  typeof getVaultPasswordsQuerySchema
>;
export type GetVaultPasswordsResponse = z.infer<
  typeof getVaultPasswordsResponseSchema
>;
