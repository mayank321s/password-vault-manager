// ============================================
// Symmetric (AES-256-GCM) Operations
// ============================================

import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  generateRandomBytes,
  CRYPTO_CONSTANTS,
} from './primitives';
import { encryptWithPublicKey } from './asymmetric';

/**
 * Encrypt a symmetric key with an RSA public key
 */
export async function encryptSymmetricKey(
  base64Key: string,
  publicKey: CryptoKey,
): Promise<string> {
  const keyData = base64ToArrayBuffer(base64Key);
  return encryptWithPublicKey(keyData, publicKey);
}

/**
 * Encrypt data with AES-256-GCM
 * Returns Base64 encoded: IV (12 bytes) + Ciphertext + Auth Tag (16 bytes)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function encryptWithAES(data: any, key: CryptoKey): Promise<string> {
  const iv = generateRandomBytes(CRYPTO_CONSTANTS.AES_IV_SIZE);
  const plaintext = new TextEncoder().encode(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    key,
    plaintext,
  );

  // Concatenate IV + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return arrayBufferToBase64(combined.buffer);
}

/**
 * Decrypt data with AES-256-GCM
 * Expects Base64 encoded: IV (12 bytes) + Ciphertext + Auth Tag (16 bytes)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function decryptWithAES(encryptedData: string, key: CryptoKey): Promise<any> {
  const combined = base64ToArrayBuffer(encryptedData);
  const combinedArray = new Uint8Array(combined);

  // Extract IV and ciphertext
  const iv = combinedArray.slice(0, CRYPTO_CONSTANTS.AES_IV_SIZE);
  const ciphertext = combinedArray.slice(CRYPTO_CONSTANTS.AES_IV_SIZE);

  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    ciphertext,
  );

  const decoded = new TextDecoder().decode(plaintext);
  return JSON.parse(decoded);
}

/**
 * Encrypt seed phrase with password-derived key
 *
 * @param seedPhrase - 12-word mnemonic to encrypt
 * @param masterKey - AES key derived from user's password
 * @returns Base64-encoded encrypted seed phrase
 */
export async function encryptSeedPhrase(
  seedPhrase: string,
  masterKey: CryptoKey,
): Promise<string> {
  const encoder = new TextEncoder();
  const seedPhraseBytes = encoder.encode(seedPhrase);

  const iv = generateRandomBytes(12);

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    masterKey,
    seedPhraseBytes,
  );

  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedData), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt seed phrase with password-derived key
 *
 * @param encryptedSeedPhrase - Base64-encoded encrypted seed phrase
 * @param masterKey - AES key derived from user's password
 * @returns Decrypted 12-word mnemonic
 */
export async function decryptSeedPhrase(
  encryptedSeedPhrase: string,
  masterKey: CryptoKey,
): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedSeedPhrase), (c) =>
    c.charCodeAt(0),
  );

  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    masterKey,
    encryptedData,
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}
