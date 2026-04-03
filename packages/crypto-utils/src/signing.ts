// ============================================
// RSA-PSS Signing Operations (Account Recovery)
// ============================================

import { arrayBufferToBase64, base64ToArrayBuffer, generateRandomBytes, CRYPTO_CONSTANTS } from './primitives';

/**
 * Generate RSA-4096 key pair for digital signatures
 * Used for account recovery authentication
 */
export async function generateRSASigningKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: CRYPTO_CONSTANTS.RSA_KEY_SIZE,
      publicExponent: CRYPTO_CONSTANTS.RSA_PUBLIC_EXPONENT,
      hash: CRYPTO_CONSTANTS.RSA_HASH,
    },
    true,
    ['sign', 'verify'],
  );
}

/**
 * Export RSA-PSS signing public key to PEM format
 */
export async function exportSigningPublicKey(
  publicKey: CryptoKey,
): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  const base64 = arrayBufferToBase64(exported);
  const pem = `-----BEGIN PUBLIC KEY-----\n${base64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
  return pem;
}

/**
 * Import RSA-PSS signing public key from PEM format
 */
export async function importSigningPublicKey(pem: string): Promise<CryptoKey> {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');

  const keyData = base64ToArrayBuffer(base64);

  return crypto.subtle.importKey(
    'spki',
    keyData,
    {
      name: 'RSA-PSS',
      hash: CRYPTO_CONSTANTS.RSA_HASH,
    },
    true,
    ['verify'],
  );
}

/**
 * Export RSA-PSS signing private key to PKCS#8 format
 */
export async function exportSigningPrivateKey(
  privateKey: CryptoKey,
): Promise<string> {
  const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
  return arrayBufferToBase64(exported);
}

/**
 * Import RSA-PSS signing private key from PKCS#8 format
 */
export async function importSigningPrivateKey(
  base64: string,
): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(base64);

  return crypto.subtle.importKey(
    'pkcs8',
    keyData,
    {
      name: 'RSA-PSS',
      hash: CRYPTO_CONSTANTS.RSA_HASH,
    },
    true,
    ['sign'],
  );
}

/**
 * Sign data with RSA-PSS private key
 * Used to prove possession of private key during account recovery
 */
export async function signPayload(
  data: string,
  signingPrivateKey: CryptoKey,
): Promise<string> {
  const dataBytes = new TextEncoder().encode(data);

  const signature = await crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: 32,
    },
    signingPrivateKey,
    dataBytes,
  );

  return arrayBufferToBase64(signature);
}

/**
 * Verify signature with RSA-PSS public key
 */
export async function verifySignature(
  data: string,
  signature: string,
  signingPublicKey: CryptoKey,
): Promise<boolean> {
  try {
    const dataBytes = new TextEncoder().encode(data);
    const signatureBytes = base64ToArrayBuffer(signature);

    return await crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32,
      },
      signingPublicKey,
      signatureBytes,
      dataBytes,
    );
  } catch {
    return false;
  }
}

/**
 * Wrap (encrypt) RSA-PSS signing private key with AES wrapping key
 */
export async function wrapSigningPrivateKey(
  signingPrivateKey: CryptoKey,
  wrappingKey: CryptoKey,
): Promise<string> {
  const privateKeyPkcs8 = await crypto.subtle.exportKey(
    'pkcs8',
    signingPrivateKey,
  );
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
 * Unwrap (decrypt) RSA-PSS signing private key with AES wrapping key
 */
export async function unwrapSigningPrivateKey(
  wrappedSigningPrivateKey: string,
  wrappingKey: CryptoKey,
): Promise<CryptoKey> {
  const combined = base64ToArrayBuffer(wrappedSigningPrivateKey);
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
    { name: 'RSA-PSS', hash: CRYPTO_CONSTANTS.RSA_HASH },
    true,
    ['sign'],
  );
}

/**
 * Create signed recovery payload for password reset after seed phrase recovery
 */
export async function createRecoveryPayload(
  payload: {
    passwordHash: string;
    encryptedSeedPhrase: string;
    encryptedPrivateKey: string;
    encryptedSigningPrivateKey: string;
    encryptionSalt: string;
  },
  signingPrivateKey: CryptoKey,
): Promise<{ payload: string; signature: string }> {
  const payloadJson = JSON.stringify(payload);
  const signature = await signPayload(payloadJson, signingPrivateKey);

  return {
    payload: btoa(payloadJson),
    signature,
  };
}

/**
 * Verify recovery payload signature
 */
export async function verifyRecoveryPayload(
  payloadBase64: string,
  signature: string,
  signingPublicKey: CryptoKey,
): Promise<{
  passwordHash: string;
  encryptedSeedPhrase: string;
  encryptedPrivateKey: string;
  encryptedSigningPrivateKey: string;
  encryptionSalt: string;
} | null> {
  try {
    const payloadJson = atob(payloadBase64);
    const isValid = await verifySignature(payloadJson, signature, signingPublicKey);

    if (!isValid) {
      return null;
    }

    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}
