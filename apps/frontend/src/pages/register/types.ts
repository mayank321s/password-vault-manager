export interface RegistrationFormData {
  email: string;
  username: string;
  masterPassword: string;
  confirmPassword: string;
}

export type RegistrationStep =
  | 'form'
  | 'processing'
  | 'totp-setup'
  | 'seed-phrase'
  | 'complete';
