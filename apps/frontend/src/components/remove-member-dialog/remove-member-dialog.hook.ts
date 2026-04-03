import { useEffect, useRef } from 'react';
import { useVaultReencryption } from '../../hooks';
import type { RemoveMemberDialogProps } from './remove-member-dialog.type';

export const useRemoveMemberDialog = ({
  isOpen,
  member,
  vaultId,
  onClose,
  onSuccess,
}: RemoveMemberDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { removeMember, isLoading, progress, error, result, reset } =
    useVaultReencryption();

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
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (result?.success && !isLoading) {
      const timer = setTimeout(() => {
        onSuccess();
        handleClose();
      }, 4000);
      return () => {
        onSuccess();
        clearTimeout(timer);
      };
    }
  }, [result, isLoading, onSuccess]);

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (!member) return;

    try {
      await removeMember(vaultId, member.userId);
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
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

    if (!isInDialog && !isLoading) {
      handleClose();
    }
  };

  return {
    dialogRef,
    isLoading,
    progress,
    error,
    result,
    handleClose,
    handleConfirm,
    handleDialogClick,
  };
};
