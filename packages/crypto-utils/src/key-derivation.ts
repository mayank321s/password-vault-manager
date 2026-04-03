// ============================================
// Key Derivation Operations
// ============================================

import { arrayBufferToBase64, base64ToArrayBuffer, generateRandomBytes, CRYPTO_CONSTANTS } from './primitives';
import { exportPrivateKey, importPrivateKey } from './key-io';
import { encryptWithAES, decryptWithAES } from './symmetric';

/**
 * Derive master key from user password using PBKDF2
 *
 * @param password - User's master password
 * @param salt - User-specific salt (Base64 encoded)
 * @returns CryptoKey for encrypting/decrypting private key
 */
export async function deriveMasterKey(
  password: string,
  salt: string,
): Promise<CryptoKey> {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: base64ToArrayBuffer(salt),
      iterations: CRYPTO_CONSTANTS.PBKDF2_ITERATIONS,
      hash: CRYPTO_CONSTANTS.PBKDF2_HASH,
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: CRYPTO_CONSTANTS.PBKDF2_KEY_SIZE,
    },
    false, // non-extractable for security
    ['encrypt', 'decrypt'],
  );
}

/**
 * Derive AES-256 wrapping key from seed phrase using PBKDF2
 *
 * @param seedPhrase - 12-word BIP39 mnemonic
 * @returns AES-256 key for wrapping/unwrapping private key
 */
export async function deriveWrappingKeyFromSeedPhrase(
  seedPhrase: string,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const normalizedSeedPhrase = seedPhrase.normalize('NFKD');
  const mnemonicBuffer = encoder.encode(normalizedSeedPhrase);
  const saltBuffer = encoder.encode(normalizedSeedPhrase.slice(0, 32));

  const baseKey = await crypto.subtle.importKey(
    'raw',
    mnemonicBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 2048,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Wrap (encrypt) RSA private key with AES wrapping key
 *
 * @param privateKey - RSA private key to wrap
 * @param wrappingKey - AES-256 key derived from seed phrase
 * @returns Base64-encoded encrypted private key (IV + ciphertext + auth tag)
 */
export async function wrapPrivateKey(
  privateKey: CryptoKey,
  wrappingKey: CryptoKey,
): Promise<string> {
  const privateKeyPkcs8 = await crypto.subtle.exportKey('pkcs8', privateKey);
  const iv = generateRandomBytes(12);

  const encryptedPrivateKey = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    wrappingKey,
    privateKeyPkcs8,
  );

  const combined = new Uint8Array(iv.length + encryptedPrivateKey.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedPrivateKey), iv.length);

  return arrayBufferToBase64(combined.buffer);
}

/**
 * Unwrap (decrypt) RSA private key with AES wrapping key
 *
 * @param wrappedPrivateKey - Base64-encoded encrypted private key
 * @param wrappingKey - AES-256 key derived from seed phrase
 * @returns Decrypted RSA private key
 */
export async function unwrapPrivateKey(
  wrappedPrivateKey: string,
  wrappingKey: CryptoKey,
): Promise<CryptoKey> {
  const combined = base64ToArrayBuffer(wrappedPrivateKey);
  const combinedArray = new Uint8Array(combined);

  const iv = combinedArray.slice(0, 12);
  const ciphertext = combinedArray.slice(12);

  const privateKeyPkcs8 = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    wrappingKey,
    ciphertext,
  );

  return crypto.subtle.importKey(
    'pkcs8',
    privateKeyPkcs8,
    { name: 'RSA-OAEP', hash: CRYPTO_CONSTANTS.RSA_HASH },
    true,
    ['decrypt'],
  );
}

/**
 * Encrypt RSA private key with master key (derived from user password)
 *
 * @param privateKey - User's RSA private key
 * @param masterKey - Master key derived from password
 * @returns Base64 encoded encrypted private key (IV + ciphertext + auth tag)
 */
export async function encryptPrivateKey(
  privateKey: CryptoKey,
  masterKey: CryptoKey,
): Promise<string> {
  const privateKeyData = await exportPrivateKey(privateKey);
  return encryptWithAES(privateKeyData, masterKey);
}

/**
 * Decrypt RSA private key with master key
 *
 * @param encryptedPrivateKey - Base64 encoded encrypted private key
 * @param masterKey - Master key derived from password
 * @returns Decrypted RSA private key (CryptoKey)
 */
export async function decryptPrivateKey(
  encryptedPrivateKey: string,
  masterKey: CryptoKey,
): Promise<CryptoKey> {
  const privateKeyBase64 = await decryptWithAES(encryptedPrivateKey, masterKey);
  return importPrivateKey(privateKeyBase64);
}
