import { FormEvent, useMemo, useState } from 'react';
import { useAuditEvents, useExportAuditEvents } from '../../hooks/useAudit';
import type { AuditFilters } from '../../services/audit.service';
import * as styles from './org-settings.css';

interface AuditSettingsPanelProps {
  organizationId: string | null;
  organizationType: 'personal' | 'family' | 'business' | null;
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

function downloadExport(fileName: string, contentType: string, content: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function AuditSettingsPanel({
  organizationId,
  organizationType,
}: AuditSettingsPanelProps) {
  const isBusiness = organizationType === 'business';
  const [actorUserId, setActorUserId] = useState('');
  const [action, setAction] = useState('');
  const [targetType, setTargetType] = useState('');
  const [targetId, setTargetId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const filters = useMemo<AuditFilters>(
    () => ({
      actorUserId: actorUserId.trim() || undefined,
      action: action.trim() || undefined,
      targetType: targetType.trim() || undefined,
      targetId: targetId.trim() || undefined,
      dateFrom: toIsoDateTime(dateFrom),
      dateTo: toIsoDateTime(dateTo),
      limit: 100,
    }),
    [actorUserId, action, targetType, targetId, dateFrom, dateTo],
  );

  const auditQuery = useAuditEvents(organizationId, filters, isBusiness);
  const exportMutation = useExportAuditEvents();

  if (!isBusiness) {
    return (
      <div className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Audit reporting</h3>
        <p className={styles.sectionDescription}>
          Audit visibility is available for business workspaces. Switch into a
          business organization to review admin activity and exports.
        </p>
      </div>
    );
  }

  const handleExport = async (format: 'csv' | 'json') => {
    setLocalError(null);
    setLocalMessage(null);

    try {
      const exported = await exportMutation.mutateAsync({ format, filters });
      downloadExport(exported.fileName, exported.contentType, exported.content);
      setLocalMessage(`Audit export ready: ${exported.fileName}`);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : 'Could not export audit events.',
      );
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setLocalMessage('Filters updated.');
    setLocalError(null);
    void auditQuery.refetch();
  };

  return (
    <div className={styles.identityLayout}>
      <section className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Audit filters</h3>
        <p className={styles.sectionDescription}>
          Filter by actor, action, target, or time window, then export what you need.
        </p>

        <form className={styles.identityForm} onSubmit={handleSubmit}>
          <label className={styles.fieldLabel} htmlFor="auditAction">
            Action
          </label>
          <input
            id="auditAction"
            className={styles.fieldInput}
            value={action}
            onChange={(event) => setAction(event.target.value)}
            placeholder="sso.configuration.updated"
          />

          <label className={styles.fieldLabel} htmlFor="auditTargetType">
            Target type
          </label>
          <input
            id="auditTargetType"
            className={styles.fieldInput}
            value={targetType}
            onChange={(event) => setTargetType(event.target.value)}
            placeholder="sso_configuration"
          />

          <label className={styles.fieldLabel} htmlFor="auditTargetId">
            Target ID
          </label>
          <input
            id="auditTargetId"
            className={styles.fieldInput}
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
            placeholder="Optional exact resource id"
          />

          <label className={styles.fieldLabel} htmlFor="auditActorUserId">
            Actor user ID
          </label>
          <input
            id="auditActorUserId"
            className={styles.fieldInput}
            value={actorUserId}
            onChange={(event) => setActorUserId(event.target.value)}
            placeholder="Optional actor user id"
          />

          <label className={styles.fieldLabel} htmlFor="auditDateFrom">
            Date from
          </label>
          <input
            id="auditDateFrom"
            className={styles.fieldInput}
            type="datetime-local"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />

          <label className={styles.fieldLabel} htmlFor="auditDateTo">
            Date to
          </label>
          <input
            id="auditDateTo"
            className={styles.fieldInput}
            type="datetime-local"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />

          <div className={styles.buttonRow}>
            <button type="submit" className={styles.primaryButton}>
              Refresh Results
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={exportMutation.isPending}
              onClick={() => void handleExport('csv')}
            >
              Export CSV
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={exportMutation.isPending}
              onClick={() => void handleExport('json')}
            >
              Export JSON
            </button>
          </div>
        </form>
      </section>

      <section className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Recent admin activity</h3>
        <p className={styles.sectionDescription}>
          Latest matching audit records from the append-only event log.
        </p>

        {auditQuery.isLoading && (
          <p className={styles.sectionDescription}>Loading audit events...</p>
        )}

        {auditQuery.data?.events.length ? (
          <div className={styles.logList}>
            {auditQuery.data.events.map((event) => (
              <article key={event.eventId} className={styles.logCard}>
                <div className={styles.domainHeader}>
                  <div>
                    <h4 className={styles.domainTitle}>{event.action}</h4>
                    <p className={styles.domainMeta}>
                      {event.targetType}
                      {event.targetLabel ? ` · ${event.targetLabel}` : ''}
                    </p>
                  </div>
                  <span className={styles.domainBadgeVerified}>
                    {formatTimestamp(event.createdAt)}
                  </span>
                </div>
                <p className={styles.domainMeta}>
                  Actor: {event.actorEmail ?? event.actorUserId ?? 'System'}
                </p>
                {event.targetId && (
                  <p className={styles.domainMeta}>Target ID: {event.targetId}</p>
                )}
                {event.metadata && (
                  <code className={styles.tokenValue}>
                    {JSON.stringify(event.metadata, null, 2)}
                  </code>
                )}
              </article>
            ))}
          </div>
        ) : (
          !auditQuery.isLoading && (
            <p className={styles.sectionDescription}>
              No audit events matched the current filters.
            </p>
          )
        )}

        {(localMessage || localError || auditQuery.isError) && (
          <p className={localError || auditQuery.isError ? styles.errorText : styles.successText}>
            {localError ||
              (auditQuery.error instanceof Error ? auditQuery.error.message : null) ||
              localMessage}
          </p>
        )}
      </section>
    </div>
  );
}
