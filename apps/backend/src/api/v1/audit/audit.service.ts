import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CurrentUserData } from 'src/common/decorators';
import {
  OrganizationMemberRole,
  OrganizationMemberStatus,
  OrganizationType,
} from 'src/database/models';
import {
  AuditEventRepository,
  OrganizationMemberRepository,
  OrganizationRepository,
} from 'src/database/repositories';
import { AuditEventListDto, AuditExportDto } from './dto';

type AuditQuery = {
  actorUserId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: string;
};

@Injectable()
export class AuditApiService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly auditEventRepository: AuditEventRepository,
  ) {}

  async listEvents(
    user: CurrentUserData,
    query: AuditQuery,
  ): Promise<AuditEventListDto> {
    const organizationId = await this.requireBusinessOrganizationAdmin(user);
    const events = await this.auditEventRepository.findByFilters(
      {
        organizationId,
        actorUserId: query.actorUserId,
        action: query.action,
        targetType: query.targetType,
        targetId: query.targetId,
        createdFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        createdTo: query.dateTo ? new Date(query.dateTo) : undefined,
      },
      this.normalizeLimit(query.limit),
    );

    return {
      events: events.map((event) => ({
        eventId: event.id,
        organizationId: event.organizationId,
        actorUserId: event.actorUserId,
        actorEmail: event.actorEmail,
        action: event.action,
        targetType: event.targetType,
        targetId: event.targetId,
        targetLabel: event.targetLabel,
        metadata: event.metadata ?? null,
        createdAt: event.createdAt.toISOString(),
      })),
    };
  }

  async exportEvents(
    user: CurrentUserData,
    format: 'csv' | 'json',
    query: AuditQuery,
  ): Promise<AuditExportDto> {
    const response = await this.listEvents(user, query);
    const exportedAt = new Date().toISOString();
    const fileName = `audit-events-${exportedAt.replace(/[:.]/g, '-')}.${format}`;

    if (format === 'json') {
      return {
        format,
        fileName,
        contentType: 'application/json',
        content: JSON.stringify(response.events, null, 2),
        exportedAt,
      };
    }

    const header = [
      'eventId',
      'organizationId',
      'actorUserId',
      'actorEmail',
      'action',
      'targetType',
      'targetId',
      'targetLabel',
      'metadata',
      'createdAt',
    ];
    const rows = response.events.map((event) =>
      [
        event.eventId,
        event.organizationId,
        event.actorUserId ?? '',
        event.actorEmail ?? '',
        event.action,
        event.targetType,
        event.targetId ?? '',
        event.targetLabel ?? '',
        JSON.stringify(event.metadata ?? {}),
        event.createdAt,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    );

    return {
      format,
      fileName,
      contentType: 'text/csv',
      content: [header.join(','), ...rows].join('\n'),
      exportedAt,
    };
  }

  private normalizeLimit(limit?: string) {
    const parsed = Number(limit ?? '100');
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException('Limit must be a positive integer');
    }
    return Math.min(parsed, 500);
  }

  private async requireBusinessOrganizationAdmin(user: CurrentUserData) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization context is required');
    }

    const [organization, membership] = await Promise.all([
      this.organizationRepository.findById(user.organizationId),
      this.organizationMemberRepository.findOneBy({
        organizationId: user.organizationId,
        userId: user.userId,
        status: OrganizationMemberStatus.ACTIVE,
      }),
    ]);

    if (!organization || organization.organizationType !== OrganizationType.BUSINESS) {
      throw new ForbiddenException('Audit reporting is only available for business organizations');
    }

    if (
      !membership ||
      (membership.role !== OrganizationMemberRole.OWNER &&
        membership.role !== OrganizationMemberRole.ADMIN)
    ) {
      throw new ForbiddenException('Admin organization access is required');
    }

    return organization.id;
  }
}
