/**
 * Vault Type Definitions
 * Matches backend API DTOs for vault operations
 */

export interface ReEncryptionProgress {
  current: number;
  total: number;
  stage: string;
  percentage: number;
}
export class VaultError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'VaultError';
  }
}

export class ReEncryptionError extends VaultError {
  constructor(
    message: string,
    public stage: string,
  ) {
    super(message, 'REENCRYPTION_ERROR');
    this.name = 'ReEncryptionError';
  }
}
