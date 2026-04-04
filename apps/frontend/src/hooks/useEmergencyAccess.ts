import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emergencyAccessKeys } from '../common/constants/query-keys';
import {
  acceptEmergencyAccessGrant,
  createEmergencyAccessGrant,
  listEmergencyAccessGrants,
  revokeEmergencyAccessGrant,
  type CreateEmergencyAccessGrantRequest,
} from '../services/emergency-access.service';

export function useEmergencyAccessGrants() {
  return useQuery({
    queryKey: emergencyAccessKeys.lists,
    queryFn: listEmergencyAccessGrants,
  });
}

export function useCreateEmergencyAccessGrant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEmergencyAccessGrantRequest) =>
      createEmergencyAccessGrant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emergencyAccessKeys.lists });
    },
  });
}

export function useAcceptEmergencyAccessGrant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (grantId: string) => acceptEmergencyAccessGrant(grantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emergencyAccessKeys.lists });
    },
  });
}

export function useRevokeEmergencyAccessGrant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (grantId: string) => revokeEmergencyAccessGrant(grantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emergencyAccessKeys.lists });
    },
  });
}
