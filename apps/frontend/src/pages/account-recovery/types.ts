export interface RecoveryFormData {
  email: string;
  seedPhrase: string;
  newPassword: string;
}

export type RecoveryStep = 'form' | 'totp-setup' | 'complete';

export interface RecoveryTotpData {
  qrCodeDataUrl: string;
  secret: string;
}
