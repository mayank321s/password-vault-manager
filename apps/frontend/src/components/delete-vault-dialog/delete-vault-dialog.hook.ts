import { useEffect, useRef } from 'react';
import { useDeleteVault } from '../../hooks';
import type { DeleteVaultDialogProps } from './delete-vault-dialog.type';

export const useDeleteVaultDialog = ({
  isOpen,
  vaultId,
  onClose,
  onSuccess,
}: DeleteVaultDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const deleteVaultMutation = useDeleteVault();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      deleteVaultMutation.reset();
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!deleteVaultMutation.isPending) {
      deleteVaultMutation.reset();
      onClose();
    }
  };

  const handleConfirm = () => {
    deleteVaultMutation.mutate(vaultId, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!isInDialog && !deleteVaultMutation.isPending) {
      handleClose();
    }
  };

  return {
    dialogRef,
    isLoading: deleteVaultMutation.isPending,
    error: deleteVaultMutation.error?.message ?? null,
    handleClose,
    handleConfirm,
    handleDialogClick,
  };
};
