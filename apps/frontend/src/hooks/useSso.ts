import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ssoKeys } from '../common/constants/query-keys';
import {
  completeSsoLogin,
  getCurrentSsoConfiguration,
  lookupSsoRoute,
  startSsoLogin,
  type UpsertSsoConfigurationRequest,
  upsertSsoConfiguration,
  verifySsoDomain,
} from '../services/sso.service';

export function useSsoConfiguration(enabled = true) {
  return useQuery({
    queryKey: ssoKeys.configuration,
    queryFn: async () => {
      try {
        return await getCurrentSsoConfiguration();
      } catch (error) {
        const apiError = error as { statusCode?: number };
        if (apiError.statusCode === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled,
  });
}

export function useUpsertSsoConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertSsoConfigurationRequest) =>
      upsertSsoConfiguration(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(ssoKeys.configuration, data);
    },
  });
}

export function useVerifySsoDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      domainId,
      verificationToken,
    }: {
      domainId: string;
      verificationToken: string;
    }) => verifySsoDomain(domainId, { verificationToken }),
    onSuccess: (data) => {
      queryClient.setQueryData(ssoKeys.configuration, data);
    },
  });
}

export function useSsoLookup(email: string, enabled = true) {
  return useQuery({
    queryKey: ssoKeys.lookup(email),
    queryFn: () => lookupSsoRoute(email),
    enabled,
    staleTime: 60_000,
  });
}

export function useStartSsoLogin() {
  return useMutation({
    mutationFn: (email: string) => startSsoLogin(email),
  });
}

export function useSsoCallback(code: string, state: string, enabled = true) {
  return useQuery({
    queryKey: ssoKeys.callback(code, state),
    queryFn: () => completeSsoLogin(code, state),
    enabled,
    retry: false,
  });
}
