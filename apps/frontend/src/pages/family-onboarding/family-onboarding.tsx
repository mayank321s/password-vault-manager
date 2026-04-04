import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  encryptVaultKey,
  generateSymmetricKey,
  importPublicKey,
} from '@repo/crypto-utils';
import { useInviteFamilyMember, useCreateFamilyWorkspace, useFamilyMembers } from '../../hooks/useFamily';
import { getUserKeys } from '../../lib/storage';
import { useOrganizationContext } from '../../contexts/OrganizationContext';
import type { FamilyInviteRole } from '../../services/family.service';
import * as styles from './family-onboarding.css';

export default function FamilyOnboardingPage() {
  const {
    registerOrganization,
    activeOrganizationId,
    activeOrganizationType,
  } = useOrganizationContext();
  const [workspaceName, setWorkspaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<FamilyInviteRole>('adult');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const createWorkspaceMutation = useCreateFamilyWorkspace();
  const activeWorkspaceId =
    workspaceId ??
    (activeOrganizationType === 'family' ? activeOrganizationId : null);
  const inviteMemberMutation = useInviteFamilyMember(activeWorkspaceId);
  const membersQuery = useFamilyMembers(activeWorkspaceId);

  const canInvite = Boolean(activeWorkspaceId);
  const sortedMembers = useMemo(
    () =>
      [...(membersQuery.data?.members ?? [])].sort((a, b) =>
        a.role.localeCompare(b.role),
      ),
    [membersQuery.data?.members],
  );

  const handleCreateWorkspace = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    try {
      const userKeys = await getUserKeys();
      if (!userKeys) {
        throw new Error('User key material unavailable. Please log in again.');
      }

      const familyVaultKey = await generateSymmetricKey();
      const publicKey = await importPublicKey(userKeys.publicKey);
      const familyVaultEncryptedKey = await encryptVaultKey(
        familyVaultKey,
        publicKey,
      );

      const created = await createWorkspaceMutation.mutateAsync({
        name: workspaceName.trim(),
        familyVaultEncryptedKey,
      });

      await registerOrganization(created.organizationId, 'family');
      setWorkspaceId(created.organizationId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create workspace';
      setLocalError(message);
    }
  };

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    try {
      await inviteMemberMutation.mutateAsync({
        userEmail: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteEmail('');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to send invitation';
      setLocalError(message);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Family Onboarding Wizard</h1>
        <p className={styles.subheading}>
          Create your family workspace, assign adult/child roles, and invite
          members in one guided flow.
        </p>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Step 1: Create Family Workspace</h2>
          <form className={styles.form} onSubmit={(event) => void handleCreateWorkspace(event)}>
            <label className={styles.label} htmlFor="workspaceName">
              Family Workspace Name
            </label>
            <input
              id="workspaceName"
              className={styles.input}
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="The Patel Family Vault"
              minLength={2}
              maxLength={120}
              required
              disabled={Boolean(activeWorkspaceId) || createWorkspaceMutation.isPending}
            />
            <button
              type="submit"
              className={styles.button}
              disabled={
                createWorkspaceMutation.isPending ||
                Boolean(activeWorkspaceId) ||
                workspaceName.trim().length < 2
              }
            >
              {createWorkspaceMutation.isPending
                ? 'Creating...'
                : activeWorkspaceId
                  ? 'Workspace Ready'
                  : 'Create Family Workspace'}
            </button>
          </form>
          {activeWorkspaceId && (
            <p className={styles.successText}>
              Family workspace created and active: {activeWorkspaceId}
            </p>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Step 2: Invite Members</h2>
          <form className={styles.formInline} onSubmit={(event) => void handleInvite(event)}>
            <input
              className={styles.input}
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="member@example.com"
              disabled={!canInvite || inviteMemberMutation.isPending}
              required
            />
            <select
              className={styles.select}
              value={inviteRole}
              onChange={(event) =>
                setInviteRole(event.target.value as FamilyInviteRole)
              }
              disabled={!canInvite || inviteMemberMutation.isPending}
            >
              <option value="adult">Adult</option>
              <option value="child">Child</option>
            </select>
            <button
              type="submit"
              className={styles.button}
              disabled={!canInvite || inviteMemberMutation.isPending}
            >
              {inviteMemberMutation.isPending ? 'Sending...' : 'Send Invite'}
            </button>
          </form>
          <p className={styles.hint}>
            Owner and adults can manage credentials. Child accounts are
            restricted from sensitive write/share actions.
          </p>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Step 3: Role Management Overview</h2>
          {membersQuery.isLoading && <p className={styles.hint}>Loading members...</p>}
          {!membersQuery.isLoading && sortedMembers.length === 0 && (
            <p className={styles.hint}>No members yet. Invite at least one member.</p>
          )}
          {sortedMembers.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Member</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map((member) => (
                  <tr key={member.userId}>
                    <td className={styles.td}>{member.email}</td>
                    <td className={styles.td}>{member.role}</td>
                    <td className={styles.td}>{member.status}</td>
                    <td className={styles.td}>
                      {member.joinedAt
                        ? new Date(member.joinedAt).toLocaleDateString()
                        : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button
            type="button"
            className={styles.button}
            disabled={!canInvite}
            onClick={() => setIsFinished(true)}
          >
            Finish Onboarding
          </button>
          {isFinished && (
            <p className={styles.successText}>
              Family onboarding completed. Continue to{' '}
              <Link to="/vaults" className={styles.link}>
                Vaults
              </Link>{' '}
              or{' '}
              <Link to="/settings/organization/family" className={styles.link}>
                Family Settings
              </Link>
              .
            </p>
          )}
        </section>

        {localError && <p className={styles.errorText}>{localError}</p>}
      </div>
    </div>
  );
}
