import { API_V1_ROUTES } from '../common/constants/api-routes';
import { apiClient } from '../lib/api-client';

export type FamilyInviteRole = 'adult' | 'child';

export type CreateFamilyWorkspaceRequest = {
  name: string;
  familyVaultEncryptedKey: string;
};

export type CreateFamilyWorkspaceResponse = {
  organizationId: string;
  familyVaultId: string;
  status: 'created';
};

export type InviteFamilyMemberRequest = {
  userEmail: string;
  role: FamilyInviteRole;
};

export type InviteFamilyMemberResponse = {
  organizationId: string;
  userId: string;
  role: 'owner' | 'adult' | 'child';
  status: 'active' | 'invited' | 'suspended';
};

export type FamilyMembersResponse = {
  organizationId: string;
  members: Array<{
    userId: string;
    email: string;
    username: string;
    role: 'owner' | 'adult' | 'child';
    status: 'active' | 'invited' | 'suspended';
    invitedAt: string | null;
    joinedAt: string | null;
  }>;
};

export async function createFamilyWorkspace(
  payload: CreateFamilyWorkspaceRequest,
): Promise<CreateFamilyWorkspaceResponse> {
  const response = await apiClient.post<CreateFamilyWorkspaceResponse>(
    API_V1_ROUTES.family.createWorkspace,
    payload,
  );
  return response.data;
}

export async function inviteFamilyMember(
  organizationId: string,
  payload: InviteFamilyMemberRequest,
): Promise<InviteFamilyMemberResponse> {
  const response = await apiClient.post<InviteFamilyMemberResponse>(
    API_V1_ROUTES.family.inviteMember(organizationId),
    payload,
  );
  return response.data;
}

export async function getFamilyMembers(
  organizationId: string,
): Promise<FamilyMembersResponse> {
  const response = await apiClient.get<FamilyMembersResponse>(
    API_V1_ROUTES.family.members(organizationId),
  );
  return response.data;
}
