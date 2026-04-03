import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserSearchResponse } from '@repo/shared';
import { decryptVaultKey, decryptWithAES } from '@repo/crypto-utils';
import { sessionManager } from '../../services/session.service';
import { getCurrentUser } from '../../services/auth.service';
import {
  useGrantPasswordPermission,
  usePasswordPermissions,
  useRevokePasswordPermission,
  useSearchUsers,
} from '../../hooks';
import type {
  DecryptedContent,
  PasswordDetailPanelProps,
  ShareFormState,
} from './password-detail-panel.type';

const INITIAL_SHARE_FORM: ShareFormState = {
  email: '',
  selectedUserId: undefined,
  publicKey: '',
};

export function usePasswordDetailPanel({
  passwordDetail,
  vault,
  onCopy,
  onEdit,
}: PasswordDetailPanelProps) {
  const navigate = useNavigate();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [decryptedContent, setDecryptedContent] =
    useState<DecryptedContent | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [sharingOpen, setSharingOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Share form state
  const [isShareFormOpen, setIsShareFormOpen] = useState(false);
  const [isShareLinkModalOpen, setIsShareLinkModalOpen] = useState(false);
  const openShareLinkModal = () => setIsShareLinkModalOpen(true);
  const closeShareLinkModal = () => setIsShareLinkModalOpen(false);
  const [shareForm, setShareForm] =
    useState<ShareFormState>(INITIAL_SHARE_FORM);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSearchQuery, setShareSearchQuery] = useState('');
  const [shareDebouncedQuery, setShareDebouncedQuery] = useState('');
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const shareDropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Load current user ID once on mount
  useEffect(() => {
    getCurrentUser().then((u) => setCurrentUserId(u?.userId ?? null));
  }, []);

  // Permission hooks — lazy-loaded when sharing section is open
  const passwordId = passwordDetail?.id ?? '';
  const { data: permissions, isLoading: permissionsLoading } =
    usePasswordPermissions(passwordId, sharingOpen);
  const grantMutation = useGrantPasswordPermission(passwordId);
  const revokeMutation = useRevokePasswordPermission(passwordId);

  // Debounce user search
  useEffect(() => {
    const timer = setTimeout(
      () => setShareDebouncedQuery(shareSearchQuery),
      800,
    );
    return () => clearTimeout(timer);
  }, [shareSearchQuery]);

  const { data: shareSuggestions } = useSearchUsers(
    shareDebouncedQuery,
    vault?.id ?? '',
  );

  useEffect(() => {
    if (!passwordDetail || (!vault && !passwordDetail.passwordEncryptedKey)) {
      setDecryptedContent(null);
      setDecryptError(null);
      return;
    }

    let cancelled = false;
    setIsDecrypting(true);
    setDecryptError(null);
    setDecryptedContent(null);

    const decrypt = async () => {
      try {
        const privateKey = await sessionManager.getPrivateKey();
        if (!privateKey) {
          throw new Error('Session is locked — unlock to view password.');
        }
        const encryptedKey =
          passwordDetail.passwordEncryptedKey ?? vault?.vaultEncryptedKey;

        if (!encryptedKey) {
          throw new Error('No encrypted key available for decryption.');
        }
        const vaultKey = await decryptVaultKey(encryptedKey, privateKey);
        const content = await decryptWithAES(
          passwordDetail.encryptedData,
          vaultKey,
        );
        if (!cancelled) {
          setDecryptedContent(content as DecryptedContent);
        }
      } catch (e) {
        console.error('Decryption error:', e);
        if (!cancelled) {
          setDecryptError((e as Error).message ?? 'Failed to decrypt.');
        }
      } finally {
        if (!cancelled) {
          setIsDecrypting(false);
        }
      }
    };

    decrypt();

    return () => {
      cancelled = true;
    };
    // Re-run whenever the selected password or vault changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    passwordDetail?.id,
    vault?.id,
    passwordDetail?.passwordEncryptedKey,
    passwordDetail?.encryptedData,
    passwordDetail?.name,
    passwordDetail?.updatedAt,
  ]);

  const handleCopy = (value: string, fieldKey: string) => {
    onCopy(value);
    setCopiedField(fieldKey);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      setCopiedField((c) => (c === fieldKey ? null : c));
    }, 2000);
  };

  const handleEdit = () => {
    if (!passwordDetail || !decryptedContent) return;
    if (decryptedContent.type === 'note') {
      onEdit({
        id: passwordDetail.id,
        name: passwordDetail.name,
        isNote: true,
        noteContent: decryptedContent.content,
      });
    } else {
      onEdit({
        id: passwordDetail.id,
        name: passwordDetail.name,
        isNote: false,
        fields: decryptedContent.fields.map(({ label, value }) => ({
          label,
          value,
        })),
      });
    }
  };

  // ── Share form handlers ──

  const resetShareForm = () => {
    setShareForm(INITIAL_SHARE_FORM);
    setShareError(null);
    setShareSearchQuery('');
    setShareDebouncedQuery('');
    setShareDropdownOpen(false);
  };

  const toggleShareForm = () => {
    setIsShareFormOpen((prev) => {
      if (prev) resetShareForm();
      return !prev;
    });
  };

  const closeShareForm = () => {
    setIsShareFormOpen(false);
    resetShareForm();
  };

  const onShareSearchChange = (value: string) => {
    setShareSearchQuery(value);
    setShareDropdownOpen(value.trim().length >= 2);
    setShareForm({ ...shareForm, email: value, selectedUserId: undefined });
  };

  const onShareSearchFocus = () => {
    if (shareDropdownTimerRef.current)
      clearTimeout(shareDropdownTimerRef.current);
    if (shareSearchQuery.trim().length >= 2) setShareDropdownOpen(true);
  };

  const onShareSearchBlur = () => {
    shareDropdownTimerRef.current = setTimeout(
      () => setShareDropdownOpen(false),
      150,
    );
  };

  const onShareSelectUser = (user: UserSearchResponse['users'][number]) => {
    setShareSearchQuery(user.email);
    setShareDropdownOpen(false);
    setShareForm({
      ...shareForm,
      email: user.email,
      selectedUserId: user.id,
      publicKey: user.publicKey,
    });
  };

  const handleShare = () => {
    if (!shareForm.selectedUserId) {
      setShareError('Please select a user from the suggestions.');
      return;
    }
    if (!vault) {
      setShareError('Vault information is unavailable.');
      return;
    }
    if (!passwordDetail) {
      setShareError('Password data unavailable.');
      return;
    }
    setShareError(null);

    grantMutation.mutate(
      {
        userEmail: shareForm.email.trim(),
        recipientPublicKey: shareForm.publicKey,
        vaultEncryptedKey: vault.vaultEncryptedKey,
        passwordEncryptedData: passwordDetail.encryptedData,
      },
      {
        onSuccess: () => closeShareForm(),
        onError: (err) => setShareError(err.message),
      },
    );
  };

  const handleRevoke = (userId: string) => {
    revokeMutation.mutate({ userId });
  };

  const handleDelete = () => {
    if (!passwordDetail) return;
    setIsDeleteDialogOpen(true);
  };

  return {
    closeShareForm,
    closeShareLinkModal,
    copiedField,
    currentUserId,
    decryptError,
    decryptedContent,
    detailsOpen,
    grantMutation,
    handleCopy,
    handleDelete,
    handleEdit,
    handleRevoke,
    handleShare,
    isDecrypting,
    isDeleteDialogOpen,
    isShareFormOpen,
    isShareLinkModalOpen,
    navigate,
    onShareSearchBlur,
    onShareSearchChange,
    onShareSearchFocus,
    onShareSelectUser,
    openShareLinkModal,
    permissions,
    permissionsLoading,
    revokeMutation,
    setDetailsOpen,
    setIsDeleteDialogOpen,
    setSharingOpen,
    shareDropdownOpen,
    shareError,
    shareForm,
    shareSearchQuery,
    shareSuggestions,
    sharingOpen,
    toggleShareForm,
  };
}
