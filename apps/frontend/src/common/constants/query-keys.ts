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
