import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { unlockSession } from '../../services/auth.service';
import { getSessionData, clearAllData } from '../../lib/storage';

export function useUnlockPage() {
  const navigate = useNavigate();
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    getSessionData('user_email').then((storedEmail) => {
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        // No stored session at all — force full re-authentication.
        window.location.replace('/login');
      }
    });
  }, []);

  const unlockMutation = useMutation({
    mutationFn: async (password: string) => {
      const result = await unlockSession(password);

      if (result.success) return;

      if (result.reason === 'missing-data') {
        // IndexedDB data is gone — session is unrecoverable offline.
        // Clear any remaining state and send the user through the full
        // login flow (which requires TOTP, preventing bypass).
        await clearAllData();
        window.location.replace('/login');
        // Keep the mutation in isPending until the redirect fires.
        await new Promise(() => {});
        return;
      }

      // Wrong password — data is intact, let the user retry.
      throw new Error('Incorrect password. Please try again.');
    },
    onSuccess: () => {
      // Client-side navigation preserves in-memory sessionManager state.
      // replace:true prevents the back button from returning to the lock screen.
      navigate('/vaults', { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword || !email || unlockMutation.isPending) return;
    // Reset any previous error so the UI clears before the next attempt.
    unlockMutation.reset();
    unlockMutation.mutate(masterPassword);
  };

  const handleSignInDifferentAccount = async () => {
    // Explicitly clear all IndexedDB data before redirecting so no
    // leaked state remains if a different user logs in on the same device.
    await clearAllData();
    window.location.replace('/login');
  };

  return {
    email,
    masterPassword,
    setMasterPassword,
    showPassword,
    setShowPassword,
    unlockMutation,
    handleSubmit,
    handleSignInDifferentAccount,
  };
}
