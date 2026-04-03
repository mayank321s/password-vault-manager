// ============================================
// Asymmetric (RSA-OAEP) Operations
// ============================================

import { arrayBufferToBase64, base64ToArrayBuffer } from './primitives';
import { exportVaultKey, importVaultKey } from './key-io';

/**
 * Encrypt data with RSA public key (for wrapping AES keys)
 */
export async function encryptWithPublicKey(
  data: ArrayBuffer,
  publicKey: CryptoKey,
): Promise<string> {
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    data,
  );

  return arrayBufferToBase64(encrypted);
}

/**
 * Decrypt data with RSA private key (for unwrapping AES keys)
 */
export async function decryptWithPrivateKey(
  encryptedData: string,
  privateKey: CryptoKey,
): Promise<ArrayBuffer> {
  const encrypted = base64ToArrayBuffer(encryptedData);

  return crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    privateKey,
    encrypted,
  );
}

/**
 * Decrypt vault key using user's private key
 */
export async function decryptVaultKey(
  encryptedVaultKey: string,
  privateKey: CryptoKey,
): Promise<CryptoKey> {
  const vaultKeyRaw = await decryptWithPrivateKey(
    encryptedVaultKey,
    privateKey,
  );
  return importVaultKey(vaultKeyRaw);
}

/**
 * Encrypt vault key with user's public key
 */
export async function encryptVaultKey(
  vaultKey: CryptoKey,
  publicKey: CryptoKey,
): Promise<string> {
  const vaultKeyRaw = await exportVaultKey(vaultKey);
  return encryptWithPublicKey(vaultKeyRaw, publicKey);
}
