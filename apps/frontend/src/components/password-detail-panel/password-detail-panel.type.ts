import {
  PasswordResponse,
  SharedPasswordItem,
  VaultResponse,
} from '@repo/shared';
import type { PasswordFormInitialData } from '../password-form-panel/password-form-panel.type';

export interface PasswordDetailPanelProps {
  passwordDetail: PasswordResponse | undefined;
  vault: VaultResponse | null;
  isLoading: boolean;
  onCopy: (text: string) => void;
  onEdit: (data: PasswordFormInitialData) => void;
  onDelete: () => void;
  sharedItem?: SharedPasswordItem | null;
}

interface PasswordField {
  readonly label: string;
  readonly value: string;
}

export type DecryptedContent =
  | { readonly type: 'password'; readonly fields: readonly PasswordField[] }
  | { readonly type: 'note'; readonly content: string };

export interface CollapsibleProps {
  readonly label: string;
  readonly open: boolean;
  readonly onToggle: () => void;
  readonly children: React.ReactNode;
}

export interface ShareFormState {
  email: string;
  selectedUserId: string | undefined;
  publicKey: string;
}
