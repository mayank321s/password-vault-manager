import { GetVaultPasswordsResponse } from '@repo/shared';

export interface PasswordListColumnProps {
  vaultName: string;
  passwords: GetVaultPasswordsResponse['passwords'];
  passwordsLoading: boolean;
  passwordsError: boolean;
  selectedPasswordId: string | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelectPassword: (passwordId: string) => void;
  onAddPassword: () => void;
  hideAddButton?: boolean;
}
