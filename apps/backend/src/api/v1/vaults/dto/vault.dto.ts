import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  successResponseSchema,
  addVaultMemberRequestSchema,
  vaultMemberResponseSchema,
  vaultResponseSchema,
  createVaultRequestSchema,
  updateVaultRequestSchema,
  updateVaultMemberRoleRequestSchema,
  rotateVaultKeysRequestSchema,
  getVaultPasswordsQuerySchema,
  getVaultPasswordsResponseSchema,
} from '@repo/shared';

export class CreateVaultRequestDto extends createZodDto(
  createVaultRequestSchema,
) {}

export class UpdateVaultRequestDto extends createZodDto(
  updateVaultRequestSchema,
) {}

export class VaultMemberResponseDto extends createZodDto(
  vaultMemberResponseSchema,
) {}

export class VaultResponseDto extends createZodDto(vaultResponseSchema) {}

export class AddVaultMemberRequestDto extends createZodDto(
  addVaultMemberRequestSchema,
) {}

export type UpdateVaultMemberRoleRequestDto = z.infer<
  typeof updateVaultMemberRoleRequestSchema
>;

export class RotateVaultKeysRequestDto extends createZodDto(
  rotateVaultKeysRequestSchema,
) {}

export class SuccessResponseDto extends createZodDto(successResponseSchema) {}

export class GetVaultPasswordsQueryDto extends createZodDto(
  getVaultPasswordsQuerySchema,
) {}

export class GetVaultPasswordsResponseDto extends createZodDto(
  getVaultPasswordsResponseSchema,
) {}
