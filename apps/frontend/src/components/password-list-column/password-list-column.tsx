import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PasswordListColumnProps } from './password-list-column.type';
import * as styles from './password-list-column.css';
import * as panelStyles from '../../common/css/panel.css';
import { PiNoteFill, PiPasswordFill } from 'react-icons/pi';

const EXTENSION_ONBOARDING_COMPLETE_KEY = 'extension_onboarding_complete';
const EXTENSION_ONBOARDING_DISMISSED_KEY = 'extension_onboarding_prompt_dismissed';

export default function PasswordListColumn({
  vaultName,
  passwords,
  passwordsLoading,
  passwordsError,
  selectedPasswordId,
  searchValue,
  onSearchChange,
  onSelectPassword,
  onAddPassword,
  hideAddButton,
}: PasswordListColumnProps) {
  const [showExtensionPrompt, setShowExtensionPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const isComplete =
      window.localStorage.getItem(EXTENSION_ONBOARDING_COMPLETE_KEY) === 'true';
    const isDismissed =
      window.localStorage.getItem(EXTENSION_ONBOARDING_DISMISSED_KEY) ===
      'true';

    setShowExtensionPrompt(!isComplete && !isDismissed);
  }, []);

  const handleDismissPrompt = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        EXTENSION_ONBOARDING_DISMISSED_KEY,
        'true',
      );
    }
    setShowExtensionPrompt(false);
  };

  return (
    <section className={styles.passwordListColumn}>
      <div className={styles.passwordListHeader}>
        <div className={styles.vaultNameRow}>
          <div className={styles.passwordListVaultName}>{vaultName}</div>
          {!hideAddButton && (
            <button
              className={styles.addPasswordButton}
              onClick={onAddPassword}
              title="Add password"
              aria-label="Add password"
            >
              +
            </button>
          )}
        </div>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search passwords..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            maxLength={30}
          />
        </div>
        {showExtensionPrompt && (
          <div className={styles.extensionPrompt}>
            <div className={styles.extensionPromptBody}>
              <p className={styles.extensionPromptTitle}>
                Finish browser extension setup
              </p>
              <p className={styles.extensionPromptText}>
                Follow the install guide, pair this browser, and confirm trusted
                sites before you rely on save and autofill.
              </p>
              <Link
                className={styles.extensionPromptLink}
                to="/extension/onboarding"
              >
                Open onboarding guide
              </Link>
            </div>
            <button
              type="button"
              className={styles.extensionPromptDismiss}
              onClick={handleDismissPrompt}
              aria-label="Dismiss extension onboarding prompt"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      <div className={styles.passwordListScroll}>
        {passwordsLoading && (
          <div className={panelStyles.loadingCenter}>
            <div className={panelStyles.loadingSpinner} />
          </div>
        )}

        {passwordsError && !passwordsLoading && (
          <div className={panelStyles.errorBanner}>
            Failed to load passwords.
          </div>
        )}

        {!passwordsLoading && !passwordsError && passwords.length === 0 && (
          <div className={styles.passwordListEmpty}>
            <div className={styles.passwordListEmptyIcon}>🔑</div>
            <div className={styles.passwordListEmptyText}>
              {searchValue
                ? 'No passwords match your search.'
                : 'No passwords in this vault yet.'}
            </div>
          </div>
        )}

        {!passwordsLoading &&
          !passwordsError &&
          passwords.map((password) => {
            const isActive = password.id === selectedPasswordId;
            return (
              <div
                key={password.id}
                className={`${styles.passwordItem} ${isActive ? styles.passwordItemActive : ''}`}
                onClick={() => onSelectPassword(password.id)}
              >
                <div className={styles.passwordItemIcon}>
                  {password.isNote ? <PiNoteFill /> : <PiPasswordFill />}
                </div>
                <div className={styles.passwordItemContent}>
                  <div
                    className={`${styles.passwordItemName} ${isActive ? styles.passwordItemNameActive : ''}`}
                  >
                    {password.name}
                  </div>
                  {/* {password.username && (
                    <div className={styles.passwordItemUsername}>
                      {password.username}
                    </div>
                  )} */}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}
