import { useQuery } from '@tanstack/react-query';
import { passwordKeys } from '../common/constants/query-keys';
import {
  getPasswordDetails,
  getPasswordPermissions,
  getSharedWithMe,
} from '../services/vault.service';

/**
 * Get a single password detail
 */
export function useGetPasswordDetail(passwordId: string, enabled: boolean) {
  return useQuery({
    queryKey: passwordKeys.details(passwordId),
    queryFn: () => getPasswordDetails(passwordId),
    enabled: !!passwordId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * List all users with individual access to a password
 */
export function usePasswordPermissions(
  passwordId: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: passwordKeys.permissions(passwordId),
    queryFn: () => getPasswordPermissions(passwordId),
    enabled: !!passwordId && enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Fetch all passwords shared with the current user
 */
export function useSharedWithMe(enabled: boolean = true) {
  return useQuery({
    queryKey: passwordKeys.sharedWithMe,
    queryFn: () => getSharedWithMe(),
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}
