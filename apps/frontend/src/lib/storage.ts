/**
 * Storage facade for the Zero-Knowledge Password Manager.
 *
 * All persistence is handled by the IndexedDB abstraction in `./indexed-db`.
 * This module owns the typed `SessionDataMap` and re-exports `UserKeyData`
 * so callers can keep their existing import paths.
 *
 * SECURITY NOTES:
 * - Private keys are ALWAYS stored encrypted (wrapped with seed-phrase-derived key)
 * - Vault keys are NEVER stored — they are always decrypted on-the-fly from the server
 * - All sensitive data is cleared on logout
 * - IndexedDB is origin-specific (same-origin policy applies)
 */

import { indexedDBService, UserKeyData } from './indexed-db';

export type { UserKeyData };

// ============================================
// Type Definitions
// ============================================

interface SessionDataMap {
  user_id: string;
  salt: string;
  user_email: string;
  user_username: string;
  jwt_token: string;
  active_organization_id: string;
  active_organization_type: string;
  organization_ids: string;
}

// ============================================
// User Keys Operations
// ============================================

/**
 * Save encrypted private key and public key to IndexedDB.
 *
 * @param userId              - Server user ID
 * @param encryptedPrivateKey - RSA private key wrapped with seed-phrase-derived wrapping key
 * @param encryptedSeedPhrase - BIP39 seed phrase encrypted with password-derived master key
 * @param publicKey           - PEM format public key
 */
export async function saveUserKeys(
  userId: string,
  encryptedPrivateKey: string,
  encryptedSeedPhrase: string,
  publicKey: string,
): Promise<void> {
  return indexedDBService.saveUserKeys({
    id: '1', // Single user per browser
    userId,
    encryptedPrivateKey,
    encryptedSeedPhrase,
    publicKey,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Get encrypted private key and public key from IndexedDB.
 *
 * @returns UserKeyData or null if not found
 */
export async function getUserKeys(): Promise<UserKeyData | null> {
  return indexedDBService.getUserKeys();
}

// ============================================
// Session Data Operations
// ============================================

/**
 * Save session data to IndexedDB.
 *
 * @param key       - Data key (typed to SessionDataMap)
 * @param value     - Data value
 * @param expiresAt - Optional expiration date
 */
export async function saveSessionData<K extends keyof SessionDataMap>(
  key: K,
  value: SessionDataMap[K],
  expiresAt?: Date,
): Promise<void> {
  return indexedDBService.saveSessionData(key, value, expiresAt?.getTime());
}

/**
 * Get session data from IndexedDB.
 * Returns null if not found or expired (expired entries are auto-deleted).
 *
 * @param key - Data key
 */
export async function getSessionData<K extends keyof SessionDataMap>(
  key: K,
): Promise<SessionDataMap[K] | null> {
  const value = await indexedDBService.getSessionData(key);
  // Cast is safe: values are always written via the typed saveSessionData above
  return value as SessionDataMap[K] | null;
}

// ============================================
// Bulk Operations
// ============================================

/**
 * Clear all cryptographic data from IndexedDB.
 *
 * CRITICAL SECURITY FUNCTION — called on logout.
 * Removes all keys and session information.
 */
export async function clearAllData(): Promise<void> {
  return indexedDBService.clearAllData();
}

/**
 * Clear auth tokens and identifiers, but keep crypto material for offline unlock.
 *
 * Called when the session locks:
 * - Clears jwt_token (prevents any API calls with the stale token)
 * - Clears user_id and user_username (not needed while locked)
 * - Preserves user_email so the unlock page can pre-fill it
 * - Preserves userKeys and salt so unlockSession() can verify the
 *   password offline and restore the in-memory session without a full re-login
 * - Also clears sessionStorage
 */
export async function clearAllExceptEmail(): Promise<void> {
  // Only clear auth tokens and identifiers.
  // `userKeys` (encrypted private key + seed phrase) and `salt` are intentionally
  // preserved so that unlockSession() can perform an offline password-verify
  // and restore the in-memory session without a full re-login.
  await Promise.all([
    indexedDBService.deleteSessionData('user_id'),
    indexedDBService.deleteSessionData('user_username'),
    indexedDBService.deleteSessionData('jwt_token'),
    indexedDBService.deleteSessionData('active_organization_id'),
    indexedDBService.deleteSessionData('active_organization_type'),
    indexedDBService.deleteSessionData('organization_ids'),
  ]);
  sessionStorage.clear();
}
