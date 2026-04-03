import { UserSearchResponse, VaultResponse } from '@repo/shared';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useAddMember,
  useSearchUsers,
  useUpdateMemberRole,
  useVaultMembersList,
} from '../../hooks';
import { useUserStore } from '../../lib/storage.hook';
import { DashboardMode } from '../../pages/vaults/types';
import { vaultKeys } from '../../common/constants/query-keys';
import type {
  AddMemberFormState,
  MemberFlags,
  VaultMember,
} from './vault-settings-panel.type';

export function useVaultSettingsPanel({ vault }: { vault: VaultResponse }) {
  const canManageMembers =
    vault.userRole === 'owner' || vault.userRole === 'manager';
  const isOwner = vault.userRole === 'owner';

  const navigate = useNavigate();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const openDeleteDialog = () => setIsDeleteDialogOpen(true);
  const closeDeleteDialog = () => setIsDeleteDialogOpen(false);
  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    navigate('/vaults');
  };

  const [addMemberForm, setAddMemberForm] = useState<AddMemberFormState>({
    email: '',
    role: 'team_member',
    publicKey: '',
  });
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  const user = useUserStore();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const closeDropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const addMemberMutation = useAddMember(vault.id);

  const [searchParams] = useSearchParams();

  const mode =
    (searchParams.get('mode') as DashboardMode | null) ?? 'passwords';

  const {
    data: members,
    isLoading: membersLoading,
    isError: membersError,
  } = useVaultMembersList(vault.id, mode === 'settings');

  // Debounce the search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: suggestions } = useSearchUsers(debouncedQuery, vault.id);

  const handleAddMember = () => {
    if (!addMemberForm.selectedUserId) {
      setAddMemberError('Please select a user from the suggestions');
      return;
    }
    setAddMemberError(null);

    addMemberMutation.mutate(
      {
        email: addMemberForm.email.trim(),
        role: addMemberForm.role,
        publicKey: addMemberForm.publicKey,
        vaultEncryptedKey: vault.vaultEncryptedKey,
      },
      {
        onSuccess: () => {
          setAddMemberForm({ email: '', role: 'team_member', publicKey: '' });
          setAddMemberError(null);
        },
        onError: (error) => {
          setAddMemberError(error.message);
        },
      },
    );
  };

  const toggleAddMember = () =>
    setIsAddMemberOpen((prev) => {
      if (prev) {
        resetSearch();
      }
      return !prev;
    });

  const closeAddMember = () => {
    setIsAddMemberOpen(false);
    resetSearch();
  };

  const resetSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setIsDropdownOpen(false);
    setAddMemberForm({ email: '', role: 'team_member', publicKey: '' });
    setAddMemberError(null);
  };

  const onSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsDropdownOpen(value.trim().length >= 2);
    // Clear selection when input is modified
    setAddMemberForm({
      ...addMemberForm,
      email: value,
      selectedUserId: undefined,
    });
  };

  const onSelectUser = (user: UserSearchResponse['users'][number]) => {
    setSearchQuery(user.email);
    setIsDropdownOpen(false);
    setAddMemberForm({
      ...addMemberForm,
      email: user.email,
      selectedUserId: user.id,
      publicKey: user.publicKey,
    });
  };

  const onSearchFocus = () => {
    if (closeDropdownTimerRef.current) {
      clearTimeout(closeDropdownTimerRef.current);
    }
    if (searchQuery.trim().length >= 2) {
      setIsDropdownOpen(true);
    }
  };

  const onSearchBlur = () => {
    // Delay closing so click on a suggestion is registered first
    closeDropdownTimerRef.current = setTimeout(
      () => setIsDropdownOpen(false),
      150,
    );
  };

  return {
    addMemberError,
    addMemberForm,
    addMemberMutation,
    canManageMembers,
    closeAddMember,
    closeDeleteDialog,
    handleAddMember,
    handleDeleteSuccess,
    isAddMemberOpen,
    isDeleteDialogOpen,
    isDropdownOpen,
    isOwner,
    members,
    membersError,
    membersLoading,
    onSearchBlur,
    onSearchChange,
    onSearchFocus,
    onSelectUser,
    openDeleteDialog,
    searchQuery,
    setAddMemberForm,
    suggestions,
    toggleAddMember,
    user,
  };
}

export const useMemberList = (vaultId: string) => {
  const queryClient = useQueryClient();
  const user = useUserStore();
  const updateRoleMutation = useUpdateMemberRole(vaultId);

  const [memberToRemove, setMemberToRemove] = useState<VaultMember | null>(
    null,
  );
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const openRemoveDialog = (member: VaultMember) => {
    setMemberToRemove(member);
    setIsRemoveDialogOpen(true);
  };

  const closeRemoveDialog = () => {
    setIsRemoveDialogOpen(false);
    setMemberToRemove(null);
  };

  const handleRemoveSuccess = () => {
    closeRemoveDialog();
    queryClient.invalidateQueries({ queryKey: vaultKeys.members(vaultId) });
    queryClient.invalidateQueries({ queryKey: vaultKeys.lists });
    queryClient.invalidateQueries({ queryKey: vaultKeys.detail(vaultId) });
    queryClient.invalidateQueries({ queryKey: vaultKeys.passwords(vaultId) });
  };

  const getMemberFlags = (
    member: VaultMember,
    canManageMembers: boolean,
  ): MemberFlags => {
    const isCurrentUser = member.userId === user?.userId;
    const isOwner = member.userRole === 'owner';
    const canEdit = canManageMembers && !isOwner && !isCurrentUser;
    return { isCurrentUser, isOwner, canEdit };
  };

  return {
    getMemberFlags,
    updateRoleMutation,
    memberToRemove,
    isRemoveDialogOpen,
    openRemoveDialog,
    closeRemoveDialog,
    handleRemoveSuccess,
  };
};
