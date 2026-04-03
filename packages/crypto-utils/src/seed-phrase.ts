// ============================================
// BIP39 Seed Phrase (Account Recovery)
// ============================================

import { generateMnemonic, validateMnemonic } from 'bip39';

/**
 * Generate a BIP39 seed phrase for account recovery
 *
 * @returns 12-word BIP39 mnemonic phrase
 */
export async function generateSeedPhrase(): Promise<string> {
  const mnemonic = generateMnemonic(128);
  return mnemonic;
}

/**
 * Validate BIP39 seed phrase
 *
 * @param seedPhrase - Mnemonic to validate
 * @returns true if valid, false otherwise
 */
export async function validateSeedPhrase(seedPhrase: string): Promise<boolean> {
  try {
    return validateMnemonic(seedPhrase);
  } catch {
    return false;
  }
}
