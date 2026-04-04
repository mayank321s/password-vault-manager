import { Link, Navigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useOrganizationContext } from '../../contexts/OrganizationContext';
import { IdentitySettingsPanel } from './identity-settings-panel';
import * as styles from './org-settings.css';

const sections = [
  {
    key: 'policy',
    label: 'Policy',
    title: 'Organization Policy Settings',
    description:
      'Configure organization-wide security controls such as MFA requirements, sharing restrictions, and session behavior.',
  },
  {
    key: 'billing',
    label: 'Billing',
    title: 'Billing and Subscription Settings',
    description:
      'Manage plan details, upcoming renewals, invoices, and seat consumption for the active organization.',
  },
  {
    key: 'identity',
    label: 'Identity',
    title: 'Identity and Access Settings',
    description:
      'Set up identity providers, role defaults, and other organization access controls in a single place.',
  },
  {
    key: 'family',
    label: 'Family',
    title: 'Family Workspace Setup',
    description:
      'Run the guided family onboarding wizard and manage owner/adult/child role assignments.',
  },
] as const;

type SectionKey = (typeof sections)[number]['key'];

function isSectionKey(value: string | undefined): value is SectionKey {
  return sections.some((section) => section.key === value);
}

export default function OrgSettingsPage() {
  const { section } = useParams<{ section?: string }>();
  const { activeOrganizationId, activeOrganizationType } = useOrganizationContext();

  if (!section) {
    return <Navigate to="/settings/organization/policy" replace />;
  }

  if (!isSectionKey(section)) {
    return <Navigate to="/404" replace />;
  }

  const currentSection = useMemo(
    () => sections.find((entry) => entry.key === section)!,
    [section],
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Organization Settings</h1>
        <p className={styles.subheading}>
          Centralized admin shell for policy, billing, and identity controls.
        </p>

        <nav className={styles.tabRow} aria-label="Organization settings sections">
          {sections.map((entry) => (
            <Link
              key={entry.key}
              to={`/settings/organization/${entry.key}`}
              className={`${styles.tabButton} ${entry.key === section ? styles.tabButtonActive : ''}`}
            >
              {entry.label}
            </Link>
          ))}
        </nav>

        <section className={styles.sectionPanel}>
          <h2 className={styles.sectionTitle}>{currentSection.title}</h2>
          <p className={styles.sectionDescription}>
            {currentSection.description}
          </p>
          {section === 'billing' && (
            <p className={styles.sectionDescription} style={{ marginTop: '0.75rem' }}>
              <Link to="/settings/billing" className={styles.billingLink}>
                Open full billing settings
              </Link>
            </p>
          )}
          {section === 'family' && (
            <>
              <p className={styles.sectionDescription} style={{ marginTop: '0.75rem' }}>
                <Link to="/family/onboarding" className={styles.billingLink}>
                  Open family onboarding wizard
                </Link>
              </p>
              <p className={styles.sectionDescription} style={{ marginTop: '0.75rem' }}>
                <Link to="/settings/emergency-access" className={styles.billingLink}>
                  Manage emergency access
                </Link>
              </p>
            </>
          )}
          {section === 'identity' && (
            <div className={styles.embeddedSection}>
              <IdentitySettingsPanel
                organizationId={activeOrganizationId}
                organizationType={activeOrganizationType}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
