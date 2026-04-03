import { createZodDto } from 'nestjs-zod';

import {
  authResponseSchema,
  completeRegistrationSchema,
  loginSchema,
  loginTotpSchema,
  preAuthResponseSchema,
  recoverPasswordSchema,
  recoveryDataResponseSchema,
  registerUserSchema,
  saltResponseSchema,
  totpSetupResponseSchema,
  totpEnrollSchema,
  recoverPasswordResponseSchema,
} from '@repo/shared';

export class RegisterUserDto extends createZodDto(registerUserSchema) {}

export class LoginDto extends createZodDto(loginSchema) {}

export class RecoverPasswordDto extends createZodDto(recoverPasswordSchema) {}

export class AuthResponseDto extends createZodDto(authResponseSchema) {}

export class SaltResponseDto extends createZodDto(saltResponseSchema) {}

export class RecoveryDataResponseDto extends createZodDto(
  recoveryDataResponseSchema,
) {}

export class PreAuthResponseDto extends createZodDto(preAuthResponseSchema) {}

export class TotpSetupResponseDto extends createZodDto(
  totpSetupResponseSchema,
) {}

export class CompleteRegistrationDto extends createZodDto(
  completeRegistrationSchema,
) {}

export class LoginTotpDto extends createZodDto(loginTotpSchema) {}

export class TotpEnrollDto extends createZodDto(totpEnrollSchema) {}

export class RecoverPasswordResponseDto extends createZodDto(
  recoverPasswordResponseSchema,
) {}
