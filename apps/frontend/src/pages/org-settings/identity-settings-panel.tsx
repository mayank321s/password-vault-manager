import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  useScimDiagnostics,
  useCreateScimToken,
  useRevokeScimToken,
} from '../../hooks/useScim';
import { useSsoConfiguration, useUpsertSsoConfiguration, useVerifySsoDomain } from '../../hooks/useSso';
import type { SsoDomainSummary } from '../../services/sso.service';
import * as styles from './org-settings.css';

interface IdentitySettingsPanelProps {
  organizationId: string | null;
  organizationType: 'personal' | 'family' | 'business' | null;
}

function formatDomains(domains: SsoDomainSummary[]) {
  return domains.map((domain) => domain.domain).join(', ');
}

function formatTimestamp(value: string | null) {
  return value ? new Date(value).toLocaleString() : 'Not yet';
}

export function IdentitySettingsPanel({
  organizationId,
  organizationType,
}: IdentitySettingsPanelProps) {
  const isBusiness = organizationType === 'business';
  const configurationQuery = useSsoConfiguration(organizationId, isBusiness);
  const scimDiagnosticsQuery = useScimDiagnostics(organizationId, isBusiness);
  const upsertMutation = useUpsertSsoConfiguration();
  const verifyMutation = useVerifySsoDomain();
  const createScimTokenMutation = useCreateScimToken(organizationId);
  const revokeScimTokenMutation = useRevokeScimToken(organizationId);

  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecretRef, setClientSecretRef] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [domainsInput, setDomainsInput] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [verificationInputs, setVerificationInputs] = useState<Record<string, string>>({});
  const [scimTokenLabel, setScimTokenLabel] = useState('Default workspace sync');
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [latestSecret, setLatestSecret] = useState<string | null>(null);

  const configuration = configurationQuery.data;
  const domainSummaries = configuration?.domains ?? [];
  const scimDiagnostics = scimDiagnosticsQuery.data;

  useEffect(() => {
    if (!configuration) {
      return;
    }

    setTenantId(configuration.tenantId);
    setClientId(configuration.clientId);
    setClientSecretRef(configuration.clientSecretRef ?? '');
    setRedirectUri(configuration.redirectUri);
    setDomainsInput(formatDomains(configuration.domains));
    const nextPrimaryDomain =
      configuration.domains.find((domain) => domain.isPrimary)?.domain ??
      configuration.domains[0]?.domain ??
      '';
    setPrimaryDomain(nextPrimaryDomain);
    setVerificationInputs(
      configuration.domains.reduce<Record<string, string>>((acc, domain) => {
        acc[domain.domainId] = domain.verificationToken;
        return acc;
      }, {}),
    );
  }, [configuration]);

  const hasVerifiedDomain = useMemo(
    () => domainSummaries.some((domain) => Boolean(domain.verifiedAt)),
    [domainSummaries],
  );

  if (!isBusiness) {
    return (
      <div className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Enterprise identity controls</h3>
        <p className={styles.sectionDescription}>
          SSO and SCIM setup are available for business workspaces. Switch into a
          business organization to manage identity and provisioning.
        </p>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    setLocalMessage(null);

    try {
      const domains = domainsInput
        .split(',')
        .map((domain) => domain.trim().toLowerCase())
        .filter(Boolean);

      await upsertMutation.mutateAsync({
        organizationId,
        payload: {
          tenantId: tenantId.trim(),
          clientId: clientId.trim(),
          clientSecretRef: clientSecretRef.trim() || undefined,
          redirectUri: redirectUri.trim(),
          domains,
          primaryDomain: primaryDomain.trim().toLowerCase(),
        },
      });

      setLocalMessage('SSO configuration saved. Verify each domain to activate login routing.');
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : 'Could not save SSO settings.',
      );
    }
  };

  const handleVerify = async (domainId: string) => {
    setLocalError(null);
    setLocalMessage(null);

    try {
      await verifyMutation.mutateAsync({
        domainId,
        organizationId,
        verificationToken: verificationInputs[domainId]?.trim() ?? '',
      });
      setLocalMessage('Domain verification updated. End users can now discover SSO by email domain.');
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : 'Could not verify the selected domain.',
      );
    }
  };

  const handleCreateScimToken = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    setLocalMessage(null);
    setLatestSecret(null);

    try {
      const created = await createScimTokenMutation.mutateAsync({
        label: scimTokenLabel.trim(),
      });
      setLatestSecret(created.plainTextToken);
      setLocalMessage('New SCIM token created. Copy it now because it will not be shown again.');
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : 'Could not create SCIM token.',
      );
    }
  };

  const handleRevokeScimToken = async (tokenId: string) => {
    setLocalError(null);
    setLocalMessage(null);

    try {
      await revokeScimTokenMutation.mutateAsync(tokenId);
      setLocalMessage('SCIM token revoked. Future sync calls using that token will fail immediately.');
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : 'Could not revoke SCIM token.',
      );
    }
  };

  return (
    <div className={styles.identityLayout}>
      <section className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Admin setup wizard</h3>
        <p className={styles.sectionDescription}>
          Configure Microsoft Entra once, then verify each company domain before
          employees can use SSO from the login screen.
        </p>

        <form className={styles.identityForm} onSubmit={(event) => void handleSubmit(event)}>
          <label className={styles.fieldLabel} htmlFor="tenantId">
            Entra tenant ID
          </label>
          <input id="tenantId" className={styles.fieldInput} value={tenantId} onChange={(event) => setTenantId(event.target.value)} placeholder="00000000-0000-0000-0000-000000000000" required disabled={upsertMutation.isPending || configurationQuery.isLoading} />

          <label className={styles.fieldLabel} htmlFor="clientId">
            Application client ID
          </label>
          <input id="clientId" className={styles.fieldInput} value={clientId} onChange={(event) => setClientId(event.target.value)} placeholder="11111111-1111-1111-1111-111111111111" required disabled={upsertMutation.isPending || configurationQuery.isLoading} />

          <label className={styles.fieldLabel} htmlFor="clientSecretRef">
            Client secret reference
          </label>
          <input id="clientSecretRef" className={styles.fieldInput} value={clientSecretRef} onChange={(event) => setClientSecretRef(event.target.value)} placeholder="kv://prod/entra/password-vault-manager" disabled={upsertMutation.isPending || configurationQuery.isLoading} />

          <label className={styles.fieldLabel} htmlFor="redirectUri">
            Redirect URI
          </label>
          <input id="redirectUri" className={styles.fieldInput} value={redirectUri} onChange={(event) => setRedirectUri(event.target.value)} placeholder="https://app.example.com/login/sso/callback" required disabled={upsertMutation.isPending || configurationQuery.isLoading} />

          <label className={styles.fieldLabel} htmlFor="domainsInput">
            Company domains
          </label>
          <input id="domainsInput" className={styles.fieldInput} value={domainsInput} onChange={(event) => setDomainsInput(event.target.value)} placeholder="example.com, sub.example.com" required disabled={upsertMutation.isPending || configurationQuery.isLoading} />

          <label className={styles.fieldLabel} htmlFor="primaryDomain">
            Primary login domain
          </label>
          <input id="primaryDomain" className={styles.fieldInput} value={primaryDomain} onChange={(event) => setPrimaryDomain(event.target.value)} placeholder="example.com" required disabled={upsertMutation.isPending || configurationQuery.isLoading} />

          <button type="submit" className={styles.primaryButton} disabled={upsertMutation.isPending || configurationQuery.isLoading}>
            {upsertMutation.isPending ? 'Saving SSO...' : 'Save SSO Configuration'}
          </button>
        </form>
      </section>

      <section className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Identity status</h3>
        {configurationQuery.isLoading && <p className={styles.sectionDescription}>Loading SSO status...</p>}
        {!configurationQuery.isLoading && !configuration && (
          <p className={styles.sectionDescription}>
            No SSO configuration exists yet. Complete the admin setup form to
            generate domain verification tokens and enable login discovery.
          </p>
        )}
        {configuration && (
          <>
            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <span className={styles.statusLabel}>Provider</span>
                <strong className={styles.statusValue}>Microsoft Entra</strong>
              </div>
              <div className={styles.statusCard}>
                <span className={styles.statusLabel}>Issuer</span>
                <strong className={styles.statusValue}>{configuration.issuer}</strong>
              </div>
              <div className={styles.statusCard}>
                <span className={styles.statusLabel}>Active domains</span>
                <strong className={styles.statusValue}>{configuration.domains.length}</strong>
              </div>
            </div>

            <div className={styles.domainList}>
              {domainSummaries.map((domain) => (
                <article key={domain.domainId} className={styles.domainCard}>
                  <div className={styles.domainHeader}>
                    <div>
                      <h4 className={styles.domainTitle}>{domain.domain}</h4>
                      <p className={styles.domainMeta}>{domain.isPrimary ? 'Primary domain' : 'Secondary domain'}</p>
                    </div>
                    <span className={domain.verifiedAt ? styles.domainBadgeVerified : styles.domainBadgePending}>
                      {domain.verifiedAt ? 'Verified' : 'Pending verification'}
                    </span>
                  </div>

                  <p className={styles.tokenLabel}>Verification token</p>
                  <code className={styles.tokenValue}>{domain.verificationToken}</code>
                  <p className={styles.domainMeta}>
                    Add this value to your DNS verification step, then confirm it here when ready.
                  </p>

                  <div className={styles.verifyRow}>
                    <input className={styles.fieldInput} value={verificationInputs[domain.domainId] ?? ''} onChange={(event) => setVerificationInputs((current) => ({ ...current, [domain.domainId]: event.target.value }))} placeholder="Paste verification token" disabled={verifyMutation.isPending} />
                    <button type="button" className={styles.secondaryButton} disabled={verifyMutation.isPending || Boolean(domain.verifiedAt)} onClick={() => void handleVerify(domain.domainId)}>
                      {domain.verifiedAt ? 'Verified' : 'Confirm Domain'}
                    </button>
                  </div>

                  {domain.verifiedAt && <p className={styles.domainMeta}>Verified {new Date(domain.verifiedAt).toLocaleString()}</p>}
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <section className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>SCIM diagnostics</h3>
        <p className={styles.sectionDescription}>
          Issue workspace-specific bearer tokens, monitor provisioning health, and review recent SCIM activity from one place.
        </p>

        {!hasVerifiedDomain && (
          <p className={styles.warningText}>
            Verify at least one SSO domain before handing SCIM details to your identity provider so authentication and provisioning stay aligned.
          </p>
        )}

        {scimDiagnosticsQuery.isLoading && <p className={styles.sectionDescription}>Loading SCIM diagnostics...</p>}
        {scimDiagnostics && (
          <>
            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <span className={styles.statusLabel}>Active tokens</span>
                <strong className={styles.statusValue}>{scimDiagnostics.tokenStatus.activeTokenCount}</strong>
              </div>
              <div className={styles.statusCard}>
                <span className={styles.statusLabel}>Last successful sync</span>
                <strong className={styles.statusValue}>{formatTimestamp(scimDiagnostics.provisioningStatus.lastSuccessAt)}</strong>
              </div>
              <div className={styles.statusCard}>
                <span className={styles.statusLabel}>Recent failures</span>
                <strong className={styles.statusValue}>{scimDiagnostics.provisioningStatus.recentFailureCount}</strong>
              </div>
            </div>

            <div className={styles.endpointCard}>
              <p className={styles.tokenLabel}>SCIM base URL</p>
              <code className={styles.tokenValue}>{scimDiagnostics.endpoints.baseUrl}</code>
              <p className={styles.domainMeta}>Users: {scimDiagnostics.endpoints.usersUrl}</p>
              <p className={styles.domainMeta}>Groups: {scimDiagnostics.endpoints.groupsUrl}</p>
            </div>
          </>
        )}

        <form className={styles.identityForm} onSubmit={(event) => void handleCreateScimToken(event)}>
          <label className={styles.fieldLabel} htmlFor="scimTokenLabel">
            New SCIM token label
          </label>
          <input id="scimTokenLabel" className={styles.fieldInput} value={scimTokenLabel} onChange={(event) => setScimTokenLabel(event.target.value)} placeholder="Azure AD production sync" required disabled={createScimTokenMutation.isPending} />
          <button type="submit" className={styles.primaryButton} disabled={createScimTokenMutation.isPending || scimTokenLabel.trim().length < 2}>
            {createScimTokenMutation.isPending ? 'Creating token...' : 'Create SCIM Token'}
          </button>
        </form>

        {latestSecret && (
          <div className={styles.secretCard}>
            <p className={styles.tokenLabel}>New bearer token</p>
            <code className={styles.tokenValue}>{latestSecret}</code>
            <p className={styles.domainMeta}>Copy this value now. It is only shown once.</p>
          </div>
        )}

        {scimDiagnostics?.tokens.length ? (
          <div className={styles.domainList}>
            {scimDiagnostics.tokens.map((token) => (
              <article key={token.tokenId} className={styles.domainCard}>
                <div className={styles.domainHeader}>
                  <div>
                    <h4 className={styles.domainTitle}>{token.label}</h4>
                    <p className={styles.domainMeta}>Prefix: {token.tokenPrefix}</p>
                  </div>
                  <span className={token.revokedAt ? styles.domainBadgePending : styles.domainBadgeVerified}>
                    {token.revokedAt ? 'Revoked' : 'Active'}
                  </span>
                </div>
                <p className={styles.domainMeta}>Created {formatTimestamp(token.createdAt)}</p>
                <p className={styles.domainMeta}>Last used {formatTimestamp(token.lastUsedAt)}</p>
                {!token.revokedAt && (
                  <button type="button" className={styles.secondaryButton} disabled={revokeScimTokenMutation.isPending} onClick={() => void handleRevokeScimToken(token.tokenId)}>
                    Revoke Token
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.sectionDescription}>No SCIM tokens issued yet.</p>
        )}

        {scimDiagnostics?.recentEvents.length ? (
          <div className={styles.logList}>
            {scimDiagnostics.recentEvents.map((event) => (
              <article key={event.eventId} className={styles.logCard}>
                <div className={styles.domainHeader}>
                  <div>
                    <h4 className={styles.domainTitle}>{event.action}</h4>
                    <p className={styles.domainMeta}>{event.resourceType}{event.resourceId ? ` · ${event.resourceId}` : ''}</p>
                  </div>
                  <span className={event.status === 'success' ? styles.domainBadgeVerified : styles.domainBadgePending}>
                    {event.status}
                  </span>
                </div>
                <p className={styles.domainMeta}>{event.detail || 'No extra detail captured.'}</p>
                <p className={styles.domainMeta}>{formatTimestamp(event.createdAt)}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.sectionDescription}>No provisioning events recorded yet.</p>
        )}
      </section>

      {(localMessage || localError || configurationQuery.isError || scimDiagnosticsQuery.isError) && (
        <p className={localError || configurationQuery.isError || scimDiagnosticsQuery.isError ? styles.errorText : styles.successText}>
          {localError ||
            (configurationQuery.error instanceof Error ? configurationQuery.error.message : null) ||
            (scimDiagnosticsQuery.error instanceof Error ? scimDiagnosticsQuery.error.message : null) ||
            localMessage}
        </p>
      )}
    </div>
  );
}
