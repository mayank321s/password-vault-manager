import { API_V1_ROUTES } from '../common/constants/api-routes';
import { apiClient } from '../lib/api-client';

export type SsoProvider = 'entra_oidc';

export interface SsoDomainSummary {
  domainId: string;
  domain: string;
  verificationToken: string;
  verifiedAt: string | null;
  isPrimary: boolean;
}

export interface SsoConfigurationResponse {
  configId: string;
  organizationId: string;
  provider: SsoProvider;
  tenantId: string;
  clientId: string;
  clientSecretRef: string | null;
  redirectUri: string;
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  scopes: string;
  isActive: boolean;
  domains: SsoDomainSummary[];
}

export interface UpsertSsoConfigurationRequest {
  tenantId: string;
  clientId: string;
  clientSecretRef?: string;
  redirectUri: string;
  domains: string[];
  primaryDomain: string;
}

export interface VerifySsoDomainRequest {
  verificationToken: string;
}

export interface SsoLookupResponse {
  requiresSso: boolean;
  organizationId: string | null;
  provider: SsoProvider | null;
  primaryDomain: string | null;
}

export interface SsoStartResponse {
  redirectUrl: string;
  state: string;
  organizationId: string;
  provider: SsoProvider;
}

export interface SsoCallbackResponse {
  organizationId: string;
  provider: SsoProvider;
  emailDomain: string;
  authorizationCode: string;
  tokenExchangePending: boolean;
}

export async function getCurrentSsoConfiguration() {
  const response = await apiClient.get<SsoConfigurationResponse>(
    API_V1_ROUTES.sso.current,
  );
  return response.data;
}

export async function upsertSsoConfiguration(
  payload: UpsertSsoConfigurationRequest,
) {
  const response = await apiClient.post<SsoConfigurationResponse>(
    API_V1_ROUTES.sso.current,
    payload,
  );
  return response.data;
}

export async function verifySsoDomain(
  domainId: string,
  payload: VerifySsoDomainRequest,
) {
  const response = await apiClient.post<SsoConfigurationResponse>(
    API_V1_ROUTES.sso.verifyDomain(domainId),
    payload,
  );
  return response.data;
}

export async function lookupSsoRoute(email: string) {
  const response = await apiClient.get<SsoLookupResponse>(
    API_V1_ROUTES.auth.ssoLookup(email),
  );
  return response.data;
}

export async function startSsoLogin(email: string) {
  const response = await apiClient.get<SsoStartResponse>(
    API_V1_ROUTES.auth.ssoStart(email),
  );
  return response.data;
}

export async function completeSsoLogin(code: string, state: string) {
  const response = await apiClient.get<SsoCallbackResponse>(
    API_V1_ROUTES.auth.ssoCallback(code, state),
  );
  return response.data;
}
