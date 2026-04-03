import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateVaultRequest, UpdateVaultRequest } from '@repo/shared';
import { vaultKeys } from '../common/constants/query-keys';
import {
  decryptVaultKey,
  encryptVaultKey,
  generateSymmetricKey,
  importPublicKey,
} from '@repo/crypto-utils';
import { getUserKeys } from '../lib/storage';
import { sessionManager } from '../services/session.service';
import {
  addVaultMember,
  createVault,
  deleteVault,
  updateVault,
  updateVaultMemberRole,
} from '../services/vault.service';

/**
 * Update the role of a vault member
 */
export function useUpdateMemberRole(vaultId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: 'manager' | 'team_member';
    }) => updateVaultMemberRole(vaultId, memberId, { userRole: role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.members(vaultId) });
    },
  });
}

/**
 * Add a member to a vault.
 * Fetches the user's public key then calls addVaultMember.
 */
export function useAddMember(vaultId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      publicKey,
      vaultEncryptedKey,
      role,
    }: {
      email: string;
      publicKey: string;
      vaultEncryptedKey: string;
      role: 'manager' | 'team_member';
    }) => {
      const privateKey = await sessionManager.getPrivateKey();
      if (!privateKey) {
        throw new Error('Private key not available. Please log in again.');
      }

      const vaultKey = await decryptVaultKey(vaultEncryptedKey, privateKey);
      const vaultEncryptedKeyForNewMember = await encryptVaultKey(
        vaultKey,
        await importPublicKey(publicKey),
      );

      return addVaultMember(vaultId, {
        userEmail: email,
        userRole: role,
        vaultEncryptedKey: vaultEncryptedKeyForNewMember,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.members(vaultId) });
      queryClient.invalidateQueries({ queryKey: vaultKeys.lists });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

/**
 * Create a new vault.
 * Generates a vault key client-side, encrypts it with the user's public key,
 * then posts to the API. Accepts an optional progress callback.
 */
export function useCreateVault(
  onProgress?: (stage: string, percent: number) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      onProgress?.('Generating encryption keys...', 20);
      const vaultKey = await generateSymmetricKey();

      onProgress?.('Retrieving your public key...', 40);
      const userKeys = await getUserKeys();
      if (!userKeys) {
        throw new Error('User keys not found. Please log in again.');
      }

      onProgress?.('Importing public key...', 50);
      const publicKey = await importPublicKey(userKeys.publicKey);

      onProgress?.('Encrypting vault key...', 70);
      const vaultEncryptedKey = await encryptVaultKey(vaultKey, publicKey);

      onProgress?.('Creating vault...', 85);
      const request: CreateVaultRequest = {
        name: name.trim(),
        vaultEncryptedKey,
      };
      const response = await createVault(request);

      onProgress?.('Complete!', 100);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.lists });
    },
  });
}

// TODO: use this later to update vault name
// /**
//  * Update vault name
//  */
export function useUpdateVault(vaultId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateVaultRequest) => updateVault(vaultId, request),
    onSuccess: () => {
      // Invalidate vault detail and list
      queryClient.invalidateQueries({ queryKey: vaultKeys.detail(vaultId) });
      queryClient.invalidateQueries({ queryKey: vaultKeys.lists });
    },
  });
}

/**
 * Delete vault
 */
export function useDeleteVault() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vaultId: string) => deleteVault(vaultId),
    onSuccess: () => {
      // Invalidate vaults list
      queryClient.invalidateQueries({ queryKey: vaultKeys.lists });
    },
  });
}
