import { PiNoteFill, PiPasswordFill, PiVaultFill } from 'react-icons/pi';
import * as panelStyles from '../../common/css/panel.css';
import { button } from '../../common/css/button.css';
import * as styles from './password-detail-panel.css';
import { usePasswordDetailPanel } from './password-detail-panel.hook';
import type {
  CollapsibleProps,
  PasswordDetailPanelProps,
} from './password-detail-panel.type';
import CreateShareLinkModal from '../create-share-link-modal/create-share-link-modal';
import DeletePasswordDialog from '../delete-password-dialog/delete-password-dialog';

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Collapsible({ label, open, onToggle, children }: CollapsibleProps) {
  return (
    <div className={styles.collapsibleSection}>
      <button className={styles.collapsibleHeader} onClick={onToggle}>
        <span className={styles.collapsibleLabel}>{label}</span>
        <span
          className={`${styles.collapsibleChevron}${open ? ` ${styles.collapsibleChevronOpen}` : ''}`}
        >
          ▶
        </span>
      </button>
      {open && <div className={styles.collapsibleContent}>{children}</div>}
    </div>
  );
}

export default function PasswordDetailPanel(props: PasswordDetailPanelProps) {
  const { isLoading, passwordDetail, sharedItem, vault } = props;
  const {
    closeShareForm,
    closeShareLinkModal,
    copiedField,
    currentUserId,
    decryptError,
    decryptedContent,
    detailsOpen,
    grantMutation,
    handleCopy,
    handleDelete,
    handleEdit,
    handleRevoke,
    handleShare,
    isDecrypting,
    isDeleteDialogOpen,
    isShareFormOpen,
    isShareLinkModalOpen,
    navigate,
    onShareSearchBlur,
    onShareSearchChange,
    onShareSearchFocus,
    onShareSelectUser,
    openShareLinkModal,
    permissions,
    permissionsLoading,
    revokeMutation,
    setDetailsOpen,
    setIsDeleteDialogOpen,
    setSharingOpen,
    shareDropdownOpen,
    shareError,
    shareForm,
    shareSearchQuery,
    shareSuggestions,
    sharingOpen,
    toggleShareForm,
  } = usePasswordDetailPanel(props);

  if (isLoading) {
    return (
      <main className={panelStyles.detailColumn}>
        <div className={panelStyles.loadingCenter}>
          <div className={panelStyles.loadingSpinner} />
        </div>
      </main>
    );
  }

  if (!passwordDetail) {
    return (
      <main className={panelStyles.detailColumn}>
        <div className={styles.detailPlaceholder}>
          <div className={styles.detailPlaceholderIcon}>🔑</div>
          <div className={styles.detailPlaceholderText}>Select a password</div>
          <div className={styles.detailPlaceholderSubtext}>
            Choose a password from the list to view its details.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={panelStyles.detailColumn}>
      <div className={styles.detailScrollArea}>
        {/* ── Header + decrypted content ── */}
        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <div className={styles.detailHeaderIcon}>
              {passwordDetail.isNote ? <PiNoteFill /> : <PiPasswordFill />}
            </div>
            <div className={styles.detailHeaderText}>
              <div className={styles.detailHeaderTitle}>
                {passwordDetail.name}
              </div>
              <div className={styles.detailHeaderType}>
                {passwordDetail.isNote ? 'Secure Note' : 'Password'}
              </div>
            </div>
            {decryptedContent && !sharedItem && (
              <>
                <button
                  className={styles.editButton}
                  onClick={openShareLinkModal}
                  title="Create a one-time share link"
                >
                  Copy link
                </button>
                <button className={styles.editButton} onClick={handleEdit}>
                  Edit
                </button>
                {currentUserId === passwordDetail.createdBy && (
                  <button
                    className={styles.deleteButton}
                    onClick={handleDelete}
                    title="Delete this password"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>

          {isDecrypting && <p className={styles.decryptingText}>Decrypting…</p>}
          {decryptError && (
            <p className={styles.decryptErrorText}>{decryptError}</p>
          )}
          {decryptedContent?.type === 'note' && (
            <div className={styles.noteText}>
              <div className={styles.noteLines}>
                {decryptedContent.content.split('\n').map((line, i) => (
                  <div key={i} className={styles.noteLine}>
                    <span className={styles.noteLineNumber}>{i + 1}</span>
                    <span className={styles.noteLineContent}>
                      {line || ' '}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {decryptedContent?.type === 'password' && (
            <div>
              {decryptedContent.fields.map((field, i) => {
                const key = `field-${i}`;
                const isCopied = copiedField === key;
                return (
                  <div key={i} className={styles.detailFieldRow}>
                    <div className={styles.detailSectionLabel}>
                      {field.label}
                    </div>
                    <div className={styles.fieldValueRow}>
                      <span className={styles.fieldValueText}>
                        {field.value}
                      </span>
                      <button
                        className={`${styles.iconButton}${isCopied ? ` ${styles.iconButtonCopied}` : ''}`}
                        onClick={() => handleCopy(field.value, key)}
                        disabled={isCopied}
                        title={`Copy ${field.label}`}
                      >
                        {isCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Details collapsible ── */}
        <div className={styles.detailCard}>
          <Collapsible
            label="Details"
            open={detailsOpen}
            onToggle={() => setDetailsOpen((v) => !v)}
          >
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Created by</div>
                <div className={styles.metaValue}>
                  {passwordDetail.createdByUserName ?? '—'}
                </div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Created</div>
                <div className={styles.metaValue}>
                  {formatDate(passwordDetail.createdAt)}
                </div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Modified by</div>
                <div className={styles.metaValue}>
                  {passwordDetail.updatedByUserName ?? '—'}
                </div>
              </div>
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Last modified</div>
                <div className={styles.metaValue}>
                  {formatDate(passwordDetail.updatedAt)}
                </div>
              </div>
              {sharedItem && (
                <div className={styles.metaItem}>
                  <div className={styles.metaLabel}>Shared by</div>
                  <div className={styles.metaValue}>
                    {sharedItem.grantedByUserName ?? '—'}
                  </div>
                </div>
              )}
            </div>
          </Collapsible>
        </div>

        {/* ── Sharing collapsible (hidden for passwords shared with the current user) ── */}
        {!sharedItem && (
          <div className={styles.detailCard}>
            <Collapsible
              label="Sharing"
              open={sharingOpen}
              onToggle={() => setSharingOpen((v) => !v)}
            >
              {/* Vault row */}
              <div className={styles.sharingVaultRow}>
                <div className={styles.sharingVaultIcon}>
                  <PiVaultFill />
                </div>
                <span className={styles.sharingVaultName}>
                  {passwordDetail.vaultName}
                </span>
                <span
                  className={`${styles.permissionBadge} ${styles.permissionOwner}`}
                >
                  Edit
                </span>
                <a
                  className={styles.settingsLink}
                  onClick={() =>
                    navigate(`/vaults/${passwordDetail.vaultId}?mode=settings`)
                  }
                  role="button"
                  tabIndex={0}
                >
                  Members →
                </a>
              </div>

              {/* Individual access header + share toggle */}
              <div className={styles.sharingIndividualHeader}>
                <span className={styles.sharingIndividualLabel}>
                  Individual access
                </span>
                <button
                  className={styles.shareToggleButton}
                  onClick={toggleShareForm}
                >
                  {isShareFormOpen ? '✕ Cancel' : '+ Share'}
                </button>
              </div>

              {/* Inline share form */}
              {isShareFormOpen && (
                <div className={styles.shareFormPanel}>
                  <div className={styles.shareInputRow}>
                    <div className={styles.searchInputWrapper}>
                      <input
                        className={styles.shareSearchInput}
                        type="text"
                        placeholder="Search by name or email…"
                        value={shareSearchQuery}
                        disabled={grantMutation.isPending}
                        onChange={(e) => onShareSearchChange(e.target.value)}
                        onFocus={onShareSearchFocus}
                        onBlur={onShareSearchBlur}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && shareForm.selectedUserId)
                            handleShare();
                        }}
                        autoComplete="off"
                        maxLength={30}
                      />
                      {shareDropdownOpen && (
                        <div className={styles.suggestionDropdown}>
                          {!shareSuggestions ||
                          shareSuggestions.users.length === 0 ? (
                            <div className={styles.noSuggestions}>
                              No users found
                            </div>
                          ) : (
                            shareSuggestions.users.map((user) => (
                              <div
                                key={user.id}
                                className={styles.suggestionItem}
                                onMouseDown={() => onShareSelectUser(user)}
                              >
                                <span className={styles.suggestionEmail}>
                                  {user.email}
                                </span>
                                <span className={styles.suggestionUsername}>
                                  {user.username}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {shareError && (
                    <div
                      className={panelStyles.errorBanner}
                      style={{ margin: 0 }}
                    >
                      {shareError}
                    </div>
                  )}
                  <div className={styles.shareFormActions}>
                    <button
                      className={styles.btnSecondary}
                      disabled={grantMutation.isPending}
                      onClick={closeShareForm}
                    >
                      Cancel
                    </button>
                    <button
                      className={button.primarySmall}
                      disabled={
                        grantMutation.isPending || !shareForm.selectedUserId
                      }
                      onClick={handleShare}
                    >
                      {grantMutation.isPending ? 'Sharing…' : 'Share'}
                    </button>
                  </div>
                </div>
              )}

              {/* Individual permissions list */}
              {permissionsLoading ? (
                <div className={panelStyles.loadingCenter}>
                  <div className={panelStyles.loadingSpinner} />
                </div>
              ) : !permissions || permissions.length === 0 ? (
                <p className={styles.decryptingText}>
                  No individual shares outside the vault.
                </p>
              ) : (
                <div className={styles.sharedUsersList}>
                  {permissions.map((perm) => (
                    <div key={perm.userId} className={styles.sharedUserItem}>
                      <div className={styles.sharedUserAvatar}>
                        {(perm.userName ?? perm.userEmail)
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className={styles.sharedUserName}>
                        <div className={styles.sharedUserNameText}>
                          {perm.userName ?? perm.userEmail}
                        </div>
                        <div className={styles.sharedUserEmail}>
                          {perm.userEmail}
                        </div>
                        {perm.grantedByUserName && (
                          <div className={styles.sharedUserGrantedBy}>
                            Shared by {perm.grantedByUserName}
                          </div>
                        )}
                      </div>
                      <span
                        className={`${styles.permissionBadge} ${
                          styles.permissionViewer
                        }`}
                      >
                        VIEW
                      </span>
                      <button
                        className={styles.removeShareButton}
                        disabled={revokeMutation.isPending}
                        onClick={() => handleRevoke(perm.userId)}
                        title="Revoke access"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Collapsible>
          </div>
        )}
      </div>

      <CreateShareLinkModal
        isOpen={isShareLinkModalOpen}
        password={passwordDetail}
        encryptedVaultKey={vault?.vaultEncryptedKey ?? ''}
        onClose={closeShareLinkModal}
      />

      {passwordDetail && (
        <DeletePasswordDialog
          isOpen={isDeleteDialogOpen}
          passwordId={passwordDetail.id}
          passwordName={passwordDetail.name}
          vaultId={passwordDetail.vaultId}
          onClose={() => setIsDeleteDialogOpen(false)}
          onSuccess={props.onDelete}
        />
      )}
    </main>
  );
}
