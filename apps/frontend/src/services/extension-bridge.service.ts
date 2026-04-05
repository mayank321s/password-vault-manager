import {
  EXTENSION_CREDENTIALS_EVENT,
  EXTENSION_SESSION_EVENT,
  createChromiumAutofillPlan,
  createExtensionBackendContract,
  createExtensionSessionSnapshot,
  detectChromiumCredentialChange,
  toChromiumCredentialCandidate,
  toExtensionCredentialRecord,
  type ChromiumCredentialCandidate,
  type ChromiumFormFieldSnapshot,
  type ExtensionCredentialContent,
  type ExtensionCredentialRecord,
  type ExtensionSessionSnapshot,
} from '@repo/extension-core';
import { decryptVaultKey, decryptWithAES } from '@repo/crypto-utils';
import type { PasswordResponse } from '@repo/shared';
import type { SessionState } from '../types';
import { getSessionData } from '../lib/storage';
import {
  getPasswordDetails,
  getSharedWithMe,
  getUserVaults,
  getVaultPasswords,
} from './vault.service';
import { sessionManager } from './session.service';

export { EXTENSION_SESSION_EVENT };
export { EXTENSION_CREDENTIALS_EVENT };

export function getExtensionBackendContract() {
  return createExtensionBackendContract();
}

export function getExtensionCredentialRecord(
  password: PasswordResponse,
): ExtensionCredentialRecord {
  return toExtensionCredentialRecord(password);
}

export async function getExtensionSessionSnapshot(
  sessionState: SessionState,
): Promise<ExtensionSessionSnapshot> {
  const [userId, organizationId, organizationType] = await Promise.all([
    getSessionData('user_id'),
    getSessionData('active_organization_id'),
    getSessionData('active_organization_type'),
  ]);

  return createExtensionSessionSnapshot({
    sessionState,
    userId,
    organizationId,
    organizationType,
  });
}

export async function broadcastExtensionSessionSnapshot(
  sessionState: SessionState,
): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const snapshot = await getExtensionSessionSnapshot(sessionState);
  window.dispatchEvent(
    new CustomEvent<ExtensionSessionSnapshot>(EXTENSION_SESSION_EVENT, {
      detail: snapshot,
    }),
  );
}

export async function listExtensionCredentials(): Promise<
  ChromiumCredentialCandidate[]
> {
  const privateKey = await sessionManager.getPrivateKey();
  if (!privateKey) {
    throw new Error('Session is locked. Please unlock your session first.');
  }

  const [vaults, sharedPasswords] = await Promise.all([
    getUserVaults(),
    getSharedWithMe(),
  ]);

  const vaultCredentials = await Promise.all(
    vaults.map(async (vault) => {
      const passwords = await getAllVaultPasswordDetails(vault.id);
      return Promise.all(
        passwords.map((password) =>
          decryptExtensionCredential(
            password,
            vault.vaultEncryptedKey,
            privateKey,
          ),
        ),
      );
    }),
  );

  const sharedCredentials = await Promise.all(
    sharedPasswords.map(async (sharedPassword) => {
      const password = await getPasswordDetails(sharedPassword.passwordId);
      return decryptExtensionCredential(
        password,
        sharedPassword.passwordEncryptedKey,
        privateKey,
      );
    }),
  );

  const credentials = [...vaultCredentials.flat(), ...sharedCredentials].filter(
    (credential): credential is ChromiumCredentialCandidate =>
      credential !== null,
  );

  return dedupeExtensionCredentials(credentials);
}

export async function broadcastExtensionCredentialsLoaded(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const credentials = await listExtensionCredentials();
  window.dispatchEvent(
    new CustomEvent<ChromiumCredentialCandidate[]>(
      EXTENSION_CREDENTIALS_EVENT,
      {
        detail: credentials,
      },
    ),
  );
}

export async function getChromiumAutofillPlan(input: {
  readonly pageUrl: string;
  readonly fields: readonly ChromiumFormFieldSnapshot[];
}) {
  const credentials = await listExtensionCredentials();
  return createChromiumAutofillPlan({
    credentials,
    pageUrl: input.pageUrl,
    fields: input.fields,
  });
}

export async function detectChromiumCredentialPrompt(input: {
  readonly pageUrl: string;
  readonly submittedUsername?: string | null;
  readonly submittedPassword?: string | null;
}) {
  const credentials = await listExtensionCredentials();
  return detectChromiumCredentialChange({
    credentials,
    pageUrl: input.pageUrl,
    submittedUsername: input.submittedUsername,
    submittedPassword: input.submittedPassword,
  });
}

async function getAllVaultPasswordDetails(
  vaultId: string,
): Promise<PasswordResponse[]> {
  const firstPage = await getVaultPasswords(vaultId, {
    withEncryptedData: true,
    page: 1,
    limit: 200,
  });
  const totalPages = Math.max(1, Math.ceil(firstPage.total / firstPage.limit));
  const remainingPages =
    totalPages > 1
      ? await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            getVaultPasswords(vaultId, {
              withEncryptedData: true,
              page: index + 2,
              limit: 200,
            }),
          ),
        )
      : [];

  const passwordIds = [firstPage, ...remainingPages]
    .flatMap((page) => page.passwords)
    .filter((password) => !password.isNote)
    .map((password) => password.id);

  return Promise.all(passwordIds.map((passwordId) => getPasswordDetails(passwordId)));
}

async function decryptExtensionCredential(
  password: PasswordResponse,
  encryptedKey: string | undefined,
  privateKey: CryptoKey,
): Promise<ChromiumCredentialCandidate | null> {
  if (!encryptedKey || password.isNote) {
    return null;
  }

  const vaultKey = await decryptVaultKey(encryptedKey, privateKey);
  const content = (await decryptWithAES(
    password.encryptedData,
    vaultKey,
  )) as ExtensionCredentialContent;

  return toChromiumCredentialCandidate(
    toExtensionCredentialRecord(password),
    content,
  );
}

function dedupeExtensionCredentials(
  credentials: readonly ChromiumCredentialCandidate[],
): ChromiumCredentialCandidate[] {
  const deduped = new Map<string, ChromiumCredentialCandidate>();

  for (const credential of credentials) {
    const existing = deduped.get(credential.passwordId);
    if (!existing || existing.accessSource === 'individual-share') {
      deduped.set(credential.passwordId, credential);
    }
  }

  return [...deduped.values()];
}
