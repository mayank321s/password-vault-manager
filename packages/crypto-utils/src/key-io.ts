// ============================================
// Key Import / Export Operations
// ============================================

import { arrayBufferToBase64, base64ToArrayBuffer, CRYPTO_CONSTANTS } from './primitives';

/**
 * Generate a new AES-256-GCM key for vault encryption
 */
export async function generateSymmetricKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: CRYPTO_CONSTANTS.AES_KEY_SIZE,
    },
    true, // extractable
    ['encrypt', 'decrypt'],
  );
}

/**
 * Export AES key to raw bytes (for re-wrapping with RSA)
 */
export async function exportVaultKey(key: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey('raw', key);
}

/**
 * Import AES key from raw bytes
 */
export async function importVaultKey(keyData: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: CRYPTO_CONSTANTS.AES_KEY_SIZE,
    },
    true,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Export symmetric key as base64 string
 */
export async function exportSymmetricKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Import symmetric key from base64 string
 */
export async function importSymmetricKey(
  base64Key: string,
): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(base64Key);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Generate RSA-4096 key pair
 */
export async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: CRYPTO_CONSTANTS.RSA_KEY_SIZE,
      publicExponent: CRYPTO_CONSTANTS.RSA_PUBLIC_EXPONENT, // 65537
      hash: CRYPTO_CONSTANTS.RSA_HASH,
    },
    true, // extractable
    ['encrypt', 'decrypt'],
  );
}

/**
 * Export RSA public key to PEM format
 */
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  const base64 = arrayBufferToBase64(exported);

  // Format as PEM
  const pem = `-----BEGIN PUBLIC KEY-----\n${base64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
  return pem;
}

/**
 * Import RSA public key from PEM format
 */
export async function importPublicKey(pem: string): Promise<CryptoKey> {
  // Remove PEM headers and whitespace
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');

  const keyData = base64ToArrayBuffer(base64);

  return crypto.subtle.importKey(
    'spki',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: CRYPTO_CONSTANTS.RSA_HASH,
    },
    true,
    ['encrypt'],
  );
}

/**
 * Export RSA private key to PKCS#8 format (for storage)
 */
export async function exportPrivateKey(privateKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
  return arrayBufferToBase64(exported);
}

/**
 * Import RSA private key from PKCS#8 format
 */
export async function importPrivateKey(base64: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(base64);

  return crypto.subtle.importKey(
    'pkcs8',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: CRYPTO_CONSTANTS.RSA_HASH,
    },
    true,
    ['decrypt'],
  );
}
