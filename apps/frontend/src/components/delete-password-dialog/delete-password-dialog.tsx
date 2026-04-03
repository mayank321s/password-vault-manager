import * as styles from './delete-password-dialog.css';
import { useDeletePasswordDialog } from './delete-password-dialog.hook';
import type { DeletePasswordDialogProps } from './delete-password-dialog.type';

export default function DeletePasswordDialog(props: DeletePasswordDialogProps) {
  const { passwordName, onClose } = props;
  const {
    dialogRef,
    isLoading,
    error,
    handleClose,
    handleConfirm,
    handleDialogClick,
  } = useDeletePasswordDialog(props);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleDialogClick}
      onClose={onClose}
    >
      <div className={styles.dialogContent}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>
            Delete Password: {passwordName}
          </h2>
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

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.dialogFooter}>
          {!isLoading ? (
            <>
              <button className={styles.buttonSecondary} onClick={handleClose}>
                Cancel
              </button>
              <button className={styles.buttonDanger} onClick={handleConfirm}>
                Delete
              </button>
            </>
          ) : (
            <button className={styles.buttonSecondary} disabled>
              Deleting…
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
