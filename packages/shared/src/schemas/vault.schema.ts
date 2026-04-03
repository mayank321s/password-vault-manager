import { z } from 'zod';

export const createVaultRequestSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  vaultEncryptedKey: z
    .string()
    .min(100)
    .describe('Vault symmetric key encrypted with user public key (RSA-OAEP)'),
});

export const updateVaultRequestSchema = z.object({
  name: z.string().min(1).max(255).trim(),
});

export const vaultMemberResponseSchema = z.object({
  members: z
    .object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
      userEmail: z.string().email(),
      userRole: z.enum(['owner', 'manager', 'team_member']),
      userName: z.string(),
      vaultEncryptedKey: z.string(),
      publicKey: z.string(),
      joinedAt: z.date(),
    })
    .array(),
});

export const vaultResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isPersonalVault: z.boolean(),
  ownerUserId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  vaultEncryptedKey: z.string(),
  userRole: z.enum(['owner', 'manager', 'team_member']),
});

export const vaultDetailResponseSchema = vaultResponseSchema.and(
  vaultMemberResponseSchema,
);

export const addVaultMemberRequestSchema = z.object({
  userEmail: z.string().email().toLowerCase().trim(),
  userRole: z.enum(['manager', 'team_member']),
  vaultEncryptedKey: z
    .string()
    .min(100)
    .describe("Vault key encrypted with new member's public key"),
});

export const updateVaultMemberRoleRequestSchema = z.object({
  userRole: z.enum(['manager', 'team_member']),
});

const updateMemberVaultKeyRequestSchema = z.object({
  userId: z.string().uuid(),
  vaultEncryptedKey: z
    .string()
    .min(100)
    .describe("New vault key encrypted with member's public key"),
});

const passwordReEncryptionRequestSchema = z.object({
  passwordId: z.string().uuid(),
  encryptedData: z
    .string()
    .min(1)
    .describe('Password data re-encrypted with new vault key'),
  name: z.string().optional(),
});

export const rotateVaultKeysRequestSchema = z.object({
  memberKeys: z
    .array(updateMemberVaultKeyRequestSchema)
    .min(1)
    .describe(
      'New encrypted vault keys for all remaining members (excluding removed member)',
    ),
  reEncryptedPasswords: z
    .array(passwordReEncryptionRequestSchema)
    .describe('All passwords re-encrypted with new vault key'),
});

export const getVaultPasswordsQuerySchema = z.object({
  withEncryptedData: z.coerce.boolean().default(false),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const vaultPasswordListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isNote: z.boolean(),
  encryptedData: z.string().optional(),
});

export const getVaultPasswordsResponseSchema = z.object({
  passwords: vaultPasswordListItemSchema.array(),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});
