export const vaultKeys = {
  all: ['vaults'] as const,
  lists: ['vaults', 'list'] as const,
  details: ['vaults', 'detail'] as const,
  detail: (id: string) => [...vaultKeys.details, id] as const,
  passwords: (id: string) => [...vaultKeys.detail(id), 'passwords'] as const,
  passwordDetail: (vaultId: string, passwordId: string) =>
    [...vaultKeys.passwords(vaultId), passwordId] as const,
  members: (id: string) => [...vaultKeys.detail(id), 'members'] as const,
};

export const passwordKeys = {
  all: ['passwords'] as const,
  details: (id: string) => [...passwordKeys.all, id] as const,
  permissions: (passwordId: string) =>
    [...passwordKeys.all, passwordId, 'permissions'] as const,
  sharedWithMe: ['passwords', 'shared-with-me'] as const,
};

export const billingKeys = {
  all: ['billing'] as const,
  catalog: ['billing', 'catalog'] as const,
  subscription: ['billing', 'subscription'] as const,
  entitlements: ['billing', 'entitlements'] as const,
  invoices: ['billing', 'invoices'] as const,
};

export const familyKeys = {
  all: ['family'] as const,
  members: (organizationId: string) =>
    [...familyKeys.all, organizationId, 'members'] as const,
};

export const emergencyAccessKeys = {
  all: ['emergency-access'] as const,
  lists: ['emergency-access', 'list'] as const,
};
