// ============================================
// Password Utilities
// ============================================

import { sha256 } from '@noble/hashes/sha2.js';
import { generateRandomBytes } from './primitives';

/**
 * Hash password for authentication (client-side pre-hashing)
 *
 * @param password - User's master password
 * @returns Base64 encoded SHA-256 hash
 */
export async function hashPasswordForAuth(password: string): Promise<string> {
  return Buffer.from(sha256(Buffer.from(password))).toString('base64');
}

/**
 * Generate a secure random master password (modulo-biased, legacy)
 * Prefer generatePassword from password-utils for new code.
 */
export function generateMasterPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*-_+=';
  const allChars = uppercase + lowercase + numbers + special;

  const length = 16;
  const randomBytes = generateRandomBytes(length);

  let password = '';
  for (let i = 0; i < length; i++) {
    password += allChars[randomBytes[i]! % allChars.length];
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*\-_+=]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return generateMasterPassword();
  }

  return password;
}

/**
 * Calculate password strength score (0-4)
 *
 * @param password - Password to evaluate
 * @returns Score from 0-4 and feedback message
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  feedback: string;
} {
  if (password.length < 8) {
    return { score: 0, feedback: 'Password must be at least 8 characters' };
  }

  let score = 1;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*\-_+=[\]{}|\\:;"'<>,.?/~`]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(
    Boolean,
  ).length;

  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (password.length >= 20) score++;

  if (varietyCount >= 3) score++;
  if (varietyCount >= 4) score++;

  const hasRepeatingChars = /(.)\1{2,}/.test(password);
  const hasSequential =
    /(abc|bcd|cde|def|efg|123|234|345|456|567|678|789)/i.test(password);
  if (hasRepeatingChars || hasSequential) score = Math.max(1, score - 1);

  score = Math.min(4, Math.max(0, score - 1));

  const feedbackMessages = [
    'Very weak - Use a longer password with mixed characters',
    'Weak - Add more character variety and length',
    'Fair - Consider adding special characters',
    'Strong - Good password!',
    'Very strong - Excellent password!',
  ];

  return {
    score,
    feedback: feedbackMessages[score] || '',
  };
}
