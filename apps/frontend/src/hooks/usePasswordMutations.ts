import type {
  CreatePasswordRequest,
  GrantPasswordPermissionRequest,
  PasswordResponse,
  UpdatePasswordRequest,
  passwordPermissionResponse,
} from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_V1_ROUTES, passwordKeys, vaultKeys } from '../common/constants';
import { apiClient } from '../lib/api-client';
import {
  decryptVaultKey,
  decryptWithAES,
  encryptVaultKey,
  encryptWithAES,
  generateSymmetricKey,
  importPublicKey,
} from '@repo/crypto-utils';
import { sessionManager } from '../services/session.service';
import {
  getPasswordPermissions,
  grantPasswordPermission,
  refreshPasswordShares,
  revokePasswordPermission,
} from '../services/vault.service';
import {
  CreatePasswordVars,
  UpdatePasswordVars,
} from '../types/password.types';

export function useCreatePassword(vaultId: string) {
  const queryClient = useQueryClient();

  return useMutation<PasswordResponse, Error, CreatePasswordVars>({
    mutationFn: async ({ vault, content }) => {
      const privateKey = await sessionManager.getPrivateKey();
      if (!privateKey) {
        throw new Error('Session is locked. Please unlock your session first.');
      }

      const vaultKey = await decryptVaultKey(
        vault.vaultEncryptedKey,
        privateKey,
      );

      const request: CreatePasswordRequest = {
        name: content.name,
        encryptedData: await encryptWithAES(content, vaultKey),
        vaultId,
        isNote: content.type === 'note',
      };
      const response = await apiClient.post<PasswordResponse>(
        API_V1_ROUTES.password.create,
        request,
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.passwords(vaultId) });
    },
  });
}

export function useUpdatePassword(vaultId: string) {
  const queryClient = useQueryClient();

  return useMutation<PasswordResponse, Error, UpdatePasswordVars>({
    mutationFn: async ({ passwordId, vault, content }) => {
      const privateKey = await sessionManager.getPrivateKey();
      if (!privateKey) {
        throw new Error('Session is locked. Please unlock your session first.');
      }

      const vaultKey = await decryptVaultKey(
        vault.vaultEncryptedKey,
        privateKey,
      );

      const request: UpdatePasswordRequest = {
        name: content.name,
        encryptedData: await encryptWithAES(content, vaultKey),
        isNote: content.type === 'note',
      };
      const response = await apiClient.patch<PasswordResponse>(
        API_V1_ROUTES.password.update(passwordId),
        request,
      );

      // Refresh encrypted copies for all individual share recipients so they
      // always hold the latest version of the password.
      const permissions = await getPasswordPermissions(passwordId);
      const recipientsWithKey = permissions.filter(
        (perm) => !!perm.recipientPublicKey,
      );

      if (recipientsWithKey.length > 0) {
        const shares = await Promise.all(
          recipientsWithKey.map(async (perm) => {
            const shareKey = await generateSymmetricKey();
            const shareEncryptedData = await encryptWithAES(content, shareKey);
            const recipientCryptoKey = await importPublicKey(
              perm.recipientPublicKey!,
            );
            const passwordEncryptedKey = await encryptVaultKey(
              shareKey,
              recipientCryptoKey,
            );
            return {
              userId: perm.userId,
              passwordEncryptedKey,
              encryptedData: shareEncryptedData,
            };
          }),
        );
        await refreshPasswordShares(passwordId, { shares });
      }

      return response.data;
    },
    onSuccess: (_, { passwordId }) => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.passwords(vaultId) });
      queryClient.invalidateQueries({
        queryKey: passwordKeys.details(passwordId),
      });
    },
  });
}

/**
 * Grant individual (viewer) access to a password.
 *
 * Zero-knowledge flow:
 * 1. Decrypt vault key with the granter's private key
 * 2. Decrypt the original password data with the vault key
 * 3. Generate a fresh AES-256 key specific to this share
 * 4. Re-encrypt the password data with the share key
 * 5. Encrypt the share key with the recipient's RSA public key
 *
 * The recipient gets their own encrypted copy of the data and a key that
 * only unlocks that copy — the vault key is never exposed to them.
 */
export function useGrantPasswordPermission(passwordId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    passwordPermissionResponse,
    Error,
    {
      userEmail: string;
      recipientPublicKey: string;
      vaultEncryptedKey: string;
      passwordEncryptedData: string;
    }
  >({
    mutationFn: async ({
      userEmail,
      recipientPublicKey,
      vaultEncryptedKey,
      passwordEncryptedData,
    }) => {
      const privateKey = await sessionManager.getPrivateKey();
      if (!privateKey) {
        throw new Error('Session is locked. Please unlock your session first.');
      }

      // 1. Decrypt vault key with granter's private key
      const vaultKey = await decryptVaultKey(vaultEncryptedKey, privateKey);

      // 2. Decrypt the password data
      const decryptedContent = await decryptWithAES(
        passwordEncryptedData,
        vaultKey,
      );

      // 3. Generate a fresh AES-256 key for this share
      const shareKey = await generateSymmetricKey();

      // 4. Re-encrypt the password data with the share key
      const shareEncryptedData = await encryptWithAES(
        decryptedContent,
        shareKey,
      );

      // 5. Encrypt the share key with the recipient's RSA public key
      const recipientPublicCryptoKey =
        await importPublicKey(recipientPublicKey);
      const passwordEncryptedKey = await encryptVaultKey(
        shareKey,
        recipientPublicCryptoKey,
      );

      const request: GrantPasswordPermissionRequest = {
        userEmail,
        passwordEncryptedKey,
        encryptedData: shareEncryptedData,
      };

      return grantPasswordPermission(passwordId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: passwordKeys.permissions(passwordId),
      });
    },
  });
}

/**
 * Revoke individual access to a password.
 */
export function useRevokePasswordPermission(passwordId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, { userId: string }>({
    mutationFn: ({ userId }) => revokePasswordPermission(passwordId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: passwordKeys.permissions(passwordId),
      });
    },
  });
}

/**
 * Delete a password. Only the creator is permitted — enforced on the backend.
 */
export function useDeletePassword(vaultId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (passwordId: string) =>
      apiClient
        .delete<{ success: boolean }>(API_V1_ROUTES.password.delete(passwordId))
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.passwords(vaultId) });
    },
  });
}
