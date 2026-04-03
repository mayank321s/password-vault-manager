import { UserSearchResponse, VaultMemberResponse } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { API_V1_ROUTES } from '../common/constants/api-routes';
import { vaultKeys } from '../common/constants/query-keys';
import { apiClient } from '../lib/api-client';
import {
  getUserVaults,
  getVaultMembers,
  getVaultPasswords,
} from '../services/vault.service';

// ============================================
// Queries
// ============================================

/**
 * Get all user's vaults
 */
export function useGetVaults() {
  return useQuery({
    queryKey: vaultKeys.lists,
    queryFn: getUserVaults,
    staleTime: 2 * 60 * 1000, // 1 minutes
  });
}

/**
 * Get all passwords in a vault (for re-encryption)
 */
export function useGetVaultPasswords(vaultId: string, enabled = false) {
  return useQuery({
    queryKey: vaultKeys.passwords(vaultId),
    queryFn: () => getVaultPasswords(vaultId),
    enabled: enabled && !!vaultId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get vault members for settings panel
 */
export function useVaultMembersList(vaultId: string, enabled: boolean) {
  return useQuery<VaultMemberResponse>({
    queryKey: vaultKeys.members(vaultId),
    queryFn: () => getVaultMembers(vaultId!),
    enabled: !!vaultId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Search users by email or username (for add-member autocomplete)
 */
export function useSearchUsers(query: string, vaultId: string) {
  return useQuery<UserSearchResponse>({
    queryKey: ['users', 'search', query, vaultId],
    queryFn: () =>
      apiClient
        .get<UserSearchResponse>(API_V1_ROUTES.user.search(query, vaultId))
        .then((r) => r.data),
    enabled: query.trim().length >= 2 && !!vaultId,
    staleTime: 30 * 1000, // 30 seconds
  });
}
