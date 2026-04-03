import type { VaultResponse } from '@repo/shared';

export type PanelMode = 'password' | 'note';

export interface PasswordField {
  id: string;
  label: string;
  value: string;
}

export interface PasswordFormInitialData {
  readonly id: string;
  readonly name: string;
  readonly isNote: boolean;
  readonly fields?: ReadonlyArray<{
    readonly label: string;
    readonly value: string;
  }>;
  readonly noteContent?: string;
}

export interface PasswordFormPanelProps {
  vault: VaultResponse;
  initialData?: PasswordFormInitialData;
  onClose: () => void;
  onSuccess: () => void;
}
