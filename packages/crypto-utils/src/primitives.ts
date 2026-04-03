// ============================================
// Cryptographic Constants and Primitives
// ============================================

export const CRYPTO_CONSTANTS = {
  RSA_KEY_SIZE: 4096,
  RSA_MODULUS_LENGTH: 4096, // Alias for compatibility
  RSA_PUBLIC_EXPONENT: new Uint8Array([0x01, 0x00, 0x01]), // 65537
  RSA_HASH: 'SHA-256',
  AES_KEY_SIZE: 256,
  AES_IV_SIZE: 12, // 96 bits for GCM
  PBKDF2_ITERATIONS: 600000,
  PBKDF2_HASH: 'SHA-256',
  PBKDF2_KEY_SIZE: 256,
} as const;

/**
 * Convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString('base64');
}

/**
 * Convert Base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  return Buffer.from(base64, 'base64').buffer;
}

/**
 * Generate cryptographically secure random bytes
 */
export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Generate a cryptographically secure salt for PBKDF2
 * Returns Base64 encoded 32-byte (256-bit) salt
 */
export function generateSalt(): string {
  const salt = generateRandomBytes(32);
  return arrayBufferToBase64(salt.buffer as ArrayBuffer);
}
