import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const familyMemberRoleSchema = z.enum(['owner', 'adult', 'child']);
const familyMemberStatusSchema = z.enum(['active', 'invited', 'suspended']);

export const createFamilyWorkspaceRequestSchema = z.object({
  name: z.string().min(2).max(120),
  familyVaultEncryptedKey: z.string().min(16),
});

export const createFamilyWorkspaceResponseSchema = z.object({
  organizationId: z.string().uuid(),
  familyVaultId: z.string().uuid(),
  status: z.literal('created'),
});

export const inviteFamilyMemberRequestSchema = z.object({
  userEmail: z.string().email(),
  role: z.enum(['adult', 'child']),
});

export const inviteFamilyMemberResponseSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  role: familyMemberRoleSchema,
  status: familyMemberStatusSchema,
});

export const acceptFamilyInvitationRequestSchema = z.object({
  familyVaultEncryptedKey: z.string().min(16),
});

export const acceptFamilyInvitationResponseSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.literal('accepted'),
});

export const familyMemberSummarySchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  username: z.string(),
  role: familyMemberRoleSchema,
  status: familyMemberStatusSchema,
  invitedAt: z.string().datetime().nullable(),
  joinedAt: z.string().datetime().nullable(),
});

export const familyMembersResponseSchema = z.object({
  organizationId: z.string().uuid(),
  members: z.array(familyMemberSummarySchema),
});

export class CreateFamilyWorkspaceRequestDto extends createZodDto(
  createFamilyWorkspaceRequestSchema,
) {}

export class CreateFamilyWorkspaceResponseDto extends createZodDto(
  createFamilyWorkspaceResponseSchema,
) {}

export class InviteFamilyMemberRequestDto extends createZodDto(
  inviteFamilyMemberRequestSchema,
) {}

export class InviteFamilyMemberResponseDto extends createZodDto(
  inviteFamilyMemberResponseSchema,
) {}

export class AcceptFamilyInvitationRequestDto extends createZodDto(
  acceptFamilyInvitationRequestSchema,
) {}

export class AcceptFamilyInvitationResponseDto extends createZodDto(
  acceptFamilyInvitationResponseSchema,
) {}

export class FamilyMembersResponseDto extends createZodDto(
  familyMembersResponseSchema,
) {}

