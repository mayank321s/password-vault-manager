import { API_V1_ROUTES } from '../common/constants/api-routes';
import { apiClient } from '../lib/api-client';

export interface ScimTokenSummary {
  tokenId: string;
  label: string;
  tokenPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface ScimTokenListResponse {
  tokens: ScimTokenSummary[];
}

export interface CreateScimTokenRequest {
  label: string;
}

export interface CreateScimTokenResponse extends ScimTokenSummary {
  plainTextToken: string;
}

export interface ScimProvisioningEventSummary {
  eventId: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  status: 'success' | 'failure';
  detail: string | null;
  createdAt: string;
}

export interface ScimDiagnosticsResponse {
  organizationId: string;
  tokenStatus: {
    activeTokenCount: number;
    revokedTokenCount: number;
    latestTokenUseAt: string | null;
  };
  provisioningStatus: {
    lastSuccessAt: string | null;
    lastFailureAt: string | null;
    recentFailureCount: number;
  };
  endpoints: {
    baseUrl: string;
    usersUrl: string;
    groupsUrl: string;
  };
  recentEvents: ScimProvisioningEventSummary[];
  tokens: ScimTokenSummary[];
}

export async function getScimTokens() {
  const response = await apiClient.get<ScimTokenListResponse>(
    API_V1_ROUTES.scim.adminTokens,
  );
  return response.data;
}

export async function createScimToken(payload: CreateScimTokenRequest) {
  const response = await apiClient.post<CreateScimTokenResponse>(
    API_V1_ROUTES.scim.adminTokens,
    payload,
  );
  return response.data;
}

export async function revokeScimToken(tokenId: string) {
  const response = await apiClient.patch<ScimTokenSummary>(
    API_V1_ROUTES.scim.revokeToken(tokenId),
  );
  return response.data;
}

export async function getScimDiagnostics() {
  const response = await apiClient.get<ScimDiagnosticsResponse>(
    API_V1_ROUTES.scim.adminDiagnostics,
  );
  return response.data;
}
