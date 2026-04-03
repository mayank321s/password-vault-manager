import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  registerUser,
  completeRegistration,
  validateRegistrationInput,
} from '../../services/auth.service';
import { RegistrationFormData, RegistrationStep } from './types';

export function useRegisterPage() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    username: '',
    masterPassword: '',
    confirmPassword: '',
  });

  const [step, setStep] = useState<RegistrationStep>('form');
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [processingTitle, setProcessingTitle] = useState(
    'Creating Your Account',
  );
  const [isLockedOut, setIsLockedOut] = useState(false);

  // TOTP setup state — cleared after registration is completed
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [totpSecret, setTotpSecret] = useState<string>('');
  const [totpCode, setTotpCode] = useState<string>('');

  // Seed phrase state
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [seedPhraseCopied, setSeedPhraseCopied] = useState(false);
  const [seedPhraseConfirmed, setSeedPhraseConfirmed] = useState(false);

  // ============================================
  // Step 1: Register — generate keys, create account, receive QR code
  // ============================================

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      setProcessingTitle('Creating Your Account');
      return registerUser(
        data.email,
        data.username,
        data.masterPassword,
        (stage, percent) => setProgress({ stage, percent }),
      );
    },
    onSuccess: (result) => {
      setQrCodeDataUrl(result.qrCodeDataUrl);
      setTotpSecret(result.secret);
      setTotpCode('');
      setErrors([]);
      setStep('totp-setup');
    },
    onError: (error: Error) => {
      setErrors([error.message]);
      setStep('form');
    },
  });

  // ============================================
  // Step 2: Complete registration — verify TOTP, bootstrap session
  // ============================================

  const completeRegistrationMutation = useMutation({
    mutationFn: async (code: string) => {
      setProcessingTitle('Verifying Authenticator Code');
      setProgress({ stage: 'Verifying authenticator code...', percent: 10 });
      setStep('processing');
      return completeRegistration(code, (stage, percent) =>
        setProgress({ stage, percent }),
      );
    },
    onSuccess: (result) => {
      setSeedPhrase(result.seedPhrase);
      // Discard TOTP setup data — it is no longer needed
      setTotpSecret('');
      setQrCodeDataUrl('');
      setIsLockedOut(false);
      setErrors([]);
      setStep('seed-phrase');
    },
    onError: (error: Error) => {
      const msg = error.message;

      // Client-side cache missing: the in-memory registration token was cleared
      // (page navigated away or refreshed). Reset to the form so the user can
      // initiate a fresh registration.
      if (msg.includes('No pending registration')) {
        setQrCodeDataUrl('');
        setTotpSecret('');
        setTotpCode('');
        setIsLockedOut(false);
        setStep('form');
        setErrors([
          'Your registration session has expired. Please start over.',
        ]);
        return;
      }

      setTotpCode('');
      setStep('totp-setup');

      if (msg.includes('Too many failed attempts')) {
        setIsLockedOut(true);
        setErrors([msg]);
        return;
      }

      // All other 401 responses (invalid code, expired JWT, purpose mismatch)
      // are mapped to a single user-facing message to avoid enumeration.
      setErrors(['Invalid code. Please try again.']);
    },
  });

  // ============================================
  // Form handlers
  // ============================================

  const handleInputChange = (
    field: keyof RegistrationFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = (): boolean => {
    const validation = validateRegistrationInput(
      formData.email,
      formData.username,
      formData.masterPassword,
    );

    if (!validation.valid) {
      setErrors(validation.errors);
      return false;
    }

    if (formData.masterPassword !== formData.confirmPassword) {
      setErrors(['Passwords do not match']);
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setErrors([]);
    setStep('processing');
    registerMutation.mutate(formData);
  };

  // ============================================
  // TOTP handlers
  // ============================================

  const handleTotpCodeChange = (value: string) => {
    // Enforce numeric-only, 6 digits max
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setTotpCode(cleaned);
    if (errors.length > 0) setErrors([]);
  };

  const handleTotpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (totpCode.length !== 6) {
      setErrors(['Please enter the 6-digit code from your authenticator app']);
      return;
    }

    setErrors([]);
    completeRegistrationMutation.mutate(totpCode);
  };

  const handleRestartRegistration = () => {
    // Return to the form. The pending server record is inert until a valid
    // TOTP code is supplied — if the user re-registers with the same email
    // the server will reject with a conflict and they should contact support.
    setQrCodeDataUrl('');
    setTotpSecret('');
    setTotpCode('');
    setIsLockedOut(false);
    setErrors([]);
    setStep('form');
  };

  // ============================================
  // Seed phrase handlers
  // ============================================

  const handleCopySeedPhrase = async () => {
    try {
      await navigator.clipboard.writeText(seedPhrase);
      setSeedPhraseCopied(true);
      setTimeout(() => setSeedPhraseCopied(false), 3000);
    } catch {
      // Clipboard API unavailable — no-op
    }
  };

  const handleDownloadSeedPhrase = () => {
    const content = [
      'PASSWORD MANAGER RECOVERY PHRASE\n',
      '================================\n\n',
      'IMPORTANT: Keep this phrase secure and private!\n',
      'This phrase can be used to recover your account.\n\n',
      'Recovery Phrase:\n',
      seedPhrase,
      '\n\nAccount: ',
      formData.email,
    ].join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'recovery-phrase.txt';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleCompleteSeedPhrase = () => {
    if (!seedPhraseConfirmed) {
      setErrors(['Please confirm that you have saved your recovery phrase']);
      return;
    }

    setStep('complete');
    setTimeout(() => {
      window.location.href = '/vaults';
    }, 2000);
  };

  return {
    formData,
    step,
    errors,
    progress,
    processingTitle,
    isLockedOut,
    qrCodeDataUrl,
    totpSecret,
    totpCode,
    seedPhrase,
    seedPhraseCopied,
    seedPhraseConfirmed,
    registerMutation,
    completeRegistrationMutation,
    handleInputChange,
    handleSubmit,
    handleTotpCodeChange,
    handleTotpSubmit,
    handleRestartRegistration,
    handleCopySeedPhrase,
    handleDownloadSeedPhrase,
    handleCompleteSeedPhrase,
    setSeedPhraseConfirmed,
  };
}
