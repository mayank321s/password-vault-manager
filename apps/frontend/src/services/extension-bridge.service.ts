import {
  EXTENSION_SESSION_EVENT,
  createExtensionBackendContract,
  createExtensionSessionSnapshot,
  toExtensionCredentialRecord,
  type ExtensionCredentialRecord,
  type ExtensionSessionSnapshot,
} from '@repo/extension-core';
import type { PasswordResponse } from '@repo/shared';
import type { SessionState } from '../types';
import { getSessionData } from '../lib/storage';

export { EXTENSION_SESSION_EVENT };

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
