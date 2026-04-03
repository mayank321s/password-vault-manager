import { z } from 'zod';
import {
  registerUserSchema,
  loginSchema,
  recoverPasswordSchema,
  accountRecoveryPayloadSchema,
  authResponseSchema,
  saltResponseSchema,
  recoveryDataResponseSchema,
  preAuthResponseSchema,
  totpSetupResponseSchema,
  completeRegistrationSchema,
  loginTotpSchema,
  totpEnrollSchema,
  recoverPasswordResponseSchema,
} from '../schemas';

export type RegisterUserRequest = z.infer<typeof registerUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RecoverPasswordRequest = z.infer<typeof recoverPasswordSchema>;
export type AccountRecoveryPayload = z.infer<
  typeof accountRecoveryPayloadSchema
>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type SaltResponse = z.infer<typeof saltResponseSchema>;
export type RecoveryDataResponse = z.infer<typeof recoveryDataResponseSchema>;
export type PreAuthResponse = z.infer<typeof preAuthResponseSchema>;
export type TotpSetupResponse = z.infer<typeof totpSetupResponseSchema>;
export type CompleteRegistration = z.infer<typeof completeRegistrationSchema>;
export type LoginTotp = z.infer<typeof loginTotpSchema>;
export type TotpEnroll = z.infer<typeof totpEnrollSchema>;
export type RecoverPasswordResponse = z.infer<
  typeof recoverPasswordResponseSchema
>;
