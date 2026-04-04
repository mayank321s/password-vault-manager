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

export function useSsoConfiguration(
  organizationId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: ssoKeys.configuration(organizationId),
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
    mutationFn: (variables: {
      organizationId: string | null;
      payload: UpsertSsoConfigurationRequest;
    }) => upsertSsoConfiguration(variables.payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ssoKeys.configuration(variables.organizationId),
        data,
      );
    },
  });
}

export function useVerifySsoDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      domainId: string;
      organizationId: string | null;
      verificationToken: string;
    }) =>
      verifySsoDomain(variables.domainId, {
        verificationToken: variables.verificationToken,
      }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ssoKeys.configuration(variables.organizationId),
        data,
      );
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
