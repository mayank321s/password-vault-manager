import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const scimSchemaList = z.array(z.string()).default([]);

const scimEmailSchema = z.object({
  value: z.string().email(),
  primary: z.boolean().optional(),
});

const scimMemberRefSchema = z.object({
  value: z.string().min(1),
  display: z.string().optional(),
});

const scimUserResourceSchema = z.object({
  schemas: scimSchemaList,
  id: z.string().uuid(),
  externalId: z.string().nullable(),
  userName: z.string().email(),
  displayName: z.string(),
  active: z.boolean(),
  emails: z.array(scimEmailSchema),
  groups: z.array(scimMemberRefSchema),
});

const scimGroupResourceSchema = z.object({
  schemas: scimSchemaList,
  id: z.string(),
  displayName: z.string(),
  members: z.array(scimMemberRefSchema),
});

const scimListResponseSchema = z.object({
  schemas: z.array(z.string()),
  totalResults: z.number().int().nonnegative(),
  startIndex: z.number().int().positive(),
  itemsPerPage: z.number().int().nonnegative(),
  Resources: z.array(z.union([scimUserResourceSchema, scimGroupResourceSchema])),
});

export const scimUserListResponseSchema = z.object({
  schemas: z.array(z.string()),
  totalResults: z.number().int().nonnegative(),
  startIndex: z.number().int().positive(),
  itemsPerPage: z.number().int().nonnegative(),
  Resources: z.array(scimUserResourceSchema),
});

export const scimGroupListResponseSchema = z.object({
  schemas: z.array(z.string()),
  totalResults: z.number().int().nonnegative(),
  startIndex: z.number().int().positive(),
  itemsPerPage: z.number().int().nonnegative(),
  Resources: z.array(scimGroupResourceSchema),
});

export const scimCreateUserRequestSchema = z.object({
  schemas: z.array(z.string()).optional(),
  externalId: z.string().max(255).optional(),
  userName: z.string().email(),
  displayName: z.string().min(1).max(255).optional(),
  active: z.boolean().optional(),
});

export const scimUpdateUserRequestSchema = scimCreateUserRequestSchema;

const scimPatchOperationSchema = z.object({
  op: z.enum(['Add', 'Replace', 'Remove', 'add', 'replace', 'remove']),
  path: z.string().optional(),
  value: z.any().optional(),
});

export const scimPatchUserRequestSchema = z.object({
  schemas: z.array(z.string()).optional(),
  Operations: z.array(scimPatchOperationSchema).min(1),
});

export const scimPatchGroupRequestSchema = z.object({
  schemas: z.array(z.string()).optional(),
  Operations: z.array(scimPatchOperationSchema).min(1),
});

export class ScimUserResourceDto extends createZodDto(scimUserResourceSchema) {}
export class ScimGroupResourceDto extends createZodDto(scimGroupResourceSchema) {}
export class ScimUserListResponseDto extends createZodDto(scimUserListResponseSchema) {}
export class ScimGroupListResponseDto extends createZodDto(scimGroupListResponseSchema) {}
export class ScimCreateUserRequestDto extends createZodDto(scimCreateUserRequestSchema) {}
export class ScimUpdateUserRequestDto extends createZodDto(scimUpdateUserRequestSchema) {}
export class ScimPatchUserRequestDto extends createZodDto(scimPatchUserRequestSchema) {}
export class ScimPatchGroupRequestDto extends createZodDto(scimPatchGroupRequestSchema) {}

export type ScimCreateUserRequest = z.infer<typeof scimCreateUserRequestSchema>;
export type ScimUpdateUserRequest = z.infer<typeof scimUpdateUserRequestSchema>;
export type ScimPatchUserRequest = z.infer<typeof scimPatchUserRequestSchema>;
export type ScimPatchGroupRequest = z.infer<typeof scimPatchGroupRequestSchema>;
export type ScimUserResource = z.infer<typeof scimUserResourceSchema>;
export type ScimGroupResource = z.infer<typeof scimGroupResourceSchema>;
export type ScimMemberRef = z.infer<typeof scimMemberRefSchema>;
