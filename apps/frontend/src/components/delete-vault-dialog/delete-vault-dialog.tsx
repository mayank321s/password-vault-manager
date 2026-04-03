import * as styles from './delete-vault-dialog.css';
import { useDeleteVaultDialog } from './delete-vault-dialog.hook';
import type { DeleteVaultDialogProps } from './delete-vault-dialog.type';

export default function DeleteVaultDialog({
  isOpen,
  vaultId,
  vaultName,
  onClose,
  onSuccess,
}: DeleteVaultDialogProps) {
  const {
    dialogRef,
    isLoading,
    error,
    handleClose,
    handleConfirm,
    handleDialogClick,
  } = useDeleteVaultDialog({ isOpen, vaultId, vaultName, onClose, onSuccess });

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleDialogClick}
      onClose={handleClose}
    >
      <div className={styles.dialogContent}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Delete Vault: {vaultName}</h2>
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
          <div className={styles.warningBanner}>
            <strong>This action is permanent and cannot be undone</strong>
            <p>
              Deleting this vault will permanently remove all passwords stored
              in it and revoke access for all members.
            </p>
          </div>

          <p className={styles.confirmationText}>This operation will:</p>
          <ul className={styles.operationList}>
            <li>Permanently delete all passwords in this vault</li>
            <li>Remove all vault members</li>
            <li>Destroy all encryption keys for this vault</li>
          </ul>

          {error && (
            <div className={styles.errorBanner}>
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className={styles.dialogFooter}>
          {!isLoading && (
            <>
              <button className={styles.buttonSecondary} onClick={handleClose}>
                Cancel
              </button>
              <button className={styles.buttonDanger} onClick={handleConfirm}>
                Delete Vault
              </button>
            </>
          )}
          {isLoading && (
            <button className={styles.buttonSecondary} disabled>
              Deleting...
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
