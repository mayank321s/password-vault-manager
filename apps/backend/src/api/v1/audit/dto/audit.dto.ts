import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const auditEventItemSchema = z.object({
  eventId: z.string().uuid(),
  organizationId: z.string().uuid(),
  actorUserId: z.string().uuid().nullable(),
  actorEmail: z.string().nullable(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string().nullable(),
  targetLabel: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string().datetime(),
});

export const auditEventListSchema = z.object({
  events: z.array(auditEventItemSchema),
});

export const auditExportSchema = z.object({
  format: z.enum(['csv', 'json']),
  fileName: z.string(),
  contentType: z.string(),
  content: z.string(),
  exportedAt: z.string().datetime(),
});

export class AuditEventItemDto extends createZodDto(auditEventItemSchema) {}
export class AuditEventListDto extends createZodDto(auditEventListSchema) {}
export class AuditExportDto extends createZodDto(auditExportSchema) {}
