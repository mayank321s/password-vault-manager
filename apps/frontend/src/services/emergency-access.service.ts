import { API_V1_ROUTES } from '../common/constants/api-routes';
import { apiClient } from '../lib/api-client';

export type EmergencyAccessGrant = {
  grantId: string;
  organizationId: string;
  grantorUserId: string;
  grantorEmail: string;
  grantorUsername: string;
  granteeUserId: string;
  granteeEmail: string;
  granteeUsername: string;
  status: 'pending_acceptance' | 'active' | 'revoked' | 'declined';
  recoveryDelayHours: number;
  note: string | null;
  acceptedAt: string | null;
  revokedAt: string | null;
  revokedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmergencyAccessGrantList = {
  outgoing: EmergencyAccessGrant[];
  incoming: EmergencyAccessGrant[];
};

export type CreateEmergencyAccessGrantRequest = {
  granteeEmail: string;
  recoveryDelayHours: number;
  note?: string;
};

export async function listEmergencyAccessGrants(): Promise<EmergencyAccessGrantList> {
  const response = await apiClient.get<EmergencyAccessGrantList>(
    API_V1_ROUTES.emergencyAccess.list,
  );
  return response.data;
}

export async function createEmergencyAccessGrant(
  payload: CreateEmergencyAccessGrantRequest,
): Promise<EmergencyAccessGrant> {
  const response = await apiClient.post<EmergencyAccessGrant>(
    API_V1_ROUTES.emergencyAccess.create,
    payload,
  );
  return response.data;
}

export async function acceptEmergencyAccessGrant(
  grantId: string,
): Promise<EmergencyAccessGrant> {
  const response = await apiClient.post<EmergencyAccessGrant>(
    API_V1_ROUTES.emergencyAccess.accept(grantId),
  );
  return response.data;
}

export async function revokeEmergencyAccessGrant(
  grantId: string,
): Promise<EmergencyAccessGrant> {
  const response = await apiClient.delete<EmergencyAccessGrant>(
    API_V1_ROUTES.emergencyAccess.revoke(grantId),
  );
  return response.data;
}
