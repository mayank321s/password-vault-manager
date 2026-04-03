/**
 * Vault Service
 * Handles all vault operations including member management and re-encryption.
 *
 * SECURITY: Vault keys are NEVER stored locally. Every operation that requires
 * the vault key fetches the RSA-encrypted copy from the server and decrypts it
 * on-the-fly using the user's RSA private key held in memory by SessionManager.
 */

import {
  AddVaultMemberRequest,
  CreateVaultRequest,
  GetVaultPasswordsQuery,
  GetVaultPasswordsResponse,
  GrantPasswordPermissionRequest,
  PasswordResponse,
  RefreshPasswordSharesRequest,
  RotateVaultKeyRequest,
  SharedPasswordItem,
  SuccessResponse,
  UpdateVaultMemberRoleRequest,
  UpdateVaultRequest,
  VaultDetailResponse,
  VaultMemberResponse,
  VaultResponse,
  passwordPermissionResponse,
} from '@repo/shared';
import { QueryClient } from '@tanstack/react-query';
import { API_V1_ROUTES } from '../common/constants/api-routes';
import { vaultKeys } from '../common/constants/query-keys';
import { apiClient } from '../lib/api-client';
import {
  decryptVaultKey,
  decryptWithAES,
  encryptWithAES,
  encryptWithPublicKey,
  exportVaultKey,
  generateSymmetricKey,
  importPublicKey,
} from '@repo/crypto-utils';
import { ReEncryptionError, ReEncryptionProgress, VaultError } from '../types';
import { sessionManager } from './session.service';
import { BatchProgressInfo } from '../pages/vaults/types';

/**
 * Resolve the current user's RSA-encrypted vault key.
 *
 * Cache-first: reads from the React Query vaults-list cache when a QueryClient
 * is provided. Falls back to a direct API request if the vault is not cached.
 */
async function resolveEncryptedVaultKey(
  vaultId: string,
  queryClient: QueryClient,
): Promise<string> {
  const cached = queryClient.getQueryData<VaultDetailResponse[]>(
    vaultKeys.lists,
  );
  const vault = cached?.find((v) => v.id === vaultId);
  if (vault?.vaultEncryptedKey) {
    return vault.vaultEncryptedKey;
  }

  throw new Error(
    'Vault key not found in cache. Please refresh your vault list and try again.',
  );
}

/**
 * Resolve vault members.
 *
 * Cache-first: reads from the React Query members cache when available.
 * Falls back to a direct API request if not cached.
 * Each member object already includes their RSA public key.
 */
async function resolveVaultMembers(
  vaultId: string,
  queryClient: QueryClient,
): Promise<VaultMemberResponse> {
  const cached = queryClient.getQueryData<VaultMemberResponse>(
    vaultKeys.members(vaultId),
  );
  if (cached) {
    return cached;
  }
  return getVaultMembers(vaultId);
}

/**
 * Derive the decrypted AES vault key for a vault.
 *
 * Flow: server-side RSA ciphertext → sessionManager.getPrivateKey() → decryptVaultKey()
 *
 * The resulting CryptoKey is ephemeral and must never be persisted.
 *
 * @throws ReEncryptionError if the session is locked or the server returns no key
 */
async function getDecryptedVaultKey(
  vaultId: string,
  queryClient: QueryClient,
): Promise<CryptoKey> {
  const [encryptedVaultKey, privateKey] = await Promise.all([
    resolveEncryptedVaultKey(vaultId, queryClient),
    sessionManager.getPrivateKey(),
  ]);

  if (!privateKey) {
    throw new ReEncryptionError(
      'Private key is not available. Please unlock your session first.',
      'decrypt-private-key',
    );
  }

  return decryptVaultKey(encryptedVaultKey, privateKey);
}

// ============================================
// Basic vault operations
// ============================================

/**
 * Fetch all vaults for the current user.
 */
export async function getUserVaults(): Promise<VaultDetailResponse[]> {
  try {
    const response = await apiClient.get<VaultDetailResponse[]>(
      API_V1_ROUTES.vault.getAll,
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to fetch vaults',
      'FETCH_VAULTS_ERROR',
      err.statusCode,
    );
  }
}

/**
 * Create a new vault.
 */
export async function createVault(
  request: CreateVaultRequest,
): Promise<VaultResponse> {
  try {
    const response = await apiClient.post<VaultResponse>(
      API_V1_ROUTES.vault.create,
      request,
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to create vault',
      'CREATE_VAULT_ERROR',
      err.statusCode,
    );
  }
}

/**
 * Get vault member list.
 */
export async function getVaultMembers(
  vaultId: string,
): Promise<VaultMemberResponse> {
  try {
    const response = await apiClient.get<VaultMemberResponse>(
      API_V1_ROUTES.vault.members.getAll(vaultId),
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to fetch vault members',
      'FETCH_VAULT_DETAILS_ERROR',
      err.statusCode,
    );
  }
}

/**
 * Update vault name.
 */
export async function updateVault(
  vaultId: string,
  request: UpdateVaultRequest,
): Promise<{ success: true }> {
  try {
    const response = await apiClient.patch<{ success: true }>(
      API_V1_ROUTES.vault.update(vaultId),
      request,
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to update vault',
      'UPDATE_VAULT_ERROR',
      err.statusCode,
    );
  }
}

/**
 * Delete vault.
 */
export async function deleteVault(vaultId: string): Promise<void> {
  try {
    await apiClient.delete(API_V1_ROUTES.vault.delete(vaultId));
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to delete vault',
      'DELETE_VAULT_ERROR',
      err.statusCode,
    );
  }
}

/**
 * Add a member to a vault.
 */
export async function addVaultMember(
  vaultId: string,
  request: AddVaultMemberRequest,
): Promise<SuccessResponse> {
  try {
    const response = await apiClient.post<SuccessResponse>(
      API_V1_ROUTES.vault.members.add(vaultId),
      request,
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to add vault member',
      'ADD_MEMBER_ERROR',
      err.statusCode,
    );
  }
}

/**
 * Update vault member role.
 */
export async function updateVaultMemberRole(
  vaultId: string,
  memberId: string,
  request: UpdateVaultMemberRoleRequest,
): Promise<SuccessResponse> {
  try {
    const response = await apiClient.patch<SuccessResponse>(
      API_V1_ROUTES.vault.members.update(vaultId, memberId),
      request,
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to update member role',
      'UPDATE_MEMBER_ROLE_ERROR',
      err.statusCode,
    );
  }
}

/**
 * Fetch a page of passwords in a vault.
 * Pass `withEncryptedData: true` to include ciphertext (required for re-encryption).
 */
export async function getVaultPasswords(
  vaultId: string,
  params?: GetVaultPasswordsQuery,
): Promise<GetVaultPasswordsResponse> {
  try {
    const stringifiedParams = Object.fromEntries(
      Object.entries(params ?? {}).map(([key, value]) => [key, String(value)]),
    );
    const searchParams = new URLSearchParams(stringifiedParams);

    const query = searchParams.toString();
    const url = `${API_V1_ROUTES.vault.password.getAll(vaultId)}${query ? `?${query}` : ''}`;
    const response = await apiClient.get<GetVaultPasswordsResponse>(url);
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to fetch vault passwords',
      'FETCH_PASSWORDS_ERROR',
      err.statusCode,
    );
  }
}

/**
 * Fetch a single password from a vault.
 */
export async function getPasswordDetails(
  passwordId: string,
): Promise<PasswordResponse> {
  try {
    const response = await apiClient.get<PasswordResponse>(
      API_V1_ROUTES.password.get(passwordId),
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to fetch password details',
      'FETCH_PASSWORDS_ERROR',
      err.statusCode,
    );
  }
}

/**
 * Rotate vault keys — calls the backend rotate-keys endpoint directly.
 * Use the higher-level helpers below for full client-side re-encryption flows.
 */
async function rotateVaultKeys(
  vaultId: string,
  request: RotateVaultKeyRequest,
): Promise<SuccessResponse> {
  try {
    const response = await apiClient.post<SuccessResponse>(
      API_V1_ROUTES.vault.rotateKeys(vaultId),
      request,
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to rotate vault keys',
      'ROTATE_KEYS_ERROR',
      err.statusCode,
    );
  }
}

// ============================================
// Re-encryption flows
// ============================================

const processBatch = async (
  batch: GetVaultPasswordsResponse,
  oldVaultKey: CryptoKey,
  newVaultKey: CryptoKey,
  reEncryptedPasswords: RotateVaultKeyRequest['reEncryptedPasswords'],
  total: number,
  onProgress?: (info: BatchProgressInfo) => void,
): Promise<void> => {
  for (const password of batch.passwords) {
    if (!password.encryptedData) {
      throw new ReEncryptionError(
        `Password "${password.name}" is missing encrypted data.`,
        'decrypt-private-key',
      );
    }
    const decrypted = await decryptWithAES(password.encryptedData, oldVaultKey);
    const encryptedData = await encryptWithAES(decrypted, newVaultKey);
    reEncryptedPasswords.push({
      passwordId: password.id,
      encryptedData,
      name: password.name,
    });
    onProgress?.({
      stage: `Re-encrypting passwords (${reEncryptedPasswords.length}/${total})...`,
      processedPasswords: reEncryptedPasswords.length,
      totalPasswords: total,
    });
  }
};

async function buildReEncryptionPayload(
  vaultId: string,
  oldVaultKey: CryptoKey,
  members: ReadonlyArray<{
    readonly userId: string;
    readonly publicKey: string;
  }>,
  onProgress?: (info: BatchProgressInfo) => void,
): Promise<{
  readonly memberKeys: RotateVaultKeyRequest['memberKeys'];
  readonly reEncryptedPasswords: RotateVaultKeyRequest['reEncryptedPasswords'];
}> {
  const BATCH_SIZE = 20;
  // Generate new vault key upfront so all batches encrypt to the same key.
  const newVaultKey = await generateSymmetricKey();
  const newVaultKeyRaw = await exportVaultKey(newVaultKey);

  // First batch also reveals the total password count.
  const firstBatch = await getVaultPasswords(vaultId, {
    withEncryptedData: true,
    page: 1,
    limit: BATCH_SIZE,
  });

  const total = firstBatch.total;
  const totalPages = Math.max(1, Math.ceil(total / BATCH_SIZE));
  const reEncryptedPasswords: RotateVaultKeyRequest['reEncryptedPasswords'] =
    [];

  await processBatch(
    firstBatch,
    oldVaultKey,
    newVaultKey,
    reEncryptedPasswords,
    total,
    onProgress,
  );

  for (let page = 2; page <= totalPages; page++) {
    const batch = await getVaultPasswords(vaultId, {
      withEncryptedData: true,
      page,
      limit: BATCH_SIZE,
    });
    await processBatch(
      batch,
      oldVaultKey,
      newVaultKey,
      reEncryptedPasswords,
      total,
      onProgress,
    );
  }

  onProgress?.({
    stage: 'Distributing new vault keys...',
    processedPasswords: total,
    totalPasswords: total,
  });

  // Encrypt new vault key for every remaining member.
  const memberKeys: RotateVaultKeyRequest['memberKeys'] = [];
  for (const member of members) {
    const memberPublicKey = await importPublicKey(member.publicKey);
    const vaultEncryptedKey = await encryptWithPublicKey(
      newVaultKeyRaw,
      memberPublicKey,
    );
    memberKeys.push({ userId: member.userId, vaultEncryptedKey });
  }

  return { memberKeys, reEncryptedPasswords };
}

/**
 * Remove a member from a vault with mandatory full re-encryption.
 *
 * This function performs the complete client-side re-encryption flow:
 *  1. Decrypt the vault key on-the-fly (from cache or server).
 *  2. Resolve vault members (from cache or server) and filter out the removed member.
 *  3. Fetch all vault passwords.
 *  4. Build each remaining member's RSA public key from the cached member data.
 *  5. Generate a new vault key and re-encrypt all passwords + distribute the
 *     new key to every remaining member.
 *  6. Send the re-encrypted payload to the backend (which atomically removes
 *     the member and applies the new key).
 *
 * @param vaultId    - The vault ID.
 * @param memberId   - The userId of the member to remove.
 * @param onProgress - Optional progress callback.
 */
export async function removeMemberWithReEncryption(
  vaultId: string,
  memberId: string,
  queryClient: QueryClient,
  onProgress?: (progress: ReEncryptionProgress) => void,
): Promise<SuccessResponse> {
  try {
    // Stage 1: Decrypt vault key on-the-fly (session must be unlocked)
    onProgress?.({
      current: 0,
      total: 100,
      stage: 'Decrypting vault key...',
      percentage: 0,
    });

    const vaultKey = await getDecryptedVaultKey(vaultId, queryClient);

    // Stage 2: Fetch vault member list and determine remaining members
    onProgress?.({
      current: 15,
      total: 100,
      stage: 'Fetching vault members...',
      percentage: 15,
    });

    const vaultDetails = await resolveVaultMembers(vaultId, queryClient);
    const remainingMembers = vaultDetails.members.filter(
      (member) => member.userId !== memberId,
    );

    if (remainingMembers.length === 0) {
      throw new ReEncryptionError(
        'Cannot remove the last member from a vault.',
        'validation',
      );
    }

    // Stage 3 + 4: Fetch all passwords in batches and re-encrypt with new vault key.
    // Progress is mapped to the 30–90 % overall range.
    onProgress?.({
      current: 30,
      total: 100,
      stage: 'Fetching vault passwords...',
      percentage: 30,
    });

    const memberPublicKeys = remainingMembers.map((member) => ({
      userId: member.userId,
      publicKey: member.publicKey,
    }));

    const reEncryptionData = await buildReEncryptionPayload(
      vaultId,
      vaultKey,
      memberPublicKeys,
      (info) => {
        const overallPercent =
          info.totalPasswords > 0
            ? 30 + (info.processedPasswords / info.totalPasswords) * 60
            : 90;
        onProgress?.({
          current: Math.round(overallPercent),
          total: 100,
          stage: info.stage,
          percentage: Math.round(overallPercent),
        });
      },
    );

    // Stage 5: Send the re-encryption payload to the backend
    onProgress?.({
      current: 90,
      total: 100,
      stage: 'Uploading re-encrypted data...',
      percentage: 90,
    });

    const rotateRequest: RotateVaultKeyRequest = {
      memberKeys: reEncryptionData.memberKeys,
      reEncryptedPasswords: reEncryptionData.reEncryptedPasswords,
    };

    const response = await apiClient.delete<SuccessResponse>(
      API_V1_ROUTES.vault.members.delete(vaultId, memberId),
      { data: rotateRequest },
    );

    onProgress?.({
      current: 100,
      total: 100,
      stage: 'Member removed successfully.',
      percentage: 100,
    });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: vaultKeys.members(vaultId) }),
      queryClient.invalidateQueries({ queryKey: vaultKeys.passwords(vaultId) }),
    ]);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof ReEncryptionError || error instanceof VaultError) {
      throw error;
    }
    const err = error as { message?: string };
    throw new ReEncryptionError(
      err.message ?? 'Failed to remove member with re-encryption.',
      'unknown',
    );
  }
}

/**
 * Perform a manual vault key rotation (without removing any member).
 *
 * Decrypts the current vault key on-the-fly, generates a new vault key,
 * re-encrypts all passwords, and distributes the new key to all members.
 *
 * @param vaultId    - The vault ID.
 * @param onProgress - Optional progress callback.
 */
export async function performVaultKeyRotation(
  vaultId: string,
  queryClient: QueryClient,
  onProgress?: (progress: ReEncryptionProgress) => void,
): Promise<SuccessResponse> {
  try {
    // Stage 1: Decrypt current vault key on-the-fly
    onProgress?.({
      current: 0,
      total: 100,
      stage: 'Decrypting vault key...',
      percentage: 0,
    });

    const vaultKey = await getDecryptedVaultKey(vaultId, queryClient);

    // Stage 2: Fetch vault members
    onProgress?.({
      current: 20,
      total: 100,
      stage: 'Fetching vault data...',
      percentage: 20,
    });

    const vaultDetails = await resolveVaultMembers(vaultId, queryClient);
    const memberPublicKeys = vaultDetails.members.map((member) => ({
      userId: member.userId,
      publicKey: member.publicKey,
    }));

    // Stage 3 + 4: Fetch all passwords in batches and re-encrypt with new vault key.
    // Progress is mapped to the 20–90 % overall range.
    const reEncryptionData = await buildReEncryptionPayload(
      vaultId,
      vaultKey,
      memberPublicKeys,
      (info) => {
        const overallPercent =
          info.totalPasswords > 0
            ? 20 + (info.processedPasswords / info.totalPasswords) * 70
            : 90;
        onProgress?.({
          current: Math.round(overallPercent),
          total: 100,
          stage: info.stage,
          percentage: Math.round(overallPercent),
        });
      },
    );

    // Stage 5: Send to backend
    onProgress?.({
      current: 90,
      total: 100,
      stage: 'Uploading re-encrypted data...',
      percentage: 90,
    });

    const response = await rotateVaultKeys(vaultId, {
      memberKeys: reEncryptionData.memberKeys,
      reEncryptedPasswords: reEncryptionData.reEncryptedPasswords,
    });

    onProgress?.({
      current: 100,
      total: 100,
      stage: 'Vault keys rotated successfully.',
      percentage: 100,
    });

    await queryClient.invalidateQueries({
      queryKey: vaultKeys.passwords(vaultId),
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof ReEncryptionError || error instanceof VaultError) {
      throw error;
    }
    const err = error as { message?: string };
    throw new ReEncryptionError(
      err.message ?? 'Failed to rotate vault keys.',
      'unknown',
    );
  }
}

// ============================================
// Password permission operations
// ============================================

/**
 * List all users with individual access to a password.
 */
export async function getPasswordPermissions(
  passwordId: string,
): Promise<passwordPermissionResponse[]> {
  try {
    const response = await apiClient.get<passwordPermissionResponse[]>(
      API_V1_ROUTES.password.permissions.list(passwordId),
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to fetch password permissions',
      'FETCH_PERMISSIONS_ERROR',
      err.statusCode,
    );
  }
}

/**
 * Grant individual access to a password.
 * `passwordEncryptedKey` must be the vault key re-encrypted with the
 * recipient's RSA public key — prepared by the caller.
 */
export async function grantPasswordPermission(
  passwordId: string,
  request: GrantPasswordPermissionRequest,
): Promise<passwordPermissionResponse> {
  try {
    const response = await apiClient.post<passwordPermissionResponse>(
      API_V1_ROUTES.password.permissions.grant(passwordId),
      request,
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to grant password permission',
      'GRANT_PERMISSION_ERROR',
      err.statusCode,
    );
  }
}

/**
 * Refresh encrypted share copies for all recipients after a password is edited.
 */
export async function refreshPasswordShares(
  passwordId: string,
  request: RefreshPasswordSharesRequest,
): Promise<{ success: boolean }> {
  try {
    const response = await apiClient.patch<{ success: boolean }>(
      API_V1_ROUTES.password.permissions.refresh(passwordId),
      request,
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to refresh password shares',
      'REFRESH_SHARES_ERROR',
      err.statusCode,
    );
  }
}

/**
 * Revoke individual access to a password.
 */
export async function revokePasswordPermission(
  passwordId: string,
  userId: string,
): Promise<{ success: boolean }> {
  try {
    const response = await apiClient.delete<{ success: boolean }>(
      API_V1_ROUTES.password.permissions.revoke(passwordId, userId),
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to revoke password permission',
      'REVOKE_PERMISSION_ERROR',
      err.statusCode,
    );
  }
}

/**
 * Fetch all passwords shared with the current user.
 */
export async function getSharedWithMe(): Promise<SharedPasswordItem[]> {
  try {
    const response = await apiClient.get<SharedPasswordItem[]>(
      API_V1_ROUTES.password.sharedWithMe,
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    throw new VaultError(
      err.message ?? 'Failed to fetch shared passwords',
      'FETCH_SHARED_ERROR',
      err.statusCode,
    );
  }
}
