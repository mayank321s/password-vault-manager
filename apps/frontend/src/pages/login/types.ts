export interface LoginFormData {
  email: string;
  masterPassword: string;
}

export type LoginStep = 'form' | 'totp';
