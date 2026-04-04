import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scimKeys } from '../common/constants/query-keys';
import {
  createScimToken,
  getScimDiagnostics,
  getScimTokens,
  type CreateScimTokenRequest,
  revokeScimToken,
} from '../services/scim.service';

export function useScimTokens(organizationId: string | null, enabled = true) {
  return useQuery({
    queryKey: scimKeys.tokens(organizationId),
    queryFn: getScimTokens,
    enabled,
  });
}

export function useScimDiagnostics(organizationId: string | null, enabled = true) {
  return useQuery({
    queryKey: scimKeys.diagnostics(organizationId),
    queryFn: getScimDiagnostics,
    enabled,
  });
}

export function useCreateScimToken(organizationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateScimTokenRequest) => createScimToken(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scimKeys.tokens(organizationId) });
      queryClient.invalidateQueries({ queryKey: scimKeys.diagnostics(organizationId) });
    },
  });
}

export function useRevokeScimToken(organizationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tokenId: string) => revokeScimToken(tokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scimKeys.tokens(organizationId) });
      queryClient.invalidateQueries({ queryKey: scimKeys.diagnostics(organizationId) });
    },
  });
}
