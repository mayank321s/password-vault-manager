import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginUser, loginWithTotp } from '../../services/auth.service';
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

  // ============================================
  // Form handlers
  // ============================================

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.masterPassword) {
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
    loginMutation.isPending || loginWithTotpMutation.isPending;

  return {
    step,
    formData,
    showPassword,
    progress,
    progressTitle,
    totpCode,
    isProgressVisible,
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
