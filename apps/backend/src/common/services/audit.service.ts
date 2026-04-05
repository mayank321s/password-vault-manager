import { Injectable } from '@nestjs/common';
import { CurrentUserData } from 'src/common/decorators';
import { AuditEventRepository } from 'src/database/repositories';

type AuditRecordInput = {
  organizationId: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  targetLabel?: string | null;
  metadata?: Record<string, unknown> | null;
};

@Injectable()
export class AuditService {
  constructor(private readonly auditEventRepository: AuditEventRepository) {}

  async record(event: AuditRecordInput) {
    return this.auditEventRepository.create({
      organizationId: event.organizationId,
      actorUserId: event.actorUserId ?? null,
      actorEmail: event.actorEmail ?? null,
      action: event.action,
      targetType: event.targetType,
      targetId: event.targetId ?? null,
      targetLabel: event.targetLabel ?? null,
      metadata: event.metadata ?? null,
    });
  }

  async recordFromUser(
    user: CurrentUserData,
    event: Omit<AuditRecordInput, 'organizationId' | 'actorUserId' | 'actorEmail'>,
  ) {
    if (!user.organizationId) {
      return null;
    }

    return this.record({
      organizationId: user.organizationId,
      actorUserId: user.userId,
      actorEmail: user.email,
      ...event,
    });
  }
}
