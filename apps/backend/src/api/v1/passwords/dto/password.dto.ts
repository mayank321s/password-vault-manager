import {
  accessOneTimeShareResponseSchema,
  createOneTimeShareRequestSchema,
  createPasswordRequestSchema,
  grantPasswordPermissionRequestSchema,
  oneTimeShareResponseSchema,
  passwordPermissionResponseSchema,
  passwordResponseSchema,
  refreshPasswordSharesRequestSchema,
  sharedPasswordItemSchema,
  updatePasswordRequestSchema,
} from '@repo/shared';
import { createZodDto } from 'nestjs-zod';

export class CreatePasswordDto extends createZodDto(
  createPasswordRequestSchema,
) {}

export class UpdatePasswordDto extends createZodDto(
  updatePasswordRequestSchema,
) {}

export class PasswordResponseDto extends createZodDto(passwordResponseSchema) {}

export class CreateOneTimeShareDto extends createZodDto(
  createOneTimeShareRequestSchema,
) {}

export class GrantPasswordPermissionDto extends createZodDto(
  grantPasswordPermissionRequestSchema,
) {}

export class PasswordPermissionResponseDto extends createZodDto(
  passwordPermissionResponseSchema,
) {}

export class SharedPasswordItemDto extends createZodDto(
  sharedPasswordItemSchema,
) {}

export class AccessOneTimeShareResponseDto extends createZodDto(
  accessOneTimeShareResponseSchema,
) {}

export class OneTimeShareResponseDto extends createZodDto(
  oneTimeShareResponseSchema,
) {}

export class RefreshPasswordSharesDto extends createZodDto(
  refreshPasswordSharesRequestSchema,
) {}
