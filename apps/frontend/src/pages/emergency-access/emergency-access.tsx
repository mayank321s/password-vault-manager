import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useAcceptEmergencyAccessGrant,
  useCreateEmergencyAccessGrant,
  useEmergencyAccessGrants,
  useRevokeEmergencyAccessGrant,
} from '../../hooks/useEmergencyAccess';
import * as styles from './emergency-access.css';

function formatDelay(hours: number) {
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'}`;
}

export default function EmergencyAccessPage() {
  const [granteeEmail, setGranteeEmail] = useState('');
  const [recoveryDelayHours, setRecoveryDelayHours] = useState(72);
  const [note, setNote] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const grantsQuery = useEmergencyAccessGrants();
  const createGrantMutation = useCreateEmergencyAccessGrant();
  const acceptGrantMutation = useAcceptEmergencyAccessGrant();
  const revokeGrantMutation = useRevokeEmergencyAccessGrant();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    try {
      await createGrantMutation.mutateAsync({
        granteeEmail: granteeEmail.trim(),
        recoveryDelayHours,
        note: note.trim() || undefined,
      });
      setGranteeEmail('');
      setNote('');
      setRecoveryDelayHours(72);
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : 'Failed to configure emergency access',
      );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Emergency Access</h1>
        <p className={styles.subheading}>
          Configure trusted contacts with a recovery delay, require explicit
          acceptance before activation, and keep a clear audit trail for every
          revoke action. You can jump back to{' '}
          <Link to="/settings/organization/family" className={styles.meta}>
            family settings
          </Link>{' '}
          at any time.
        </p>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Grant Emergency Access</h2>
          <form className={styles.formGrid} onSubmit={(event) => void handleSubmit(event)}>
            <input
              className={styles.input}
              type="email"
              placeholder="trusted-contact@example.com"
              value={granteeEmail}
              onChange={(event) => setGranteeEmail(event.target.value)}
              required
              disabled={createGrantMutation.isPending}
            />
            <select
              className={styles.input}
              value={recoveryDelayHours}
              onChange={(event) => setRecoveryDelayHours(Number(event.target.value))}
              disabled={createGrantMutation.isPending}
            >
              <option value={48}>2 days</option>
              <option value={72}>3 days</option>
              <option value={120}>5 days</option>
              <option value={168}>7 days</option>
            </select>
            <input
              className={styles.input}
              placeholder="Optional note for the trusted contact"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={createGrantMutation.isPending}
            />
            <button
              type="submit"
              className={styles.button}
              disabled={createGrantMutation.isPending}
            >
              {createGrantMutation.isPending ? 'Saving...' : 'Create Grant'}
            </button>
          </form>
        </section>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Outgoing Grants</h2>
            {grantsQuery.data?.outgoing.length ? (
              grantsQuery.data.outgoing.map((grant) => (
                <article key={grant.grantId} className={styles.itemCard}>
                  <h3 className={styles.itemTitle}>{grant.granteeEmail}</h3>
                  <p className={styles.meta}>
                    Status: {grant.status} | Delay: {formatDelay(grant.recoveryDelayHours)}
                  </p>
                  <p className={styles.text}>
                    {grant.note || 'No custom instructions added.'}
                  </p>
                  <p className={styles.text}>
                    Created {new Date(grant.createdAt).toLocaleString()}
                    {grant.revokedAt
                      ? ` | Revoked ${new Date(grant.revokedAt).toLocaleString()}`
                      : ''}
                  </p>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      disabled={revokeGrantMutation.isPending || grant.status === 'revoked'}
                      onClick={() => void revokeGrantMutation.mutateAsync(grant.grantId)}
                    >
                      Revoke
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className={styles.emptyText}>No outgoing emergency access grants yet.</p>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Incoming Requests</h2>
            {grantsQuery.data?.incoming.length ? (
              grantsQuery.data.incoming.map((grant) => (
                <article key={grant.grantId} className={styles.itemCard}>
                  <h3 className={styles.itemTitle}>{grant.grantorEmail}</h3>
                  <p className={styles.meta}>
                    Status: {grant.status} | Delay: {formatDelay(grant.recoveryDelayHours)}
                  </p>
                  <p className={styles.text}>
                    {grant.note || 'No note added by the grant owner.'}
                  </p>
                  <div className={styles.actions}>
                    {grant.status === 'pending_acceptance' && (
                      <button
                        type="button"
                        className={styles.button}
                        disabled={acceptGrantMutation.isPending}
                        onClick={() => void acceptGrantMutation.mutateAsync(grant.grantId)}
                      >
                        Accept
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      disabled={revokeGrantMutation.isPending || grant.status === 'revoked'}
                      onClick={() => void revokeGrantMutation.mutateAsync(grant.grantId)}
                    >
                      Revoke
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className={styles.emptyText}>No incoming requests right now.</p>
            )}
          </section>
        </div>

        {(grantsQuery.isError || localError) && (
          <p className={styles.errorText}>
            {localError || 'Emergency access data could not be loaded.'}
          </p>
        )}
      </div>
    </div>
  );
}
