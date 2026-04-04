import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { familyKeys } from '../common/constants/query-keys';
import {
  createFamilyWorkspace,
  getFamilyMembers,
  inviteFamilyMember,
  type CreateFamilyWorkspaceRequest,
  type InviteFamilyMemberRequest,
} from '../services/family.service';

export function useCreateFamilyWorkspace() {
  return useMutation({
    mutationFn: (payload: CreateFamilyWorkspaceRequest) =>
      createFamilyWorkspace(payload),
  });
}

export function useFamilyMembers(organizationId: string | null) {
  return useQuery({
    queryKey: organizationId ? familyKeys.members(organizationId) : familyKeys.all,
    queryFn: () => getFamilyMembers(organizationId!),
    enabled: Boolean(organizationId),
  });
}

export function useInviteFamilyMember(organizationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteFamilyMemberRequest) =>
      inviteFamilyMember(organizationId!, payload),
    onSuccess: () => {
      if (organizationId) {
        queryClient.invalidateQueries({
          queryKey: familyKeys.members(organizationId),
        });
      }
    },
  });
}
