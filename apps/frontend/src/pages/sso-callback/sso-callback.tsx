import { Link, useSearchParams } from 'react-router-dom';
import { useSsoCallback } from '../../hooks/useSso';
import * as styles from './sso-callback.css';

export default function SsoCallbackPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') ?? '';
  const state = searchParams.get('state') ?? '';
  const callbackQuery = useSsoCallback(code, state, Boolean(code && state));

  if (!code || !state) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>SSO callback is incomplete</h1>
          <p className={styles.text}>
            The identity provider did not return the required callback values.
            Start again from the login page.
          </p>
          <Link to="/login" className={styles.linkButton}>
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Enterprise sign-in status</h1>
        {callbackQuery.isLoading && (
          <p className={styles.text}>
            Confirming your SSO callback and validating the organization route...
          </p>
        )}
        {callbackQuery.isError && (
          <>
            <p className={styles.errorText}>
              {callbackQuery.error instanceof Error
                ? callbackQuery.error.message
                : 'SSO verification failed. Please try again.'}
            </p>
            <Link to="/login" className={styles.linkButton}>
              Try Again
            </Link>
          </>
        )}
        {callbackQuery.data && (
          <>
            <div className={styles.statusPanel}>
              <p className={styles.kicker}>Identity verified</p>
              <p className={styles.text}>
                Microsoft Entra confirmed the login request for the
                <strong> {callbackQuery.data.emailDomain}</strong> domain.
              </p>
              <p className={styles.text}>
                Organization: {callbackQuery.data.organizationId}
              </p>
              <p className={styles.text}>
                Provider: {callbackQuery.data.provider}
              </p>
            </div>
            <div className={styles.noticeCard}>
              <p className={styles.noticeTitle}>Foundation release note</p>
              <p className={styles.text}>
                The callback is validated and ready for enterprise token
                exchange. This launch slice stops after identity verification so
                admins can confirm routing and setup status safely.
              </p>
            </div>
            <div className={styles.actions}>
              <Link to="/login" className={styles.linkButton}>
                Back to Login
              </Link>
              <Link to="/settings/organization/identity" className={styles.secondaryLink}>
                Review Identity Settings
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
