import type { PasswordResponse } from '@repo/shared';

export interface ExtensionBackendContract {
  auth: {
    login: string;
    loginTotp: string;
    salt: (email: string) => string;
  };
  passwords: {
    detail: (passwordId: string) => string;
    sharedWithMe: string;
  };
  vaults: {
    passwords: (vaultId: string) => string;
  };
}

export interface ExtensionCredentialRecord {
  passwordId: string;
  vaultId: string;
  vaultName: string;
  title: string;
  encryptedData: string;
  passwordEncryptedKey?: string;
  accessSource: 'vault' | 'individual-share';
  isNote: boolean;
  createdAt: string;
  updatedAt: string;
}

export function createExtensionBackendContract(
  apiPrefix = '/api/v1',
): ExtensionBackendContract {
  return {
    auth: {
      login: `${apiPrefix}/auth/login`,
      loginTotp: `${apiPrefix}/auth/login/totp`,
      salt: (email: string) => `${apiPrefix}/auth/salt/${encodeURIComponent(email)}`,
    },
    passwords: {
      detail: (passwordId: string) => `${apiPrefix}/passwords/${passwordId}`,
      sharedWithMe: `${apiPrefix}/passwords/shared-with-me`,
    },
    vaults: {
      passwords: (vaultId: string) => `${apiPrefix}/vaults/${vaultId}/passwords`,
    },
  };
}

export function toExtensionCredentialRecord(
  password: PasswordResponse,
): ExtensionCredentialRecord {
  return {
    passwordId: password.id,
    vaultId: password.vaultId,
    vaultName: password.vaultName,
    title: password.name,
    encryptedData: password.encryptedData,
    passwordEncryptedKey: password.passwordEncryptedKey,
    accessSource: password.passwordEncryptedKey ? 'individual-share' : 'vault',
    isNote: password.isNote,
    createdAt: password.createdAt.toISOString(),
    updatedAt: password.updatedAt.toISOString(),
  };
}
