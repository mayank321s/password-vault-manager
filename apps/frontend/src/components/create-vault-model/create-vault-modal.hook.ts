import { CreateVaultModalProps } from './create-vault-modal.type';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { useCreateVault } from '../../hooks';

export const useCreateVaultModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateVaultModalProps) => {
  const [vaultName, setVaultName] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setVaultName('');
      setError('');
      setProgress({ stage: '', percent: 0 });
    }
  }, [isOpen]);

  const createVaultMutation = useCreateVault((stage, percent) =>
    setProgress({ stage, percent }),
  );

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!vaultName.trim()) {
      setError('Vault name is required');
      return;
    }

    if (vaultName.trim().length < 2) {
      setError('Vault name must be at least 2 characters');
      return;
    }

    if (vaultName.trim().length > 100) {
      setError('Vault name must not exceed 100 characters');
      return;
    }

    createVaultMutation.mutate(vaultName, {
      onSuccess: () => {
        setVaultName('');
        onSuccess?.();
        onClose();
      },
      onError: (err: Error) => {
        setError(err.message || 'Failed to create vault. Please try again.');
        setProgress({ stage: '', percent: 0 });
      },
    });
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !createVaultMutation.isPending) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, createVaultMutation.isPending]);

  return {
    handleSubmit,
    vaultName,
    setVaultName,
    error,
    progress,
    createVaultMutation,
    nameInputRef,
  };
};
