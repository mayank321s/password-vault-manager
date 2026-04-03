import { type MouseEvent, useEffect, useRef } from 'react';
import { useDeletePassword } from '../../hooks';
import type { DeletePasswordDialogProps } from './delete-password-dialog.type';

export function useDeletePasswordDialog({
  isOpen,
  passwordId,
  vaultId,
  onClose,
  onSuccess,
}: DeletePasswordDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const deleteMutation = useDeletePassword(vaultId);

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
      deleteMutation.reset();
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!deleteMutation.isPending) {
      deleteMutation.reset();
      onClose();
    }
  };

  const handleConfirm = () => {
    deleteMutation.mutate(passwordId, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  const handleDialogClick = (e: MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!isInDialog && !deleteMutation.isPending) {
      handleClose();
    }
  };

  return {
    dialogRef,
    isLoading: deleteMutation.isPending,
    error: deleteMutation.error?.message ?? null,
    handleClose,
    handleConfirm,
    handleDialogClick,
  };
}
