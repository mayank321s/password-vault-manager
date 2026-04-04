import { useVaultListColumn } from './vault-list-column.hook';
import type { VaultListColumnProps } from './vault-list-column.type';
import * as styles from './vault-list-column.css';
import * as panelStyles from '../../common/css/panel.css';
import { IoMdSettings } from 'react-icons/io';
import { PiVaultFill } from 'react-icons/pi';
import { FaVault } from 'react-icons/fa6';
import { FaShareAltSquare } from 'react-icons/fa';
import { SHARED_VAULT_ID } from '../../common/constants';

export default function VaultListColumn({
  vaults,
  selectedVaultId,
  vaultsLoading,
  vaultsError,
  onSelectVault,
  onOpenSettings,
  onCreateVault,
  onRetry,
  onOrganizationChanged,
}: VaultListColumnProps) {
  const {
    userProfile,
    displayName,
    isDropdownOpen,
    dropdownRef,
    handleToggleDropdown,
    handleSignOut,
    activeOrganizationId,
    organizationIds,
    handleOrganizationChange,
    isOrganizationSwitcherVisible,
  } = useVaultListColumn(onOrganizationChanged);

  const avatarLetter = displayName
    ? displayName.charAt(0).toUpperCase()
    : (userProfile?.email?.charAt(0).toUpperCase() ?? '?');

  const personalVault = vaults.find((v) => v.isPersonalVault);
  const otherVaults = vaults.filter((v) => !v.isPersonalVault);
  const isSharedActive = selectedVaultId === SHARED_VAULT_ID;

  return (
    <aside className={styles.vaultListColumn}>
      <div className={styles.userBannerWrapper} ref={dropdownRef}>
        <div className={styles.userBanner}>
          <div className={styles.userAvatar}>{avatarLetter}</div>
          <div className={styles.userInfo}>
            <div className={styles.userDisplayName}>
              {displayName || userProfile?.email || ''}
            </div>
            {displayName && userProfile?.email && (
              <div className={styles.userEmail}>{userProfile.email}</div>
            )}
          </div>
          <button
            className={styles.userMenuButton}
            onClick={handleToggleDropdown}
            aria-label="User menu"
            aria-expanded={isDropdownOpen}
          >
            ···
          </button>
        </div>

        {isDropdownOpen && (
          <div className={styles.userDropdown} role="menu">
            <button
              className={`${styles.userDropdownItem} ${styles.userDropdownItemDanger}`}
              onClick={handleSignOut}
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      {isOrganizationSwitcherVisible && (
        <div className={styles.organizationSwitcherWrapper}>
          <label className={styles.organizationSwitcherLabel} htmlFor="org-switcher">
            Workspace
          </label>
          <select
            id="org-switcher"
            className={styles.organizationSwitcher}
            value={activeOrganizationId ?? ''}
            onChange={(e) => void handleOrganizationChange(e.target.value)}
          >
            {organizationIds.map((organizationId) => (
              <option key={organizationId} value={organizationId}>
                Org {organizationId.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.vaultListHeader}>
        <div className={styles.vaultListTitle}>Vaults</div>
        <button className={styles.createVaultButton} onClick={onCreateVault}>
          <span>+</span> New Vault
        </button>
      </div>

      <div className={styles.vaultListScroll}>
        {vaultsLoading && (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.vaultListLoadingItem} />
            ))}
          </>
        )}

        {vaultsError && !vaultsLoading && (
          <div className={panelStyles.errorBanner}>
            Failed to load vaults.{' '}
            <button
              onClick={onRetry}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontWeight: 600,
                padding: 0,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!vaultsLoading && !vaultsError && (
          <>
            {/* Personal vault */}
            {personalVault && (
              <div
                key={personalVault.id}
                className={`${styles.vaultItem} ${personalVault.id === selectedVaultId ? styles.vaultItemActive : ''}`}
                onClick={() => onSelectVault(personalVault.id)}
              >
                <div
                  className={`${styles.vaultItemIcon} ${personalVault.id === selectedVaultId ? styles.vaultItemIconActive : ''}`}
                >
                  <FaVault />
                </div>
                <div className={styles.vaultItemContent}>
                  <div
                    className={`${styles.vaultItemName} ${personalVault.id === selectedVaultId ? styles.vaultItemNameActive : ''}`}
                  >
                    {personalVault.name}
                  </div>
                </div>
              </div>
            )}

            {/* Shared virtual vault */}
            <div
              className={`${styles.vaultItem} ${isSharedActive ? styles.vaultItemActive : ''}`}
              onClick={() => onSelectVault(SHARED_VAULT_ID)}
            >
              <div
                className={`${styles.vaultItemIcon} ${isSharedActive ? styles.vaultItemIconActive : ''}`}
              >
                <FaShareAltSquare />
              </div>
              <div className={styles.vaultItemContent}>
                <div
                  className={`${styles.vaultItemName} ${isSharedActive ? styles.vaultItemNameActive : ''}`}
                >
                  Shared
                </div>
              </div>
            </div>

            <div className={styles.vaultListDivider} />

            {/* Other vaults */}
            {otherVaults.map((vault) => {
              const isActive = vault.id === selectedVaultId;
              return (
                <div
                  key={vault.id}
                  className={`${styles.vaultItem} ${isActive ? styles.vaultItemActive : ''}`}
                  onClick={() => onSelectVault(vault.id)}
                >
                  <div
                    className={`${styles.vaultItemIcon} ${isActive ? styles.vaultItemIconActive : ''}`}
                  >
                    <PiVaultFill />
                  </div>
                  <div className={styles.vaultItemContent}>
                    <div
                      className={`${styles.vaultItemName} ${isActive ? styles.vaultItemNameActive : ''}`}
                    >
                      {vault.name}
                    </div>
                  </div>
                  <button
                    className={styles.vaultItemSettingsButton}
                    onClick={(e) => onOpenSettings(vault.id, e)}
                    title="Vault settings"
                  >
                    <IoMdSettings />
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>
    </aside>
  );
}
