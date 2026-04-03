import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email().min(3).max(255).toLowerCase().trim(),
  username: z.string().min(3).max(50).trim(),
  passwordHash: z
    .string()
    .min(16)
    .max(512)
    .describe('Client-side Argon2 hashed password'),
  publicKey: z.string().min(100).describe('RSA-4096 public key in PEM format'),
  signingPublicKey: z
    .string()
    .min(100)
    .describe('RSA-PSS signing public key for recovery verification'),
  encryptedPrivateKey: z
    .string()
    .min(100)
    .describe(
      'RSA private key encrypted with seed phrase-derived wrapping key',
    ),
  encryptedSigningPrivateKey: z
    .string()
    .min(100)
    .describe(
      'RSA-PSS signing private key encrypted with seed phrase-derived wrapping key',
    ),
  encryptedSeedPhrase: z
    .string()
    .min(100)
    .describe('BIP39 seed phrase encrypted with password-derived master key'),
  encryptionSalt: z
    .string()
    .min(16)
    .max(512)
    .describe('Salt for PBKDF2 master key derivation (base64 encoded)'),
  vaultEncryptedKey: z
    .string()
    .min(100)
    .describe('Vault symmetric key encrypted with user public key'),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  passwordHash: z
    .string()
    .min(16)
    .max(512)
    .describe('Client-side Argon2 hashed password'),
});

export const recoverPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  payload: z
    .string()
    .min(100)
    .describe('Base64-encoded recovery payload with new credentials'),
  signature: z
    .string()
    .min(100)
    .describe('RSA-PSS signature proving possession of signing private key'),
});

// Recovery Payload Schema (decoded structure)
export const accountRecoveryPayloadSchema = z.object({
  passwordHash: z.string().min(16).max(512),
  encryptedSeedPhrase: z.string().min(100),
  encryptedPrivateKey: z.string().min(100),
  encryptedSigningPrivateKey: z.string().min(100),
  encryptionSalt: z.string().min(16).max(512),
});

// Auth Response DTOs
export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string(),
    publicKey: z.string(),
    signingPublicKey: z.string(),
    encryptedPrivateKey: z.string(),
    encryptedSigningPrivateKey: z.string(),
    encryptedSeedPhrase: z.string(),
    isActive: z.boolean(),
    createdAt: z.date(),
    encryptionSalt: z.string(),
  }),
});

export const saltResponseSchema = z.object({
  encryptionSalt: z.string(),
  exists: z.boolean(),
});

export const recoveryDataResponseSchema = z.object({
  encryptedPrivateKey: z.string(),
  encryptedSigningPrivateKey: z.string(),
  signingPublicKey: z.string(),
  publicKey: z.string(),
});

// TOTP Schemas
export const preAuthResponseSchema = z.object({
  requiresTotp: z.literal(true),
  preAuthToken: z.string(),
});

export const totpSetupResponseSchema = z.object({
  qrCodeDataUrl: z.string(),
  secret: z.string(),
  email: z.string().email(),
  registrationToken: z
    .string()
    .describe(
      'Short-lived JWT (purpose=registration-completion) binding this TOTP setup to the completing call',
    ),
});

const totpVerifySchema = z.object({
  totpCode: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, 'TOTP code must be exactly 6 numeric digits'),
});

export const completeRegistrationSchema = totpVerifySchema.extend({
  email: z.string().email().toLowerCase().trim(),
  registrationToken: z
    .string()
    .min(10)
    .describe(
      'Short-lived JWT issued by POST /register; purpose claim must equal registration-completion',
    ),
});

export const loginTotpSchema = totpVerifySchema.extend({
  preAuthToken: z.string(),
});

// Post-recovery TOTP re-enrollment schemas
export const totpEnrollSchema = totpVerifySchema.extend({
  enrollToken: z
    .string()
    .min(10)
    .describe(
      'Short-lived JWT issued by POST /recover; purpose claim must equal totp-enrollment',
    ),
});

export const recoverPasswordResponseSchema = z.object({
  enrollToken: z
    .string()
    .describe(
      'Short-lived JWT (purpose=totp-enrollment) required to complete TOTP re-enrollment via POST /totp/enroll',
    ),
  qrCodeDataUrl: z.string(),
  secret: z.string(),
  email: z.string().email(),
});
