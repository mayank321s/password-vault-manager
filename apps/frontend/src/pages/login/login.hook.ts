import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginUser, loginWithTotp } from '../../services/auth.service';
import { useSsoLookup, useStartSsoLogin } from '../../hooks/useSso';
import { LoginFormData, LoginStep } from './types';

export function useLoginPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<LoginStep>('form');

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    masterPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [progressTitle, setProgressTitle] = useState('Signing You In');
  const [totpCode, setTotpCode] = useState('');
  const normalizedEmail = formData.email.toLowerCase().trim();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const ssoLookupQuery = useSsoLookup(
    normalizedEmail,
    step === 'form' && isValidEmail,
  );
  const isSsoRequired = ssoLookupQuery.data?.requiresSso ?? false;
  const startSsoLoginMutation = useStartSsoLogin();

  // ============================================
  // Step 1: Verify password
  // ============================================

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      setProgressTitle('Signing You In');
      return loginUser(data.email, data.masterPassword, (stage, percent) =>
        setProgress({ stage, percent }),
      );
    },
    onSuccess: (result) => {
      if (result.requiresTotp) {
        // Pre-auth token is cached inside the auth service module.
        // Move to the TOTP step — do not navigate away.
        setTotpCode('');
        setStep('totp');
      } else {
        navigate('/vaults');
      }
    },
    // Login errors render via loginMutation.isError / .error
  });

  // ============================================
  // Step 2: Verify TOTP code
  // ============================================

  const loginWithTotpMutation = useMutation({
    mutationFn: async (code: string) => {
      setProgressTitle('Verifying Code');
      setProgress({ stage: 'Verifying authenticator code...', percent: 15 });
      return loginWithTotp(code, (stage, percent) =>
        setProgress({ stage, percent }),
      );
    },
    onSuccess: () => {
      navigate('/vaults');
    },
    // TOTP errors render via loginWithTotpMutation.isError / .error
  });

  const startSsoMutation = useMutation({
    mutationFn: async (email: string) => {
      setProgressTitle('Redirecting to Microsoft Entra');
      setProgress({ stage: 'Preparing your organization sign-in route...', percent: 35 });
      return startSsoLoginMutation.mutateAsync(email);
    },
    onSuccess: (result) => {
      window.location.assign(result.redirectUrl);
    },
  });

  // ============================================
  // Form handlers
  // ============================================

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      return;
    }

    if (isValidEmail && ssoLookupQuery.isFetching) {
      return;
    }

    if (isSsoRequired) {
      startSsoMutation.mutate(formData.email);
      return;
    }

    if (!formData.masterPassword) {
      return;
    }

    loginMutation.mutate(formData);
  };

  // ============================================
  // TOTP handlers
  // ============================================

  const handleTotpCodeChange = (value: string) => {
    // Enforce numeric-only, max 6 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setTotpCode(cleaned);
  };

  const handleTotpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (totpCode.length !== 6) {
      return;
    }

    loginWithTotpMutation.mutate(totpCode);
  };

  const handleBackToLogin = () => {
    // Return to step 1. The cached pre-auth token in the auth service
    // module is abandoned — it expires server-side after 5 minutes.
    setStep('form');
    setTotpCode('');
    loginMutation.reset();
    loginWithTotpMutation.reset();
    setProgress({ stage: '', percent: 0 });
  };

  const isProgressVisible =
    loginMutation.isPending ||
    loginWithTotpMutation.isPending ||
    startSsoMutation.isPending;

  return {
    step,
    formData,
    showPassword,
    progress,
    progressTitle,
    totpCode,
    isSsoRequired,
    isProgressVisible,
    ssoLookupQuery,
    startSsoMutation,
    loginMutation,
    loginWithTotpMutation,
    handleInputChange,
    setShowPassword,
    handleSubmit,
    handleTotpCodeChange,
    handleTotpSubmit,
    handleBackToLogin,
  };
}
