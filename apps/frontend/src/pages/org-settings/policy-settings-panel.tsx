import { FormEvent, useEffect, useState } from 'react';
import {
  useOrganizationPolicy,
  useUpsertOrganizationPolicy,
} from '../../hooks/usePolicy';
import * as styles from './org-settings.css';

interface PolicySettingsPanelProps {
  organizationId: string | null;
  organizationType: 'personal' | 'family' | 'business' | null;
}

function formatTimestamp(value: string | null) {
  return value ? new Date(value).toLocaleString() : 'Not updated yet';
}

export function PolicySettingsPanel({
  organizationId,
  organizationType,
}: PolicySettingsPanelProps) {
  const isBusiness = organizationType === 'business';
  const policyQuery = useOrganizationPolicy(organizationId, isBusiness);
  const upsertMutation = useUpsertOrganizationPolicy(organizationId);

  const [requireMfa, setRequireMfa] = useState(false);
  const [restrictExternalSharing, setRestrictExternalSharing] = useState(false);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('60');
  const [maxDevicesPerUser, setMaxDevicesPerUser] = useState('5');
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!policyQuery.data) {
      return;
    }

    setRequireMfa(policyQuery.data.requireMfa);
    setRestrictExternalSharing(policyQuery.data.restrictExternalSharing);
    setSessionTimeoutMinutes(String(policyQuery.data.sessionTimeoutMinutes));
    setMaxDevicesPerUser(String(policyQuery.data.maxDevicesPerUser));
  }, [policyQuery.data]);

  if (!isBusiness) {
    return (
      <div className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Enterprise policy controls</h3>
        <p className={styles.sectionDescription}>
          MFA and session controls are available for business workspaces. Switch
          into a business organization to manage enterprise policy.
        </p>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    setLocalMessage(null);

    const nextSessionTimeout = Number(sessionTimeoutMinutes);
    const nextMaxDevices = Number(maxDevicesPerUser);

    if (!Number.isInteger(nextSessionTimeout) || nextSessionTimeout < 5 || nextSessionTimeout > 1440) {
      setLocalError('Session timeout must be between 5 and 1440 minutes.');
      return;
    }

    if (!Number.isInteger(nextMaxDevices) || nextMaxDevices < 1 || nextMaxDevices > 50) {
      setLocalError('Device limit must be between 1 and 50 active sessions.');
      return;
    }

    try {
      await upsertMutation.mutateAsync({
        requireMfa,
        restrictExternalSharing,
        sessionTimeoutMinutes: nextSessionTimeout,
        maxDevicesPerUser: nextMaxDevices,
      });
      setLocalMessage('Organization policy updated and backend enforcement is now active.');
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : 'Could not update organization policy.',
      );
    }
  };

  return (
    <div className={styles.identityLayout}>
      <section className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Access policy</h3>
        <p className={styles.sectionDescription}>
          Define the login and session baseline for everyone in this workspace.
        </p>

        <form className={styles.identityForm} onSubmit={(event) => void handleSubmit(event)}>
          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={requireMfa}
              onChange={(event) => setRequireMfa(event.target.checked)}
              disabled={upsertMutation.isPending || policyQuery.isLoading}
            />
            <span>
              <strong className={styles.fieldLabel}>Require MFA</strong>
              <span className={styles.inlineHint}>
                Block session creation for members who do not have TOTP enrolled.
              </span>
            </span>
          </label>

          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={restrictExternalSharing}
              onChange={(event) => setRestrictExternalSharing(event.target.checked)}
              disabled={upsertMutation.isPending || policyQuery.isLoading}
            />
            <span>
              <strong className={styles.fieldLabel}>Restrict external sharing</strong>
              <span className={styles.inlineHint}>
                Prevent password sharing flows that target people outside the organization.
              </span>
            </span>
          </label>

          <label className={styles.fieldLabel} htmlFor="sessionTimeoutMinutes">
            Session timeout (minutes)
          </label>
          <input
            id="sessionTimeoutMinutes"
            className={styles.fieldInput}
            inputMode="numeric"
            value={sessionTimeoutMinutes}
            onChange={(event) => setSessionTimeoutMinutes(event.target.value)}
            disabled={upsertMutation.isPending || policyQuery.isLoading}
          />

          <label className={styles.fieldLabel} htmlFor="maxDevicesPerUser">
            Max active sessions per user
          </label>
          <input
            id="maxDevicesPerUser"
            className={styles.fieldInput}
            inputMode="numeric"
            value={maxDevicesPerUser}
            onChange={(event) => setMaxDevicesPerUser(event.target.value)}
            disabled={upsertMutation.isPending || policyQuery.isLoading}
          />

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={upsertMutation.isPending || policyQuery.isLoading}
          >
            {upsertMutation.isPending ? 'Saving policy...' : 'Save Policy'}
          </button>
        </form>
      </section>

      <section className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Enforcement summary</h3>
        <div className={styles.statusGrid}>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>MFA baseline</span>
            <strong className={styles.statusValue}>
              {policyQuery.data?.requireMfa ? 'Required' : 'Optional'}
            </strong>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Session timeout</span>
            <strong className={styles.statusValue}>
              {policyQuery.data?.sessionTimeoutMinutes ?? 60} minutes
            </strong>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Device cap</span>
            <strong className={styles.statusValue}>
              {policyQuery.data?.maxDevicesPerUser ?? 5} sessions
            </strong>
          </div>
        </div>

        <div className={styles.endpointCard}>
          <p className={styles.tokenLabel}>What this currently enforces</p>
          <p className={styles.domainMeta}>
            Session expiration uses the configured timeout for new logins.
          </p>
          <p className={styles.domainMeta}>
            When a user exceeds the device cap, the oldest active sessions are revoked automatically.
          </p>
          <p className={styles.domainMeta}>
            MFA-required workspaces reject new sessions for accounts without TOTP enrollment.
          </p>
          <p className={styles.domainMeta}>
            Last updated: {formatTimestamp(policyQuery.data?.updatedAt ?? null)}
          </p>
        </div>

        {(localMessage || localError || policyQuery.isError) && (
          <p className={localError || policyQuery.isError ? styles.errorText : styles.successText}>
            {localError ||
              (policyQuery.error instanceof Error ? policyQuery.error.message : null) ||
              localMessage}
          </p>
        )}
      </section>
    </div>
  );
}
