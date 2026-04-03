import type { MouseEvent } from 'react';
import { useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  useGetVaultPasswords,
  useGetVaults,
  useSharedWithMe,
} from '../../hooks';
import type { PasswordFormInitialData } from '../../components/password-form-panel/password-form-panel.type';
import { DashboardMode } from './types';
import { useGetPasswordDetail } from '../../hooks/usePasswordQueries';
import { useState } from 'react';
import { copyToClipboardSecure } from '../../utils/password-utils';
import { SHARED_VAULT_ID } from '../../common/constants';

export function useVaultDashboardPage() {
  const navigate = useNavigate();
  const { vaultId, passwordId } = useParams<{
    vaultId?: string;
    passwordId?: string;
  }>();
  const [searchParams] = useSearchParams();

  const selectedVaultId = vaultId ?? '';
  const isSharedMode = selectedVaultId === SHARED_VAULT_ID;
  const mode =
    (searchParams.get('mode') as DashboardMode | null) ?? 'passwords';
  const selectedPasswordId = passwordId ?? null;

  const [passwordSearch, setPasswordSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingPassword, setIsCreatingPassword] = useState(false);
  const [editingPasswordData, setEditingPasswordData] =
    useState<PasswordFormInitialData | null>(null);
  const [revealedPasswordId, setRevealedPasswordId] = useState<string | null>(
    null,
  );

  const {
    data: vaults = [],
    isLoading: vaultsLoading,
    isError: vaultsError,
    refetch: refetchVaults,
  } = useGetVaults();

  const sortedVaults = useMemo(
    () =>
      [...vaults].sort((a, b) => {
        if (a.isPersonalVault && !b.isPersonalVault) return -1;
        if (!a.isPersonalVault && b.isPersonalVault) return 1;
        return a.name.localeCompare(b.name);
      }),
    [vaults],
  );

  useEffect(() => {
    if (sortedVaults.length > 0 && !selectedVaultId) {
      navigate(`/vaults/${sortedVaults[0]!.id}`, { replace: true });
    }
  }, [sortedVaults, selectedVaultId, navigate]);

  const selectedVault =
    sortedVaults.find((v) => v.id === selectedVaultId) ?? null;

  const {
    data: { passwords: vaultPasswords = [] } = {},
    isLoading: vaultPasswordsLoading,
    isError: vaultPasswordsError,
  } = useGetVaultPasswords(
    selectedVaultId,
    !isSharedMode && mode === 'passwords',
  );

  const { data: sharedItems = [], isLoading: sharedLoading } =
    useSharedWithMe(isSharedMode);

  // Map shared items to the same shape PasswordListColumn expects
  const sharedPasswords = useMemo(
    () =>
      sharedItems.map((item) => ({
        id: item.passwordId,
        name: item.passwordName,
        isNote: item.isNote,
      })),
    [sharedItems],
  );

  const rawPasswords = isSharedMode ? sharedPasswords : vaultPasswords;
  const passwordsLoading = isSharedMode ? sharedLoading : vaultPasswordsLoading;
  const passwordsError = isSharedMode ? false : vaultPasswordsError;

  const filteredPasswords = rawPasswords.filter((p) =>
    p.name.toLowerCase().includes(passwordSearch.toLowerCase()),
  );

  const { data: passwordDetail, isLoading: passwordDetailLoading } =
    useGetPasswordDetail(selectedPasswordId ?? '', true);

  // The SharedPasswordItem matching the currently selected password (for decryption key)
  const selectedSharedItem =
    isSharedMode && selectedPasswordId
      ? (sharedItems.find((item) => item.passwordId === selectedPasswordId) ??
        null)
      : null;

  const handleSelectVault = (id: string) => {
    navigate(`/vaults/${id}`);
    setPasswordSearch('');
    setRevealedPasswordId(null);
    setIsCreatingPassword(false);
  };

  const handleOpenSettings = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    navigate(`/vaults/${id}?mode=settings`);
    setRevealedPasswordId(null);
    setIsCreatingPassword(false);
  };

  const handleSelectPassword = (passId: string) => {
    navigate(`/vaults/${selectedVaultId}/password/${passId}`);
    setRevealedPasswordId(null);
    setIsCreatingPassword(false);
    setEditingPasswordData(null);
  };

  const handleToggleRevealPassword = (passId: string) => {
    setRevealedPasswordId((prev) => (prev === passId ? null : passId));
  };

  const handleCopyToClipboard = async (text: string) => {
    await copyToClipboardSecure(text);
  };

  const handleAddPassword = () => setIsCreatingPassword(true);
  const handleCloseCreatePassword = () => {
    setIsCreatingPassword(false);
    setEditingPasswordData(null);
  };
  const handleEditPassword = (data: PasswordFormInitialData) => {
    setEditingPasswordData(data);
    setIsCreatingPassword(true);
  };
  const handleDeletePassword = () => {
    navigate(`/vaults/${selectedVaultId}`);
  };

  return {
    handleAddPassword,
    handleCloseCreatePassword,
    handleCopyToClipboard,
    handleDeletePassword,
    handleEditPassword,
    handleOpenSettings,
    handleSelectPassword,
    handleSelectVault,
    handleToggleRevealPassword,
    isCreateModalOpen,
    isCreatingPassword,
    isSharedMode,
    editingPasswordData,
    mode,
    passwordDetail,
    passwordDetailLoading,
    passwords: filteredPasswords,
    passwordSearch,
    passwordsError,
    passwordsLoading,
    refetchVaults,
    revealedPasswordId,
    selectedPasswordId,
    selectedSharedItem,
    selectedVault,
    selectedVaultId,
    setIsCreateModalOpen,
    setPasswordSearch,
    vaults: sortedVaults,
    vaultsError,
    vaultsLoading,
  };
}
