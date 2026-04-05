import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { policyKeys } from '../common/constants/query-keys';
import {
  getCurrentOrganizationPolicy,
  upsertOrganizationPolicy,
  type UpsertOrganizationPolicyRequest,
} from '../services/policy.service';

export function useOrganizationPolicy(
  organizationId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: policyKeys.current(organizationId),
    queryFn: () => getCurrentOrganizationPolicy(),
    enabled,
  });
}

export function useUpsertOrganizationPolicy(
  organizationId: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertOrganizationPolicyRequest) =>
      upsertOrganizationPolicy(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(policyKeys.current(organizationId), data);
    },
  });
}
