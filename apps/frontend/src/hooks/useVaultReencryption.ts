/**
 * useVaultReencryption Hook
 * Manages vault re-encryption operations with progress tracking
 */

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  removeMemberWithReEncryption,
  performVaultKeyRotation,
} from '../services/vault.service';
import { ReEncryptionProgress } from '../types';
import { SuccessResponse } from '@repo/shared';

interface UseVaultReencryptionState {
  isLoading: boolean;
  progress: ReEncryptionProgress | null;
  error: string | null;
  result: SuccessResponse | null;
}

interface UseVaultReencryptionReturn extends UseVaultReencryptionState {
  removeMember: (vaultId: string, memberId: string) => Promise<SuccessResponse>;
  rotateKeys: (vaultId: string) => Promise<SuccessResponse>;
  reset: () => void;
}

/**
 * Hook for managing vault re-encryption operations
 */
export function useVaultReencryption(): UseVaultReencryptionReturn {
  const queryClient = useQueryClient();
  const [state, setState] = useState<UseVaultReencryptionState>({
    isLoading: false,
    progress: null,
    error: null,
    result: null,
  });

  const handleProgress = useCallback((progress: ReEncryptionProgress) => {
    setState((prev) => ({
      ...prev,
      progress,
    }));
  }, []);

  const removeMember = useCallback(
    async (vaultId: string, memberId: string): Promise<SuccessResponse> => {
      setState({
        isLoading: true,
        progress: null,
        error: null,
        result: null,
      });

      try {
        const result = await removeMemberWithReEncryption(
          vaultId,
          memberId,
          queryClient,
          handleProgress,
        );

        setState({
          isLoading: false,
          progress: {
            current: 100,
            total: 100,
            stage: 'Complete',
            percentage: 100,
          },
          error: null,
          result,
        });

        return result;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to remove member with re-encryption';

        setState({
          isLoading: false,
          progress: null,
          error: errorMessage,
          result: null,
        });

        throw error;
      }
    },
    [handleProgress],
  );

  const rotateKeys = useCallback(
    async (vaultId: string): Promise<SuccessResponse> => {
      setState({
        isLoading: true,
        progress: null,
        error: null,
        result: null,
      });

      try {
        const result = await performVaultKeyRotation(
          vaultId,
          queryClient,
          handleProgress,
        );

        setState({
          isLoading: false,
          progress: {
            current: 100,
            total: 100,
            stage: 'Complete',
            percentage: 100,
          },
          error: null,
          result,
        });

        return result;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to rotate vault keys';

        setState({
          isLoading: false,
          progress: null,
          error: errorMessage,
          result: null,
        });

        throw error;
      }
    },
    [handleProgress],
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: null,
      error: null,
      result: null,
    });
  }, []);

  return {
    ...state,
    removeMember,
    rotateKeys,
    reset,
  };
}
