import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { importSymmetricKey, decryptWithAES } from '@repo/crypto-utils';
import { CreatePasswordContent } from '../../types/password.types';
import { copyToClipboard } from '../../utils/password-utils';
import { ShareLinkData, CopyState } from './types';

export function useShareLinkViewPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();

  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [decryptedData, setDecryptedData] =
    useState<CreatePasswordContent | null>(null);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>({});
  const [viewed, setViewed] = useState(false);

  useEffect(() => {
    const fragment = window.location.hash.slice(1);
    if (fragment) {
      setEncryptionKey(fragment);
    } else {
      setDecryptionError('Encryption key missing from URL');
    }
  }, []);

  const {
    data: shareData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['share-link', shareId],
    queryFn: async () => {
      if (!shareId) {
        throw new Error('Share ID is required');
      }

      const response = await apiClient.get<ShareLinkData>(
        `/api/v1/passwords/share/${shareId}`,
      );

      return response.data;
    },
    enabled: !!shareId && !!encryptionKey,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const decryptPassword = async () => {
    if (!shareData || !encryptionKey) return;

    try {
      const symmetricKey = await importSymmetricKey(encryptionKey);
      const decrypted = await decryptWithAES(
        shareData.encryptedBlob,
        symmetricKey,
      );

      setDecryptedData(decrypted as CreatePasswordContent);
      setViewed(true);
    } catch (err) {
      console.error('Failed to decrypt shared password:', err);
      setDecryptionError(
        'Failed to decrypt password. The link may be invalid or corrupted.',
      );
    }
  };

  useEffect(() => {
    if (shareData && encryptionKey && !decryptedData && !decryptionError) {
      decryptPassword();
    }
  }, [shareData, encryptionKey]);

  const handleCopy = async (field: string, value: string) => {
    const success = await copyToClipboard(value);

    if (success) {
      setCopyState((prev) => ({ ...prev, [field]: true }));
      setTimeout(() => {
        setCopyState((prev) => ({ ...prev, [field]: false }));
      }, 2000);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const getErrorInfo = () => {
    const errorMessage =
      decryptionError ||
      (error instanceof Error
        ? error.message
        : 'Failed to load shared password');

    let errorTitle = 'Link Invalid';
    let errorDetail = errorMessage;

    if (errorMessage.includes('expired')) {
      errorTitle = 'Link Expired';
      errorDetail = 'This share link has expired and can no longer be used.';
    } else if (
      errorMessage.includes('not found') ||
      errorMessage.includes('already used')
    ) {
      errorTitle = 'Link Not Available';
      errorDetail =
        'This share link has already been used or does not exist. One-time share links can only be viewed once.';
    } else if (errorMessage.includes('key missing')) {
      errorTitle = 'Invalid Link';
      errorDetail =
        'This share link is incomplete. Make sure you copied the entire URL including the part after the # symbol.';
    }

    return { errorTitle, errorDetail };
  };

  return {
    shareId,
    shareData,
    isLoading,
    error,
    encryptionKey,
    decryptedData,
    decryptionError,
    copyState,
    viewed,
    handleCopy,
    handleGoHome,
    getErrorInfo,
  };
}
