import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { API_V1_ROUTES } from '../../common/constants';
import { apiClient } from '../../lib/api-client';
import {
  decryptVaultKey,
  decryptWithAES,
  generateSymmetricKey,
  encryptWithAES,
  exportSymmetricKey,
} from '@repo/crypto-utils';
import { useSession } from '../../contexts/SessionContext';
import { copyToClipboard } from '../../utils/password-utils';
import { sessionManager } from '../../services/session.service';
import type {
  CreateShareLinkModalProps,
  CreateShareLinkRequest,
  CreateShareLinkResponse,
  ProgressState,
} from './create-share-link-modal.type';

export const useCreateShareLinkModal = ({
  password,
  encryptedVaultKey,
  onClose,
}: Omit<CreateShareLinkModalProps, 'isOpen'>) => {
  const { requestUnlock } = useSession();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createLinkMutation = useMutation({
    mutationFn: async () => {
      setError(null);
      if (!password) {
        throw new Error('No password selected');
      }

      setProgress({ stage: 'Preparing encryption...', percentage: 10 });

      const unlocked = await requestUnlock();
      if (!unlocked) {
        throw new Error('Session unlock required');
      }

      setProgress({ stage: 'Retrieving private key...', percentage: 20 });

      const privateKey = await sessionManager.getPrivateKey();
      if (!privateKey) {
        throw new Error('Failed to retrieve private key');
      }

      setProgress({ stage: 'Decrypting vault key...', percentage: 30 });

      const vaultKey = await decryptVaultKey(encryptedVaultKey, privateKey);

      setProgress({ stage: 'Decrypting password...', percentage: 40 });

      const passwordData = await decryptWithAES(
        password.encryptedData,
        vaultKey,
      );

      setProgress({ stage: 'Generating share key...', percentage: 50 });

      const shareKey = await generateSymmetricKey();

      setProgress({ stage: 'Encrypting with share key...', percentage: 60 });

      const encryptedForShare = await encryptWithAES(passwordData, shareKey);

      setProgress({ stage: 'Creating share link...', percentage: 70 });

      const request: CreateShareLinkRequest = {
        encryptedBlob: encryptedForShare,
        expirationHours: 24,
      };

      const response = await apiClient.post<CreateShareLinkResponse>(
        API_V1_ROUTES.password.share(password.id),
        request,
      );

      setProgress({ stage: 'Generating URL...', percentage: 90 });

      const exportedKey = await exportSymmetricKey(shareKey);
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/share/${response.data.shareId}#${exportedKey}`;

      setShareUrl(url);
      setProgress(null);

      return url;
    },
    onError: (err) => {
      console.error('Failed to create share link:', err);
      setError(
        (err as Error).message ??
          'Failed to create share link. Please try again.',
      );
      setProgress(null);
    },
  });

  const handleCreateLink = () => {
    createLinkMutation.mutate();
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (!createLinkMutation.isPending) {
      setShareUrl(null);
      setCopied(false);
      setProgress(null);
      setError(null);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !createLinkMutation.isPending) {
      handleClose();
    }
  };

  return {
    shareUrl,
    copied,
    error,
    progress,
    createLinkMutation,
    handleCreateLink,
    handleCopyLink,
    handleClose,
    handleKeyDown,
  };
};
