export interface RegistrationResult {
  success: boolean;
  seedPhrase: string; // MUST be shown to user and saved securely
  user: {
    userId: string;
    email: string;
    username: string;
  };
}

export interface LoginResult {
  success: boolean;
  /**
   * Present when the account requires TOTP verification.
   * When true, `user` is absent — call loginWithTotp(totpCode) to complete.
   */
  requiresTotp?: boolean;
  user?: {
    userId: string;
    email: string;
    username: string;
  };
  recoveredSeedPhrase?: string; // Only present after seed phrase recovery
}
