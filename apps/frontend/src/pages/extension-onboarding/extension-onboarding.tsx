import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as styles from './extension-onboarding.css';

type SupportedBrowser = 'chromium' | 'firefox' | 'safari';

const ONBOARDING_COMPLETE_KEY = 'extension_onboarding_complete';

const browserContent: Record<
  SupportedBrowser,
  {
    title: string;
    meta: string;
    description: string;
    installLabel: string;
    steps: { title: string; text: string }[];
  }
> = {
  chromium: {
    title: 'Chrome and Edge',
    meta: 'Fastest setup',
    description:
      'Install the Chromium build, unlock once, and confirm the paired browser before enabling save and autofill.',
    installLabel: 'Open Chrome Web Store checklist',
    steps: [
      {
        title: 'Install the extension package',
        text: 'Use the Chrome Web Store flow for Chrome or Edge Add-ons flow for Edge, then pin the extension so the trust prompts stay visible.',
      },
      {
        title: 'Unlock and pair this browser',
        text: 'Open the extension from the toolbar, sign in, and confirm the browser pairing prompt from a trusted vault session.',
      },
      {
        title: 'Verify a trusted origin',
        text: 'Start on a site you know, review the trust banner, and only approve autofill when the host matches the credential origin.',
      },
    ],
  },
  firefox: {
    title: 'Firefox',
    meta: 'Parity supported',
    description:
      'Firefox uses the same credential engine with browser-style manifest and autofill behavior tuned for Firefox field ordering.',
    installLabel: 'Open Firefox Add-ons checklist',
    steps: [
      {
        title: 'Install from Firefox Add-ons',
        text: 'Load the Firefox package, then pin it to the toolbar so save and pairing prompts are easy to find.',
      },
      {
        title: 'Confirm browser pairing',
        text: 'Approve the Firefox browser identity from a live vault session before allowing credential access.',
      },
      {
        title: 'Run the trust check',
        text: 'Use a known login page first and confirm the extension marks the site as trusted before you rely on autofill.',
      },
    ],
  },
  safari: {
    title: 'Safari',
    meta: 'Release-readiness path',
    description:
      'Safari support depends on the signed app-extension bundle. The web app now guides trust confirmation while the native signing flow is prepared.',
    installLabel: 'Review Safari signing checklist',
    steps: [
      {
        title: 'Prepare the signed extension build',
        text: 'Use the Safari app-extension package signed with the expected app bundle ID, extension bundle ID, and app group.',
      },
      {
        title: 'Approve the paired browser',
        text: 'Open the Safari extension after install and verify the browser identity from your vault session before using autofill.',
      },
      {
        title: 'Confirm safe trust boundaries',
        text: 'Approve trusted origins only, and verify that unsupported or lookalike domains remain blocked before rollout.',
      },
    ],
  },
};

export default function ExtensionOnboardingPage() {
  const [selectedBrowser, setSelectedBrowser] =
    useState<SupportedBrowser>('chromium');
  const [isComplete, setIsComplete] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
  });

  const content = useMemo(
    () => browserContent[selectedBrowser],
    [selectedBrowser],
  );

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    }
    setIsComplete(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Extension Onboarding</p>
          <h1 className={styles.title}>
            Install confidently and confirm trust before autofill.
          </h1>
          <p className={styles.lead}>
            This guide walks users through extension setup, browser pairing, and
            trust confirmation across supported browsers so save and autofill
            start from a safe baseline.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#browser-guides">
              Start Setup
            </a>
            <Link className={styles.secondaryButton} to="/vaults">
              Back to Vaults
            </Link>
          </div>
        </header>

        <section className={styles.browserGrid} id="browser-guides">
          {Object.entries(browserContent).map(([browser, details]) => {
            const isActive = browser === selectedBrowser;
            return (
              <div
                key={browser}
                className={`${styles.browserCard} ${isActive ? styles.browserCardActive : ''}`}
              >
                <button
                  type="button"
                  className={styles.browserButton}
                  onClick={() => setSelectedBrowser(browser as SupportedBrowser)}
                >
                  <p className={styles.browserMeta}>{details.meta}</p>
                  <h2 className={styles.browserTitle}>{details.title}</h2>
                  <p className={styles.browserText}>{details.description}</p>
                </button>
              </div>
            );
          })}
        </section>

        <div className={styles.contentGrid}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>{content.installLabel}</h2>
            <div className={styles.steps}>
              {content.steps.map((step, index) => (
                <div key={step.title} className={styles.step}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <div>
                    <p className={styles.stepTitle}>{step.title}</p>
                    <p className={styles.stepText}>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className={styles.panel}>
            <h2 className={styles.panelTitle}>Trust Confirmation Checklist</h2>
            <div className={styles.checklist}>
              <div className={styles.checklistItem}>
                <span className={styles.check}>1</span>
                <span>Pair the browser from an unlocked vault session before approving any credential access.</span>
              </div>
              <div className={styles.checklistItem}>
                <span className={styles.check}>2</span>
                <span>Approve autofill only after the displayed site matches the credential origin you expect.</span>
              </div>
              <div className={styles.checklistItem}>
                <span className={styles.check}>3</span>
                <span>Use save or update prompts only on pages you trust. Lookalike domains should remain blocked.</span>
              </div>
              <div className={styles.checklistItem}>
                <span className={styles.check}>4</span>
                <span>Re-run pairing if you switch browsers, profiles, or devices so old trust records do not leak forward.</span>
              </div>
            </div>

            <div className={styles.completionBox}>
              <p className={styles.completionText}>
                {isComplete
                  ? 'Extension onboarding is marked complete in this browser. You can return to vaults and start using the guided prompts.'
                  : 'When you have installed the extension and verified the trust prompt, mark this setup complete to hide the in-product onboarding reminder.'}
              </p>
              {!isComplete && (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleComplete}
                >
                  Mark Setup Complete
                </button>
              )}
              <Link className={styles.helperLink} to="/settings/organization/security">
                Review security settings
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
