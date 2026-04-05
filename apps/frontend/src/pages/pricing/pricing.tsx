import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useBillingCatalog,
  useCreateCheckoutSession,
} from '../../hooks/useBilling';
import * as styles from './pricing.css';

type Interval = 'monthly' | 'yearly';

export default function PricingPage() {
  const [interval, setInterval] = useState<Interval>('monthly');
  const catalogQuery = useBillingCatalog();
  const checkoutMutation = useCreateCheckoutSession();

  const cards = useMemo(() => {
    if (!catalogQuery.data) {
      return [];
    }

    return [
      {
        plan: 'family' as const,
        title: 'Family Plan',
        description:
          'Shared vaults, secure family collaboration, and recovery controls for household members.',
        highlights: [
          'Up to 6 members with owner, adult, and child roles',
          'Emergency access and shared family vaults',
          'Soft warning at 5 of 6 seats used',
        ],
        exclusions: [
          'No SSO or SCIM provisioning',
          'No enterprise audit export integrations',
          'No advanced admin policy engine',
        ],
        priceId:
          interval === 'monthly'
            ? catalogQuery.data.family.monthlyPriceId
            : catalogQuery.data.family.yearlyPriceId,
      },
      {
        plan: 'business' as const,
        title: 'Business Plan',
        description:
          'Team-grade governance, collaboration controls, and billing admin for organizations.',
        highlights: [
          'Up to 250 managed seats in self-serve mode',
          'Seat utilization, central billing, and role-based admin',
          'Business collaboration with external share controls',
        ],
        exclusions: [
          'SSO and SCIM require enterprise add-ons',
          'SIEM connector is post-launch',
        ],
        addOns: [
          'SSO Pack',
          'SCIM Pack',
          'Audit & Export Pack',
          'SIEM Connector Pack (post-launch)',
        ],
        priceId:
          interval === 'monthly'
            ? catalogQuery.data.business.monthlyPriceId
            : catalogQuery.data.business.yearlyPriceId,
      },
    ];
  }, [catalogQuery.data, interval]);

  const handleCheckout = async (plan: 'family' | 'business') => {
    const response = await checkoutMutation.mutateAsync({ plan, interval });
    window.location.assign(response.checkoutUrl);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Pricing and Plans</h1>
        <p className={styles.subheading}>
          Choose a billing plan and continue to secure checkout.
        </p>

        <div className={styles.intervalSwitcher}>
          <button
            type="button"
            className={`${styles.intervalButton} ${interval === 'monthly' ? styles.intervalButtonActive : ''}`}
            onClick={() => setInterval('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`${styles.intervalButton} ${interval === 'yearly' ? styles.intervalButtonActive : ''}`}
            onClick={() => setInterval('yearly')}
          >
            Yearly
          </button>
        </div>

        {catalogQuery.isLoading && <p>Loading pricing catalog...</p>}
        {catalogQuery.isError && (
          <p className={styles.errorText}>
            Failed to load pricing catalog. Please retry in a moment.
          </p>
        )}

        <div className={styles.cards}>
          {cards.map((card) => (
            <article key={card.plan} className={styles.card}>
              <h2 className={styles.cardTitle}>{card.title}</h2>
              <p className={styles.cardDescription}>{card.description}</p>
              <div className={styles.featureBlock}>
                <p className={styles.featureLabel}>Included</p>
                <ul className={styles.featureList}>
                  {card.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.featureBlock}>
                <p className={styles.featureLabel}>Not included</p>
                <ul className={styles.featureList}>
                  {card.exclusions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              {'addOns' in card && card.addOns ? (
                <div className={styles.featureBlock}>
                  <p className={styles.featureLabel}>Enterprise add-ons</p>
                  <ul className={styles.featureList}>
                    {card.addOns.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <p className={styles.priceId}>Price ID: {card.priceId}</p>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => handleCheckout(card.plan)}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending
                  ? 'Redirecting...'
                  : `Start ${interval} checkout`}
              </button>
            </article>
          ))}
        </div>

        {checkoutMutation.isError && (
          <p className={styles.errorText}>
            Could not create checkout session. Verify organization context and try
            again.
          </p>
        )}

        <Link to="/settings/billing" className={styles.secondaryLink}>
          Go to billing settings
        </Link>
      </div>
    </div>
  );
}

