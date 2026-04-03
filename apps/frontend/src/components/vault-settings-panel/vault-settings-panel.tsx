import { VaultMemberResponse } from '@repo/shared';
import * as panelStyles from '../../common/css/panel.css';
import * as styles from './vault-settings-panel.css';
import {
  useMemberList,
  useVaultSettingsPanel,
} from './vault-settings-panel.hook';
import type { VaultSettingsPanelProps } from './vault-settings-panel.type';
import { FC } from 'react';
import { button } from '../../common/css/button.css';
import RemoveMemberDialog from '../remove-member-dialog/remove-member-dialog';
import DeleteVaultDialog from '../delete-vault-dialog/delete-vault-dialog';

const MembersList: FC<{
  vaultId: string;
  members: VaultMemberResponse['members'];
  canManageMembers: boolean;
}> = ({ vaultId, members, canManageMembers }) => {
  const {
    getMemberFlags,
    updateRoleMutation,
    memberToRemove,
    isRemoveDialogOpen,
    openRemoveDialog,
    closeRemoveDialog,
    handleRemoveSuccess,
  } = useMemberList(vaultId);

  return (
    <>
      {members.map((member) => {
        const { isCurrentUser, isOwner, canEdit } = getMemberFlags(
          member,
          canManageMembers,
        );

        return (
          <div key={member.userId} className={styles.memberItem}>
            <div className={styles.memberAvatar}>
              {member.userName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.memberInfo}>
              <div className={styles.memberName}>
                {member.userName}
                {isCurrentUser && (
                  <span className={styles.currentUserBadge}>(you)</span>
                )}
              </div>
              <div className={styles.memberEmail}>{member.userEmail}</div>
            </div>
            <div className={styles.memberActions}>
              {isOwner ? (
                <span
                  className={`${panelStyles.vaultRoleBadge} ${panelStyles.vaultRoleOwner}`}
                  style={{ fontSize: '0.6875rem' }}
                >
                  owner
                </span>
              ) : canEdit ? (
                <>
                  <select
                    className={styles.roleSelect}
                    value={member.userRole}
                    disabled={updateRoleMutation.isPending}
                    onChange={(e) =>
                      updateRoleMutation.mutate({
                        memberId: member.userId,
                        role: e.target.value as 'manager' | 'team_member',
                      })
                    }
                  >
                    <option value="manager">Manager</option>
                    <option value="team_member">Member</option>
                  </select>
                  {isCurrentUser ? null : (
                    <button
                      className={styles.removeButton}
                      onClick={() => openRemoveDialog(member)}
                    >
                      Remove
                    </button>
                  )}
                </>
              ) : (
                <span
                  className={`${panelStyles.vaultRoleBadge} ${member.userRole === 'manager' ? panelStyles.vaultRoleManager : panelStyles.vaultRoleMember}`}
                  style={{ fontSize: '0.6875rem' }}
                >
                  {member.userRole}
                </span>
              )}
            </div>
          </div>
        );
      })}

      <RemoveMemberDialog
        isOpen={isRemoveDialogOpen}
        member={memberToRemove}
        vaultId={vaultId}
        onClose={closeRemoveDialog}
        onSuccess={handleRemoveSuccess}
      />
    </>
  );
};

export default function VaultSettingsPanel({ vault }: VaultSettingsPanelProps) {
  const {
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
    onSearchBlur,
    onSearchChange,
    onSearchFocus,
    onSelectUser,
    openDeleteDialog,
    setAddMemberForm,
    searchQuery,
    suggestions,
    members,
    membersError,
    membersLoading,
    toggleAddMember,
  } = useVaultSettingsPanel({ vault });

  return (
    <main className={panelStyles.detailColumn}>
      <div className={styles.settingsScrollArea}>
        <div className={styles.settingsCard}>
          <div className={styles.settingsCardHeader}>
            <div>
              <div className={styles.settingsVaultName}>{vault.name}</div>
              <div className={styles.settingsVaultMeta}>
                {vault.isPersonalVault ? 'Personal vault' : 'Shared vault'}
              </div>
            </div>
            {isOwner && !vault.isPersonalVault && (
              <button
                className={styles.deleteVaultButton}
                onClick={openDeleteDialog}
              >
                Delete vault
              </button>
            )}
          </div>
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.membersHeader}>
            <div className={styles.membersTitle}>Members</div>
            {canManageMembers && (
              <button
                className={styles.addMemberToggleButton}
                onClick={toggleAddMember}
              >
                {isAddMemberOpen ? '✕ Cancel' : '+ Add'}
              </button>
            )}
          </div>

          {isAddMemberOpen && (
            <div className={styles.addMemberInlinePanel}>
              <div className={styles.addMemberInputRow}>
                <div className={styles.searchInputWrapper}>
                  <input
                    className={styles.addMemberEmailInput}
                    type="text"
                    placeholder="Search by name or email…"
                    value={searchQuery}
                    disabled={addMemberMutation.isPending}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={onSearchFocus}
                    onBlur={onSearchBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && addMemberForm.selectedUserId)
                        handleAddMember();
                    }}
                    autoComplete="off"
                    maxLength={30}
                  />
                  {isDropdownOpen && (
                    <div className={styles.suggestionDropdown}>
                      {!suggestions || suggestions.users.length === 0 ? (
                        <div className={styles.noSuggestions}>
                          No users found
                        </div>
                      ) : (
                        suggestions.users.map((user) => (
                          <div
                            key={user.id}
                            className={styles.suggestionItem}
                            onMouseDown={() => onSelectUser(user)}
                          >
                            <span className={styles.suggestionEmail}>
                              {user.email}
                            </span>
                            <span className={styles.suggestionUsername}>
                              {user.username}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <select
                  className={styles.addMemberRoleSelect}
                  value={addMemberForm.role}
                  disabled={addMemberMutation.isPending}
                  onChange={(e) =>
                    setAddMemberForm({
                      ...addMemberForm,
                      role: e.target.value as 'manager' | 'team_member',
                    })
                  }
                >
                  <option value="team_member">Member</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              {addMemberError && (
                <div className={panelStyles.errorBanner} style={{ margin: 0 }}>
                  {addMemberError}
                </div>
              )}
              <div className={styles.addMemberInlineActions}>
                <button
                  className={styles.btnSecondary}
                  disabled={addMemberMutation.isPending}
                  onClick={closeAddMember}
                >
                  Cancel
                </button>
                <button
                  className={button.primarySmall}
                  disabled={
                    addMemberMutation.isPending || !addMemberForm.selectedUserId
                  }
                  onClick={handleAddMember}
                >
                  {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </div>
          )}

          {membersLoading && (
            <div className={panelStyles.loadingCenter}>
              <div className={panelStyles.loadingSpinner} />
            </div>
          )}

          {membersError && !membersLoading && (
            <div className={panelStyles.errorBanner}>
              Failed to load members.
            </div>
          )}

          {!membersLoading && !membersError && (
            <div className={styles.membersList}>
              <MembersList
                canManageMembers={canManageMembers}
                members={members?.members ?? []}
                vaultId={vault.id}
              />
            </div>
          )}
        </div>
      </div>

      <DeleteVaultDialog
        isOpen={isDeleteDialogOpen}
        vaultId={vault.id}
        vaultName={vault.name}
        onClose={closeDeleteDialog}
        onSuccess={handleDeleteSuccess}
      />
    </main>
  );
}
