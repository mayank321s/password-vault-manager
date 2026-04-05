const API_V1_PREFIX = '/api/v1';

export const API_V1_ROUTES = {
  auth: {
    register: `${API_V1_PREFIX}/auth/register`,
    registerComplete: `${API_V1_PREFIX}/auth/register/complete`,
    login: `${API_V1_PREFIX}/auth/login`,
    loginTotp: `${API_V1_PREFIX}/auth/login/totp`,
    ssoLookup: (email: string) =>
      `${API_V1_PREFIX}/auth/sso/lookup?email=${encodeURIComponent(email)}`,
    ssoStart: (email: string) =>
      `${API_V1_PREFIX}/auth/sso/start?email=${encodeURIComponent(email)}`,
    ssoCallback: (code: string, state: string) =>
      `${API_V1_PREFIX}/auth/sso/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
    getSalt: (email: string) => `${API_V1_PREFIX}/auth/salt?email=${email}`,
    getRecoveryData: (email: string) =>
      `${API_V1_PREFIX}/auth/recovery-data?email=${email}`,
    recover: `${API_V1_PREFIX}/auth/recover`,
    enrollTotp: `${API_V1_PREFIX}/auth/totp/enroll`,
    logout: `${API_V1_PREFIX}/auth/logout`,
  },
  vault: {
    getAll: `${API_V1_PREFIX}/vaults`,
    create: `${API_V1_PREFIX}/vaults`,
    update: (vaultId: string) => `${API_V1_PREFIX}/vaults/${vaultId}`,
    delete: (vaultId: string) => `${API_V1_PREFIX}/vaults/${vaultId}`,
    members: {
      add: (vaultId: string) => `${API_V1_PREFIX}/vaults/${vaultId}/members`,
      getAll: (vaultId: string) => `${API_V1_PREFIX}/vaults/${vaultId}/members`,
      update: (vaultId: string, userId: string) =>
        `${API_V1_PREFIX}/vaults/${vaultId}/members/${userId}`,
      delete: (vaultId: string, userId: string) =>
        `${API_V1_PREFIX}/vaults/${vaultId}/members/${userId}`,
    },
    rotateKeys: (vaultId: string) =>
      `${API_V1_PREFIX}/vaults/${vaultId}/rotate-keys`,
    password: {
      getAll: (vaultId: string) =>
        `${API_V1_PREFIX}/vaults/${vaultId}/passwords`,
    },
  },
  password: {
    create: `${API_V1_PREFIX}/passwords`,
    get: (passwordId: string) => `${API_V1_PREFIX}/passwords/${passwordId}`,
    update: (passwordId: string) => `${API_V1_PREFIX}/passwords/${passwordId}`,
    delete: (passwordId: string) => `${API_V1_PREFIX}/passwords/${passwordId}`,
    sharedWithMe: `${API_V1_PREFIX}/passwords/shared-with-me`,
    share: (passwordId: string) =>
      `${API_V1_PREFIX}/passwords/${passwordId}/share`,
    permissions: {
      grant: (passwordId: string) =>
        `${API_V1_PREFIX}/passwords/${passwordId}/permissions`,
      list: (passwordId: string) =>
        `${API_V1_PREFIX}/passwords/${passwordId}/permissions`,
      refresh: (passwordId: string) =>
        `${API_V1_PREFIX}/passwords/${passwordId}/permissions`,
      revoke: (passwordId: string, userId: string) =>
        `${API_V1_PREFIX}/passwords/${passwordId}/permissions/${userId}`,
    },
  },
  user: {
    search: (q: string, vaultId: string) =>
      `${API_V1_PREFIX}/users/search?q=${encodeURIComponent(q)}&vaultId=${encodeURIComponent(vaultId)}`,
    getPublicKey: (email: string) =>
      `${API_V1_PREFIX}/users/${encodeURIComponent(email)}/public-key`,
  },
  billing: {
    catalog: `${API_V1_PREFIX}/billing/catalog`,
    checkoutSession: `${API_V1_PREFIX}/billing/checkout-session`,
    subscription: `${API_V1_PREFIX}/billing/subscription`,
    entitlements: `${API_V1_PREFIX}/billing/entitlements`,
    invoices: `${API_V1_PREFIX}/billing/invoices`,
    portalSession: `${API_V1_PREFIX}/billing/portal-session`,
  },
  policy: {
    current: `${API_V1_PREFIX}/policies/current`,
  },
  family: {
    createWorkspace: `${API_V1_PREFIX}/family/workspaces`,
    inviteMember: (organizationId: string) =>
      `${API_V1_PREFIX}/family/workspaces/${organizationId}/invitations`,
    acceptInvitation: (organizationId: string) =>
      `${API_V1_PREFIX}/family/workspaces/${organizationId}/invitations/accept`,
    members: (organizationId: string) =>
      `${API_V1_PREFIX}/family/workspaces/${organizationId}/members`,
  },
  emergencyAccess: {
    list: `${API_V1_PREFIX}/emergency-access/grants`,
    create: `${API_V1_PREFIX}/emergency-access/grants`,
    accept: (grantId: string) =>
      `${API_V1_PREFIX}/emergency-access/grants/${grantId}/accept`,
    revoke: (grantId: string) =>
      `${API_V1_PREFIX}/emergency-access/grants/${grantId}`,
  },
  sso: {
    current: `${API_V1_PREFIX}/sso/config/current`,
    verifyDomain: (domainId: string) =>
      `${API_V1_PREFIX}/sso/config/domains/${domainId}/verify`,
  },
  scim: {
    adminTokens: `${API_V1_PREFIX}/scim/admin/tokens`,
    revokeToken: (tokenId: string) =>
      `${API_V1_PREFIX}/scim/admin/tokens/${tokenId}/revoke`,
    adminDiagnostics: `${API_V1_PREFIX}/scim/admin/diagnostics`,
  },
};
