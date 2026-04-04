import { Link } from 'react-router-dom';
import {
  useCreateBillingPortalSession,
  useEntitlements,
  useInvoices,
  useSubscriptionState,
} from '../../hooks/useBilling';
import * as styles from './billing-settings.css';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export default function BillingSettingsPage() {
  const subscriptionQuery = useSubscriptionState();
  const entitlementsQuery = useEntitlements();
  const invoicesQuery = useInvoices();
  const portalMutation = useCreateBillingPortalSession();

  const openPortal = async () => {
    const session = await portalMutation.mutateAsync();
    window.location.assign(session.url);
  };

  const hasSubscription = subscriptionQuery.isSuccess;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Billing Settings</h1>
        <p className={styles.subheading}>
          Plan state, seat utilization, invoices, and billing controls.
        </p>

        {!hasSubscription && (
          <div className={styles.prompt}>
            No active subscription is configured for this organization yet.
            <br />
            <Link to="/pricing" className={styles.link}>
              Upgrade or start a plan
            </Link>
          </div>
        )}

        {entitlementsQuery.isSuccess && !entitlementsQuery.data.features.externalShares && (
          <div className={styles.prompt}>
            External share capability is currently locked for this plan state.
            <br />
            <Link to="/pricing" className={styles.link}>
              Upgrade plan to unlock business sharing features
            </Link>
          </div>
        )}

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Current Plan</h2>
            {subscriptionQuery.isSuccess ? (
              <>
                <p className={styles.cardText}>
                  Plan: {subscriptionQuery.data.planType} (
                  {subscriptionQuery.data.billingInterval})
                </p>
                <p className={styles.cardText}>
                  Lifecycle: {subscriptionQuery.data.lifecycleStatus}
                </p>
                <p className={styles.cardText}>
                  Next cycle end:{' '}
                  {subscriptionQuery.data.currentPeriodEndAt
                    ? new Date(
                        subscriptionQuery.data.currentPeriodEndAt,
                      ).toLocaleDateString()
                    : 'n/a'}
                </p>
                <button
                  type="button"
                  className={styles.button}
                  onClick={openPortal}
                  disabled={portalMutation.isPending}
                >
                  {portalMutation.isPending
                    ? 'Opening portal...'
                    : 'Open Billing Portal'}
                </button>
              </>
            ) : (
              <p className={styles.cardText}>No plan attached yet.</p>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Seat Utilization</h2>
            {entitlementsQuery.isSuccess ? (
              <>
                <p className={styles.cardText}>
                  Used seats: {entitlementsQuery.data.seats.used}
                </p>
                <p className={styles.cardText}>
                  Max seats: {entitlementsQuery.data.seats.max}
                </p>
                <p className={styles.cardText}>
                  Available seats: {entitlementsQuery.data.seats.available}
                </p>
              </>
            ) : (
              <p className={styles.cardText}>Seat metrics unavailable.</p>
            )}
          </section>
        </div>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Invoices</h2>
          {invoicesQuery.isSuccess && invoicesQuery.data.invoices.length > 0 ? (
            <table className={styles.invoiceTable}>
              <thead>
                <tr>
                  <th className={styles.th}>Invoice</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Amount Due</th>
                  <th className={styles.th}>Amount Paid</th>
                  <th className={styles.th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {invoicesQuery.data.invoices.map((invoice) => (
                  <tr key={invoice.invoiceId}>
                    <td className={styles.td}>
                      {invoice.hostedInvoiceUrl ? (
                        <a
                          className={styles.link}
                          href={invoice.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {invoice.number ?? invoice.invoiceId}
                        </a>
                      ) : (
                        invoice.number ?? invoice.invoiceId
                      )}
                    </td>
                    <td className={styles.td}>{invoice.status ?? 'unknown'}</td>
                    <td className={styles.td}>
                      {formatCurrency(invoice.amountDue, invoice.currency)}
                    </td>
                    <td className={styles.td}>
                      {formatCurrency(invoice.amountPaid, invoice.currency)}
                    </td>
                    <td className={styles.td}>
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.cardText}>No invoices available yet.</p>
          )}
        </section>

        {(subscriptionQuery.isError || entitlementsQuery.isError || invoicesQuery.isError) && (
          <p className={styles.errorText}>
            Some billing data could not be loaded. Please refresh or verify your
            billing setup.
          </p>
        )}

        <Link to="/pricing" className={styles.link}>
          View pricing and upgrade options
        </Link>
      </div>
    </div>
  );
}

