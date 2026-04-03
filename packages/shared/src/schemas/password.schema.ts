import { z } from 'zod';
import { PasswordPermissionLevel } from '../enums/password-permission-level.enum';

export const createPasswordRequestSchema = z.object({
  vaultId: z
    .string()
    .uuid()
    .describe('ID of the vault to store the password in'),
  name: z
    .string()
    .min(1)
    .max(255)
    .trim()
    .describe('Encrypted display name/title of the password entry'),
  encryptedData: z
    .string()
    .min(1)
    .max(150000)
    .describe(
      'Encrypted password data (JSON with username, password, url, notes) encrypted with vault key',
    ),
  isNote: z
    .boolean()
    .default(false)
    .describe('Whether this is a secure note (true) or password entry (false)'),
});

export const updatePasswordRequestSchema = z.optional(
  createPasswordRequestSchema.omit({ vaultId: true }),
);

export const externalPasswordShareSchema = z.object({
  userId: z.string().uuid(),
  userEmail: z.string().email(),
  userName: z.string().nullable(),
  permission: z.nativeEnum(PasswordPermissionLevel),
});

export const passwordResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().describe('Encrypted display name'),
  encryptedData: z.string().describe('Encrypted password data blob'),
  isNote: z.boolean(),
  vaultId: z.string().uuid(),
  vaultName: z.string().describe('Name of the vault this password belongs to'),
  createdBy: z.string().uuid().describe('User ID who created this password'),
  createdByUserName: z.string().nullable(),
  updatedByUserName: z.string().nullable(),
  externalShares: z
    .array(externalPasswordShareSchema)
    .describe(
      'Users outside the vault with individual access to this password',
    ),
  passwordEncryptedKey: z
    .string()
    .optional()
    .describe(
      "Vault key encrypted with the requesting user's RSA public key — present only when the user accesses via an individual share",
    ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const passwordListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().describe('Encrypted display name'),
  isNote: z.boolean(),
  vaultId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const deletePasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const grantPasswordPermissionRequestSchema = z.object({
  userEmail: z
    .string()
    .email()
    .toLowerCase()
    .trim()
    .describe('Email of user to grant access to'),
  passwordEncryptedKey: z
    .string()
    .min(100)
    .describe(
      "Share-specific AES key encrypted with recipient's public key (RSA-OAEP)",
    ),
  encryptedData: z
    .string()
    .min(1)
    .describe(
      'Password data re-encrypted with the share-specific AES key on the client',
    ),
});

export const passwordPermissionResponseSchema = z.object({
  id: z.string().uuid(),
  passwordId: z.string().uuid(),
  userId: z.string().uuid(),
  userEmail: z.string().email(),
  userName: z.string().optional(),
  permission: z.enum(['owner', 'editor', 'viewer']),
  passwordEncryptedKey: z.string(),
  grantedByUserName: z.string(),
  recipientPublicKey: z
    .string()
    .optional()
    .describe(
      "Recipient's RSA public key — returned by list endpoint for share refresh",
    ),
  createdAt: z.date(),
});

export const refreshPasswordSharesRequestSchema = z.object({
  shares: z
    .array(
      z.object({
        userId: z.string().uuid(),
        passwordEncryptedKey: z
          .string()
          .min(100)
          .describe(
            "New share-specific AES key encrypted with recipient's public key",
          ),
        encryptedData: z
          .string()
          .min(1)
          .describe(
            'Updated password data re-encrypted with the new share key',
          ),
      }),
    )
    .describe(
      'One entry per existing share recipient with refreshed crypto material',
    ),
});

export const sharedPasswordItemSchema = z.object({
  id: z.string().uuid(),
  passwordId: z.string().uuid(),
  passwordName: z.string().describe('Encrypted display name'),
  isNote: z.boolean(),
  vaultId: z.string().uuid(),
  permission: z.enum(['viewer', 'editor']),
  passwordEncryptedKey: z
    .string()
    .describe('Vault key encrypted with recipient RSA public key'),
  grantedByUserName: z.string(),
  createdAt: z.date(),
});

export const createOneTimeShareRequestSchema = z.object({
  encryptedBlob: z
    .string()
    .min(1)
    .describe('Password data encrypted with random 256-bit AES key on client'),
  expirationHours: z
    .number()
    .int()
    .min(1)
    .max(168)
    .default(24)
    .describe('Number of hours until share expires (1-168 hours, default 24)'),
});

export const oneTimeShareResponseSchema = z.object({
  shareId: z.string().uuid().describe('Unique share ID for the URL'),
  expiresAt: z.date().describe('When the share link expires'),
  createdAt: z.date(),
});

export const accessOneTimeShareResponseSchema = z.object({
  encryptedBlob: z.string().describe('Encrypted password data'),
  expiresAt: z.date(),
  createdAt: z.date(),
});
