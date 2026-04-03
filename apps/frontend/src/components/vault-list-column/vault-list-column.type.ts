import { VaultDetailResponse } from '@repo/shared';
import type { MouseEvent } from 'react';

export interface VaultListColumnProps {
  vaults: VaultDetailResponse[];
  selectedVaultId: string | null;
  vaultsLoading: boolean;
  vaultsError: boolean;
  onSelectVault: (vaultId: string) => void;
  onOpenSettings: (vaultId: string, e: MouseEvent<HTMLButtonElement>) => void;
  onCreateVault: () => void;
  onRetry: () => void;
}
