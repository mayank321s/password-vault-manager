import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAccountRecoveryMutation,
  useEnrollTotpMutation,
} from '../../hooks/useAuthMutations';
import { validateSeedPhrase } from '@repo/crypto-utils';
import { RecoveryFormData, RecoveryStep, RecoveryTotpData } from './types';

export function useAccountRecoveryPage() {
  const navigate = useNavigate();
  const seedPhraseRef = useRef<HTMLTextAreaElement>(null);

  const [step, setStep] = useState<RecoveryStep>('form');
  const [formData, setFormData] = useState<RecoveryFormData>({
    email: '',
    seedPhrase: '',
    newPassword: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [showSeedWords, setShowSeedWords] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [recoveryTotpData, setRecoveryTotpData] =
    useState<RecoveryTotpData | null>(null);
  const [isLockedOut, setIsLockedOut] = useState(false);

  const seedWords = formData.seedPhrase
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  const recoveryMutation = useAccountRecoveryMutation({ setProgress });
  const enrollMutation = useEnrollTotpMutation({ setProgress });

  const handleInputChange = (field: keyof RecoveryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = async (): Promise<boolean> => {
    const validationErrors: string[] = [];

    if (!formData.email || formData.email.trim().length === 0) {
      validationErrors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.push('Email must be a valid email address');
    }

    if (!formData.seedPhrase || formData.seedPhrase.trim().length === 0) {
      validationErrors.push('Recovery phrase is required');
    } else {
      const words = formData.seedPhrase
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 0);

      if (words.length !== 12) {
        validationErrors.push(
          `Recovery phrase must be exactly 12 words (you entered ${words.length})`,
        );
      } else {
        const isValid = await validateSeedPhrase(formData.seedPhrase);
        if (!isValid) {
          validationErrors.push(
            'Invalid recovery phrase. Please check your words and try again.',
          );
        }
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return false;
    }

    if (!formData.newPassword || formData.newPassword.length === 0) {
      validationErrors.push('New password is required');
    } else if (formData.newPassword.length < 8) {
      validationErrors.push('New password must be at least 8 characters');
    } else if (formData.newPassword !== confirmPassword) {
      validationErrors.push('Passwords do not match');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setErrors([]);

    recoveryMutation.mutate(formData, {
      onSuccess: (data) => {
        setRecoveryTotpData(data);
        setStep('totp-setup');
      },
      onError: (error: Error) => {
        setErrors([
          error instanceof Error
            ? error.message
            : 'Account recovery failed. Please check your details and try again.',
        ]);
      },
    });
  };

  const handleTotpCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setTotpCode(cleaned);
    if (errors.length > 0) setErrors([]);
  };

  const handleTotpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (totpCode.length !== 6) {
      setErrors(['Please enter a 6-digit code.']);
      return;
    }

    setErrors([]);

    enrollMutation.mutate(totpCode, {
      onSuccess: () => {
        navigate('/vaults');
      },
      onError: (error: Error) => {
        const msg = error.message;

        // Client-side cache cleared: recovery session expired or was reset.
        if (msg.includes('No pending TOTP enrollment')) {
          setStep('form');
          setTotpCode('');
          setRecoveryTotpData(null);
          setIsLockedOut(false);
          setErrors([
            'Your recovery session has expired. Please restart the recovery process.',
          ]);
          return;
        }

        setTotpCode('');

        if (msg.includes('Too many failed attempts')) {
          setIsLockedOut(true);
          setErrors([msg]);
          return;
        }

        // All other 401 responses mapped to a single user-facing message.
        setErrors(['Invalid code. Please try again.']);
      },
    });
  };

  const handleRestartRecovery = () => {
    setStep('form');
    setTotpCode('');
    setRecoveryTotpData(null);
    setIsLockedOut(false);
    setErrors([]);
    setProgress({ stage: '', percent: 0 });
  };

  const toggleSeedWordsDisplay = () => {
    setShowSeedWords(!showSeedWords);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  useEffect(() => {
    if (seedPhraseRef.current) {
      seedPhraseRef.current.style.height = 'auto';
      seedPhraseRef.current.style.height = `${seedPhraseRef.current.scrollHeight}px`;
    }
  }, [formData.seedPhrase]);

  return {
    step,
    formData,
    errors,
    progress,
    showSeedWords,
    seedWords,
    seedPhraseRef,
    recoveryMutation,
    enrollMutation,
    confirmPassword,
    totpCode,
    recoveryTotpData,
    isLockedOut,
    setConfirmPassword,
    handleInputChange,
    handleSubmit,
    handleTotpCodeChange,
    handleTotpSubmit,
    handleRestartRecovery,
    toggleSeedWordsDisplay,
    handleBackToLogin,
  };
}
