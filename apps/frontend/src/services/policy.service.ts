import { API_V1_ROUTES } from '../common/constants/api-routes';
import { apiClient } from '../lib/api-client';

export interface OrganizationPolicyResponse {
  organizationId: string;
  requireMfa: boolean;
  restrictExternalSharing: boolean;
  sessionTimeoutMinutes: number;
  maxDevicesPerUser: number;
  policyVersion: string;
  updatedAt: string | null;
}

export interface UpsertOrganizationPolicyRequest {
  requireMfa: boolean;
  restrictExternalSharing: boolean;
  sessionTimeoutMinutes: number;
  maxDevicesPerUser: number;
}

export async function getCurrentOrganizationPolicy() {
  const response = await apiClient.get<OrganizationPolicyResponse>(
    API_V1_ROUTES.policy.current,
  );
  return response.data;
}

export async function upsertOrganizationPolicy(
  payload: UpsertOrganizationPolicyRequest,
) {
  const response = await apiClient.post<OrganizationPolicyResponse>(
    API_V1_ROUTES.policy.current,
    payload,
  );
  return response.data;
}
