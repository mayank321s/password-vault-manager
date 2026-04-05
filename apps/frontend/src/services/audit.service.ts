import { API_V1_ROUTES } from '../common/constants/api-routes';
import { apiClient } from '../lib/api-client';

export interface AuditEventSummary {
  eventId: string;
  organizationId: string;
  actorUserId: string | null;
  actorEmail: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  targetLabel: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditEventListResponse {
  events: AuditEventSummary[];
}

export interface AuditExportResponse {
  format: 'csv' | 'json';
  fileName: string;
  contentType: string;
  content: string;
  exportedAt: string;
}

export interface AuditFilters {
  actorUserId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

function buildQuery(filters: AuditFilters) {
  const params = new URLSearchParams();

  if (filters.actorUserId) {
    params.set('actorUserId', filters.actorUserId);
  }
  if (filters.action) {
    params.set('action', filters.action);
  }
  if (filters.targetType) {
    params.set('targetType', filters.targetType);
  }
  if (filters.targetId) {
    params.set('targetId', filters.targetId);
  }
  if (filters.dateFrom) {
    params.set('dateFrom', filters.dateFrom);
  }
  if (filters.dateTo) {
    params.set('dateTo', filters.dateTo);
  }
  if (filters.limit) {
    params.set('limit', String(filters.limit));
  }

  return params.toString();
}

export async function getAuditEvents(filters: AuditFilters) {
  const query = buildQuery(filters);
  const response = await apiClient.get<AuditEventListResponse>(
    query
      ? `${API_V1_ROUTES.audit.events}?${query}`
      : API_V1_ROUTES.audit.events,
  );
  return response.data;
}

export async function exportAuditEvents(
  format: 'csv' | 'json',
  filters: AuditFilters,
) {
  const params = new URLSearchParams(buildQuery(filters));
  params.set('format', format);

  const response = await apiClient.get<AuditExportResponse>(
    `${API_V1_ROUTES.audit.export}?${params.toString()}`,
  );
  return response.data;
}
