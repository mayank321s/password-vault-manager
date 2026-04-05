import { useMemo } from 'react';
import { useAuditEvents } from '../../hooks/useAudit';
import { useOrganizationPolicy } from '../../hooks/usePolicy';
import { useScimDiagnostics } from '../../hooks/useScim';
import { useSsoConfiguration } from '../../hooks/useSso';
import * as styles from './org-settings.css';

interface SecurityOpsPanelProps {
  organizationId: string | null;
  organizationType: 'personal' | 'family' | 'business' | null;
}

interface AlertBaseline {
  title: string;
  severity: 'Critical' | 'High' | 'Medium';
  trigger: string;
  owner: string;
  runbook: string;
}

interface RunbookStep {
  title: string;
  trigger: string;
  steps: string[];
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return 'Not yet observed';
  }

  return new Date(value).toLocaleString();
}

function buildSeverityClass(severity: AlertBaseline['severity']) {
  if (severity === 'Critical') {
    return styles.domainBadgeCritical;
  }

  if (severity === 'High') {
    return styles.domainBadgePending;
  }

  return styles.domainBadgeInfo;
}

const ALERT_BASELINES: AlertBaseline[] = [
  {
    title: 'SCIM provisioning failures',
    severity: 'Critical',
    trigger:
      'Trigger when one or more SCIM provisioning events fail in a 30 minute window.',
    owner: 'Identity on-call',
    runbook: 'Runbook A: SCIM provisioning interruption',
  },
  {
    title: 'MFA enforcement drift',
    severity: 'High',
    trigger:
      'Trigger when the active business organization policy no longer requires MFA.',
    owner: 'Security owner',
    runbook: 'Runbook B: Policy drift or unauthorized admin change',
  },
  {
    title: 'SSO verification posture gap',
    severity: 'High',
    trigger:
      'Trigger when SSO is configured but no verified primary domain exists for launch tenants.',
    owner: 'Identity admin',
    runbook: 'Runbook C: SSO verification or login outage',
  },
  {
    title: 'Audit spike investigation',
    severity: 'Medium',
    trigger:
      "Trigger when admin audit actions spike above the team's normal weekly baseline.",
    owner: 'Security operations',
    runbook: 'Runbook D: Suspicious admin activity review',
  },
];

const INCIDENT_RUNBOOKS: RunbookStep[] = [
  {
    title: 'Runbook A: SCIM provisioning interruption',
    trigger: 'Recent SCIM failures increase or provisioning stops unexpectedly.',
    steps: [
      'Confirm whether failures are isolated to one token, one identity provider, or all provisioning traffic.',
      'Review recent SCIM diagnostics and token activity to identify the failing token prefix and last successful sync.',
      'Rotate or revoke the affected SCIM token if compromise is suspected, then re-test provisioning with a controlled user update.',
      'Export matching audit events and notify the identity owner with the failing resource ids and timestamps.',
    ],
  },
  {
    title: 'Runbook B: Policy drift or unauthorized admin change',
    trigger: 'MFA or external sharing policy changes unexpectedly.',
    steps: [
      'Filter audit history to organization policy actions and confirm the actor, timestamp, and exact fields changed.',
      'Restore the expected policy settings from the organization policy panel and verify session/device guardrails are re-applied.',
      'If the change was unexpected, rotate high-risk credentials and review recent admin actions for related identity changes.',
      'Capture the evidence export in the incident record and log owner sign-off before closing the incident.',
    ],
  },
  {
    title: 'Runbook C: SSO verification or login outage',
    trigger: 'Users cannot complete SSO login or a verified domain is missing.',
    steps: [
      'Confirm the affected domain, tenant id, and whether the domain is still verified in the identity configuration panel.',
      'Validate the configured redirect URI and verification token against the active identity provider setup.',
      'If verification drift is confirmed, re-run domain verification and communicate temporary fallback guidance to impacted admins.',
      'Review the audit trail for recent SSO configuration updates and attach the timeline to the incident notes.',
    ],
  },
  {
    title: 'Runbook D: Suspicious admin activity review',
    trigger: 'Audit volume spikes or unusual high-risk actions are observed.',
    steps: [
      'Filter audit events to the suspicious action family, actor, or target and export the matching event set.',
      'Correlate with SCIM, SSO, and policy diagnostics to determine whether the activity aligns with an approved rollout or change window.',
      'Revoke exposed admin tokens, disable risky configuration changes, or pause provisioning if compromise is plausible.',
      'Document containment steps, affected entities, and required follow-up review in the incident record.',
    ],
  },
];

export function SecurityOpsPanel({
  organizationId,
  organizationType,
}: SecurityOpsPanelProps) {
  const isBusiness = organizationType === 'business';
  const dateFrom = useMemo(() => {
    const value = new Date();
    value.setDate(value.getDate() - 7);
    return value.toISOString();
  }, []);

  const auditQuery = useAuditEvents(
    organizationId,
    { dateFrom, limit: 100 },
    isBusiness,
  );
  const policyQuery = useOrganizationPolicy(organizationId, isBusiness);
  const ssoQuery = useSsoConfiguration(organizationId, isBusiness);
  const scimQuery = useScimDiagnostics(organizationId, isBusiness);

  const auditEvents = auditQuery.data?.events ?? [];
  const verifiedDomains =
    ssoQuery.data?.domains.filter((domain) => Boolean(domain.verifiedAt)) ?? [];
  const isLoadingSignals =
    auditQuery.isLoading ||
    policyQuery.isLoading ||
    ssoQuery.isLoading ||
    scimQuery.isLoading;

  const riskItems = useMemo(() => {
    const items: string[] = [];

    if (policyQuery.data && !policyQuery.data.requireMfa) {
      items.push('MFA is not enforced for the active business organization.');
    }

    if (ssoQuery.data && verifiedDomains.length === 0) {
      items.push('SSO is configured but no verified domain is active.');
    }

    if ((scimQuery.data?.provisioningStatus.recentFailureCount ?? 0) > 0) {
      items.push('Recent SCIM failures need investigation before launch cutover.');
    }

    if (auditQuery.data && auditEvents.length === 0) {
      items.push('No security-relevant audit events were observed in the last 7 days.');
    }

    return items;
  }, [
    auditEvents.length,
    auditQuery.data,
    policyQuery.data,
    scimQuery.data,
    ssoQuery.data,
    verifiedDomains.length,
  ]);

  if (!isBusiness) {
    return (
      <div className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Security operations center</h3>
        <p className={styles.sectionDescription}>
          Security operations dashboards are available for business workspaces.
          Switch into a business organization to review launch readiness,
          alert baselines, and incident runbooks.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.identityLayout}>
      <section className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Launch dashboard</h3>
        <p className={styles.sectionDescription}>
          Roll-up of the highest-signal identity, policy, provisioning, and
          audit indicators for the active business organization.
        </p>
        <div className={styles.statusGrid}>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Audit events (7d)</span>
            <span className={styles.statusValue}>
              {auditQuery.isLoading ? 'Loading...' : auditEvents.length}
            </span>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>MFA required</span>
            <span className={styles.statusValue}>
              {policyQuery.isLoading
                ? 'Loading...'
                : policyQuery.data?.requireMfa
                  ? 'Yes'
                  : 'No'}
            </span>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Verified SSO domains</span>
            <span className={styles.statusValue}>
              {ssoQuery.isLoading ? 'Loading...' : verifiedDomains.length}
            </span>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Active SCIM tokens</span>
            <span className={styles.statusValue}>
              {scimQuery.isLoading
                ? 'Loading...'
                : scimQuery.data?.tokenStatus.activeTokenCount ?? 0}
            </span>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Recent SCIM failures</span>
            <span className={styles.statusValue}>
              {scimQuery.isLoading
                ? 'Loading...'
                : scimQuery.data?.provisioningStatus.recentFailureCount ?? 0}
            </span>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Last audit event</span>
            <span className={styles.statusValue}>
              {formatTimestamp(auditEvents[0]?.createdAt ?? null)}
            </span>
          </div>
        </div>

        {isLoadingSignals ? (
          <p className={styles.sectionDescription}>
            Loading security operations signals...
          </p>
        ) : riskItems.length > 0 ? (
          <div className={styles.warningPanel}>
            <p className={styles.warningTitle}>Action queue</p>
            {riskItems.map((item) => (
              <p key={item} className={styles.warningText}>
                {item}
              </p>
            ))}
          </div>
        ) : (
          <p className={styles.successText}>
            No immediate launch blockers detected from the current policy,
            identity, SCIM, and audit signals.
          </p>
        )}
      </section>

      <section className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Operational alert baselines</h3>
        <p className={styles.sectionDescription}>
          Recommended launch alerts aligned to the identity and audit surfaces
          already implemented in the product.
        </p>
        <div className={styles.domainList}>
          {ALERT_BASELINES.map((alert) => (
            <article key={alert.title} className={styles.domainCard}>
              <div className={styles.domainHeader}>
                <div>
                  <h4 className={styles.domainTitle}>{alert.title}</h4>
                  <p className={styles.domainMeta}>{alert.trigger}</p>
                </div>
                <span className={buildSeverityClass(alert.severity)}>
                  {alert.severity}
                </span>
              </div>
              <p className={styles.domainMeta}>Owner: {alert.owner}</p>
              <p className={styles.domainMeta}>Linked response: {alert.runbook}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Incident runbooks</h3>
        <p className={styles.sectionDescription}>
          Response guides for the most likely launch-time identity and admin
          security incidents.
        </p>
        <div className={styles.domainList}>
          {INCIDENT_RUNBOOKS.map((runbook) => (
            <article key={runbook.title} className={styles.domainCard}>
              <div className={styles.domainHeader}>
                <div>
                  <h4 className={styles.domainTitle}>{runbook.title}</h4>
                  <p className={styles.domainMeta}>Trigger: {runbook.trigger}</p>
                </div>
                <span className={styles.domainBadgeVerified}>Ready</span>
              </div>
              <ol className={styles.runbookList}>
                {runbook.steps.map((step) => (
                  <li key={step} className={styles.runbookStep}>
                    {step}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Live signal detail</h3>
        <p className={styles.sectionDescription}>
          Current state pulled from existing admin-only product endpoints.
        </p>
        <div className={styles.domainList}>
          <article className={styles.domainCard}>
            <h4 className={styles.domainTitle}>Policy posture</h4>
            <p className={styles.domainMeta}>
              External sharing restricted:{' '}
              {policyQuery.isLoading
                ? 'Loading...'
                : policyQuery.data?.restrictExternalSharing
                  ? 'Yes'
                  : 'No'}
            </p>
            <p className={styles.domainMeta}>
              Session timeout:{' '}
              {policyQuery.isLoading
                ? 'Loading...'
                : `${policyQuery.data?.sessionTimeoutMinutes ?? 0} minutes`}
            </p>
            <p className={styles.domainMeta}>
              Device cap:{' '}
              {policyQuery.isLoading
                ? 'Loading...'
                : `${policyQuery.data?.maxDevicesPerUser ?? 0} devices per user`}
            </p>
          </article>
          <article className={styles.domainCard}>
            <h4 className={styles.domainTitle}>Identity posture</h4>
            <p className={styles.domainMeta}>
              SSO active:{' '}
              {ssoQuery.isLoading
                ? 'Loading...'
                : ssoQuery.data?.isActive
                  ? 'Yes'
                  : 'No'}
            </p>
            <p className={styles.domainMeta}>
              Verified domains:{' '}
              {ssoQuery.isLoading
                ? 'Loading...'
                : verifiedDomains.map((domain) => domain.domain).join(', ') || 'None'}
            </p>
            <p className={styles.domainMeta}>
              Last SCIM success:{' '}
              {formatTimestamp(scimQuery.data?.provisioningStatus.lastSuccessAt ?? null)}
            </p>
            <p className={styles.domainMeta}>
              Last SCIM failure:{' '}
              {formatTimestamp(scimQuery.data?.provisioningStatus.lastFailureAt ?? null)}
            </p>
          </article>
        </div>

        {(auditQuery.isError ||
          policyQuery.isError ||
          ssoQuery.isError ||
          scimQuery.isError) && (
          <p className={styles.errorText}>
            One or more security operations signals could not be loaded. Review
            identity and audit connectivity before relying on this dashboard for
            launch operations.
          </p>
        )}
      </section>
    </div>
  );
}
