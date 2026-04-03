import { button } from '../../common/css/button.css';
import * as styles from './create-vault-modal.css';
import { useCreateVaultModal } from './create-vault-modal.hook';
import { CreateVaultModalProps } from './create-vault-modal.type';

export default function CreateVaultModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateVaultModalProps) {
  const {
    error,
    handleSubmit,
    nameInputRef,
    progress,
    setVaultName,
    vaultName,
    createVaultMutation,
  } = useCreateVaultModal({ isOpen, onClose, onSuccess });

  if (!isOpen) {
    return null;
  }
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <span>🔐</span> Create New Vault
          </h2>
          <p className={styles.modalSubtitle}>
            Create a secure vault to store and share passwords with others. Your
            vault will be encrypted with your encryption keys.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && (
            <div className={styles.errorBox}>
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="vaultName" className={styles.label}>
              Vault Name <span className={styles.required}>*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              id="vaultName"
              className={styles.input}
              value={vaultName}
              onChange={(e) => setVaultName(e.target.value)}
              placeholder="e.g., Work Passwords, Family Vault"
              disabled={createVaultMutation.isPending}
              maxLength={100}
              required
            />
            <p className={styles.helpText}>
              Choose a descriptive name for your vault. You can change this
              later.
            </p>
          </div>

          {createVaultMutation.isPending && progress.stage && (
            <div className={styles.progressContainer}>
              <p className={styles.progressText}>{progress.stage}</p>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnSecondary}
              disabled={createVaultMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={button.primary}
              disabled={!vaultName.trim() || createVaultMutation.isPending}
            >
              {createVaultMutation.isPending ? 'Creating...' : 'Create Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
