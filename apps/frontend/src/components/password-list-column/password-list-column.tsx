import type { PasswordListColumnProps } from './password-list-column.type';
import * as styles from './password-list-column.css';
import * as panelStyles from '../../common/css/panel.css';
import { PiNoteFill, PiPasswordFill } from 'react-icons/pi';

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
