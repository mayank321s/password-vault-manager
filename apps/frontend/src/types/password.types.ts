import { VaultResponse } from '@repo/shared';

interface PasswordFieldEntry {
  readonly label: string;
  readonly value: string;
}

export type CreatePasswordContent =
  | {
      readonly type: 'password';
      readonly name: string;
      readonly fields: readonly PasswordFieldEntry[];
    }
  | {
      readonly type: 'note';
      readonly name: string;
      readonly content: string;
    };

export interface CreatePasswordVars {
  readonly vault: VaultResponse;
  readonly content: CreatePasswordContent;
}

export interface UpdatePasswordVars {
  readonly passwordId: string;
  readonly vault: VaultResponse;
  readonly content: CreatePasswordContent;
}
