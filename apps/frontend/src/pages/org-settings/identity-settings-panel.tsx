import { FormEvent, useEffect, useState } from 'react';
import { useSsoConfiguration, useUpsertSsoConfiguration, useVerifySsoDomain } from '../../hooks/useSso';
import type { SsoDomainSummary } from '../../services/sso.service';
import * as styles from './org-settings.css';

interface IdentitySettingsPanelProps {
  organizationType: 'personal' | 'family' | 'business' | null;
}

function formatDomains(domains: SsoDomainSummary[]) {
  return domains.map((domain) => domain.domain).join(', ');
}

export function IdentitySettingsPanel({
  organizationType,
}: IdentitySettingsPanelProps) {
  const configurationQuery = useSsoConfiguration(organizationType === 'business');
  const upsertMutation = useUpsertSsoConfiguration();
  const verifyMutation = useVerifySsoDomain();

  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecretRef, setClientSecretRef] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [domainsInput, setDomainsInput] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [verificationInputs, setVerificationInputs] = useState<
    Record<string, string>
  >({});
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const configuration = configurationQuery.data;
  const domainSummaries = configuration?.domains ?? [];

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

  if (organizationType !== 'business') {
    return (
      <div className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Enterprise identity controls</h3>
        <p className={styles.sectionDescription}>
          SSO setup is available for business workspaces. Switch into a business
          organization to manage Microsoft Entra sign-in.
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
        tenantId: tenantId.trim(),
        clientId: clientId.trim(),
        clientSecretRef: clientSecretRef.trim() || undefined,
        redirectUri: redirectUri.trim(),
        domains,
        primaryDomain: primaryDomain.trim().toLowerCase(),
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
        verificationToken: verificationInputs[domainId]?.trim() ?? '',
      });
      setLocalMessage('Domain verification updated. End users can now discover SSO by email domain.');
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : 'Could not verify the selected domain.',
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
          <input
            id="tenantId"
            className={styles.fieldInput}
            value={tenantId}
            onChange={(event) => setTenantId(event.target.value)}
            placeholder="00000000-0000-0000-0000-000000000000"
            required
            disabled={upsertMutation.isPending || configurationQuery.isLoading}
          />

          <label className={styles.fieldLabel} htmlFor="clientId">
            Application client ID
          </label>
          <input
            id="clientId"
            className={styles.fieldInput}
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            placeholder="11111111-1111-1111-1111-111111111111"
            required
            disabled={upsertMutation.isPending || configurationQuery.isLoading}
          />

          <label className={styles.fieldLabel} htmlFor="clientSecretRef">
            Client secret reference
          </label>
          <input
            id="clientSecretRef"
            className={styles.fieldInput}
            value={clientSecretRef}
            onChange={(event) => setClientSecretRef(event.target.value)}
            placeholder="kv://prod/entra/password-vault-manager"
            disabled={upsertMutation.isPending || configurationQuery.isLoading}
          />

          <label className={styles.fieldLabel} htmlFor="redirectUri">
            Redirect URI
          </label>
          <input
            id="redirectUri"
            className={styles.fieldInput}
            value={redirectUri}
            onChange={(event) => setRedirectUri(event.target.value)}
            placeholder="https://app.example.com/login/sso/callback"
            required
            disabled={upsertMutation.isPending || configurationQuery.isLoading}
          />

          <label className={styles.fieldLabel} htmlFor="domainsInput">
            Company domains
          </label>
          <input
            id="domainsInput"
            className={styles.fieldInput}
            value={domainsInput}
            onChange={(event) => setDomainsInput(event.target.value)}
            placeholder="example.com, sub.example.com"
            required
            disabled={upsertMutation.isPending || configurationQuery.isLoading}
          />

          <label className={styles.fieldLabel} htmlFor="primaryDomain">
            Primary login domain
          </label>
          <input
            id="primaryDomain"
            className={styles.fieldInput}
            value={primaryDomain}
            onChange={(event) => setPrimaryDomain(event.target.value)}
            placeholder="example.com"
            required
            disabled={upsertMutation.isPending || configurationQuery.isLoading}
          />

          <button
            type="submit"
            className={styles.primaryButton}
            disabled={upsertMutation.isPending || configurationQuery.isLoading}
          >
            {upsertMutation.isPending ? 'Saving SSO...' : 'Save SSO Configuration'}
          </button>
        </form>
      </section>

      <section className={styles.calloutCard}>
        <h3 className={styles.calloutTitle}>Identity status</h3>
        {configurationQuery.isLoading && (
          <p className={styles.sectionDescription}>Loading SSO status...</p>
        )}
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
                      <p className={styles.domainMeta}>
                        {domain.isPrimary ? 'Primary domain' : 'Secondary domain'}
                      </p>
                    </div>
                    <span
                      className={
                        domain.verifiedAt
                          ? styles.domainBadgeVerified
                          : styles.domainBadgePending
                      }
                    >
                      {domain.verifiedAt ? 'Verified' : 'Pending verification'}
                    </span>
                  </div>

                  <p className={styles.tokenLabel}>Verification token</p>
                  <code className={styles.tokenValue}>{domain.verificationToken}</code>
                  <p className={styles.domainMeta}>
                    Add this value to your DNS verification step, then confirm it
                    here when ready.
                  </p>

                  <div className={styles.verifyRow}>
                    <input
                      className={styles.fieldInput}
                      value={verificationInputs[domain.domainId] ?? ''}
                      onChange={(event) =>
                        setVerificationInputs((current) => ({
                          ...current,
                          [domain.domainId]: event.target.value,
                        }))
                      }
                      placeholder="Paste verification token"
                      disabled={verifyMutation.isPending}
                    />
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      disabled={verifyMutation.isPending || Boolean(domain.verifiedAt)}
                      onClick={() => void handleVerify(domain.domainId)}
                    >
                      {domain.verifiedAt ? 'Verified' : 'Confirm Domain'}
                    </button>
                  </div>

                  {domain.verifiedAt && (
                    <p className={styles.domainMeta}>
                      Verified {new Date(domain.verifiedAt).toLocaleString()}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </>
        )}

        {(localMessage || localError || configurationQuery.isError) && (
          <p className={localError || configurationQuery.isError ? styles.errorText : styles.successText}>
            {localError ||
              (configurationQuery.error instanceof Error
                ? configurationQuery.error.message
                : null) ||
              localMessage}
          </p>
        )}
      </section>
    </div>
  );
}
