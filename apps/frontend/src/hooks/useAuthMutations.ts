import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { RecoveryFormData } from '../pages/account-recovery/types';
import {
  enrollTotpAfterRecovery,
  logout,
  recoverAccountWithSeedPhrase,
} from '../services/auth.service';

export const useAccountRecoveryMutation = ({
  setProgress,
}: {
  setProgress: ({ stage, percent }: { stage: string; percent: number }) => void;
}) => {
  return useMutation({
    mutationFn: async (data: RecoveryFormData) => {
      return recoverAccountWithSeedPhrase(
        data.email,
        data.seedPhrase,
        data.newPassword,
        (stage: string, percent: number) => {
          setProgress({ stage, percent });
        },
      );
    },
  });
};

export const useEnrollTotpMutation = ({
  setProgress,
}: {
  setProgress: ({ stage, percent }: { stage: string; percent: number }) => void;
}) => {
  return useMutation({
    mutationFn: async (totpCode: string) => {
      return enrollTotpAfterRecovery(
        totpCode,
        (stage: string, percent: number) => {
          setProgress({ stage, percent });
        },
      );
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    },
  });
};
