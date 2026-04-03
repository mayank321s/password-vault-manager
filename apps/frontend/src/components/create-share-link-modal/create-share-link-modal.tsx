import { button } from '../../common/css/button.css';
import * as styles from './create-share-link-modal.css';
import { useCreateShareLinkModal } from './create-share-link-modal.hook';
import type { CreateShareLinkModalProps } from './create-share-link-modal.type';

export default function CreateShareLinkModal({
  isOpen,
  password,
  encryptedVaultKey,
  onClose,
}: CreateShareLinkModalProps) {
  const {
    shareUrl,
    copied,
    error,
    progress,
    createLinkMutation,
    handleCreateLink,
    handleCopyLink,
    handleClose,
    handleKeyDown,
  } = useCreateShareLinkModal({ password, encryptedVaultKey, onClose });

  if (!isOpen || !password) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleClose}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <span>🔗</span>
            Create Share Link
          </h2>
          <button
            className={styles.btnClose}
            onClick={handleClose}
            disabled={createLinkMutation.isPending}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {!shareUrl ? (
            <>
              <div className={styles.infoBox}>
                <p className={styles.infoText}>
                  Create a secure one-time link to share "{password.name}" with
                  anyone. The link will expire after first use or 24 hours.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={styles.linkBox}>
                <div className={styles.linkLabel}>
                  Share Link (expires in 24 hours or after first use)
                </div>
                <div className={styles.linkUrl}>{shareUrl}</div>
                <div className={styles.linkActions}>
                  <button
                    className={`${styles.btnCopy} ${copied ? styles.btnCopySuccess : ''}`}
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <>
                        <span>✓</span> Copied!
                      </>
                    ) : (
                      <>
                        <span>📋</span> Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
          {error && (
            <div className={styles.errorBox}>
              <p className={styles.errorText}>{error}</p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleClose}
            disabled={createLinkMutation.isPending}
          >
            {shareUrl ? 'Done' : 'Cancel'}
          </button>
          {!shareUrl && (
            <button
              type="button"
              className={button.primarySmall}
              onClick={handleCreateLink}
              disabled={createLinkMutation.isPending}
            >
              Create Link
            </button>
          )}
        </div>

        {progress && (
          <div className={styles.progressOverlay}>
            <div className={styles.progressContent}>
              <div className={styles.progressSpinner} />
              <p className={styles.progressText}>Creating Share Link</p>
              <p className={styles.progressStage}>{progress.stage}</p>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
