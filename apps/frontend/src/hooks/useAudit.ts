import { useMutation, useQuery } from '@tanstack/react-query';
import { auditKeys } from '../common/constants/query-keys';
import {
  exportAuditEvents,
  getAuditEvents,
  type AuditFilters,
} from '../services/audit.service';

export function useAuditEvents(
  organizationId: string | null,
  filters: AuditFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: auditKeys.events(organizationId, filters),
    queryFn: () => getAuditEvents(filters),
    enabled,
  });
}

export function useExportAuditEvents() {
  return useMutation({
    mutationFn: (variables: { format: 'csv' | 'json'; filters: AuditFilters }) =>
      exportAuditEvents(variables.format, variables.filters),
  });
}
