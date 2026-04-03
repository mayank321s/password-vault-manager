import { userRoleDisplayName } from '../../common/constants/display';
import * as styles from './remove-member-dialog.css';
import { useRemoveMemberDialog } from './remove-member-dialog.hook';
import type { RemoveMemberDialogProps } from './remove-member-dialog.type';

export default function RemoveMemberDialog({
  isOpen,
  member,
  vaultId,
  onClose,
  onSuccess,
}: RemoveMemberDialogProps) {
  const {
    dialogRef,
    isLoading,
    progress,
    error,
    result,
    handleClose,
    handleConfirm,
    handleDialogClick,
  } = useRemoveMemberDialog({
    isOpen,
    member,
    vaultId,
    onClose,
    onSuccess,
  });

  if (!member) return null;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleDialogClick}
      onClose={handleClose}
    >
      <div className={styles.dialogContent}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Remove Vault Member</h2>
          {!isLoading && (
            <button
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Close dialog"
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.dialogBody}>
          {!isLoading && !result && (
            <>
              <div className={styles.warningBanner}>
                <strong>⚠️ Security Notice</strong>
                <p>
                  Removing a member requires re-encrypting all vault data with a
                  new key. This ensures the removed member cannot access
                  passwords they may have cached.
                </p>
              </div>

              <p className={styles.memberInfo}>
                <strong>Member:</strong>
                {'  '}
                {member.userName} ({member.userEmail}){'  '}
                <span className={styles.roleBadge}>
                  {userRoleDisplayName[member.userRole]}
                </span>
              </p>

              <p className={styles.confirmationText}>This operation will:</p>
              <ul className={styles.operationList}>
                <li>Generate a new vault encryption key</li>
                <li>Re-encrypt all passwords in this vault</li>
                <li>Distribute the new key to remaining members</li>
                <li>Remove {member.userName} from the vault</li>
              </ul>
            </>
          )}

          {isLoading && progress && (
            <div className={styles.progressSection}>
              <div className={styles.progressInfo}>
                <span className={styles.progressStage}>{progress.stage}</span>
                <span className={styles.progressPercentage}>
                  {progress.percentage}%
                </span>
              </div>
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className={styles.progressDescription}>
                Please wait while we secure your vault...
              </p>
            </div>
          )}

          {error && (
            <div className={styles.errorBanner}>
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          )}

          {result?.success && !isLoading && (
            <div className={styles.successBanner}>
              <strong>✓ Success!</strong>
              <p>Member removed successfully.</p>
              <ul className={styles.resultStats}>
                <li>Passwords re-encrypted</li>
                <li>Members updated with new keys</li>
              </ul>
            </div>
          )}
        </div>

        <div className={styles.dialogFooter}>
          {!isLoading && !result?.success && (
            <>
              <button
                className={styles.buttonSecondary}
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className={styles.buttonDanger}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                Remove Member
              </button>
            </>
          )}

          {isLoading && (
            <button className={styles.buttonSecondary} disabled>
              Processing...
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
