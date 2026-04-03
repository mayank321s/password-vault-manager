/**
 * Password Utilities
 *
 * Utilities for password generation and strength calculation
 * SECURITY: Uses crypto.getRandomValues() for cryptographically secure random number generation
 */

interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

// Character sets for password generation
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * Generate cryptographically secure random integer in range [0, max)
 * Uses crypto.getRandomValues() instead of Math.random() for security
 */
function getSecureRandomInt(max: number): number {
  // Generate enough random bytes to avoid modulo bias
  const randomBytes = new Uint32Array(1);
  crypto.getRandomValues(randomBytes);

  // Use rejection sampling to avoid modulo bias
  const randomValue = randomBytes[0]!;
  const range = Math.floor(0xffffffff / max) * max;

  if (randomValue < range) {
    return randomValue % max;
  }

  // Retry if value is outside acceptable range (rare)
  return getSecureRandomInt(max);
}

/**
 * Generate a random password based on options
 * SECURITY: Uses crypto.getRandomValues() for cryptographically secure randomness
 */
export function generatePassword(options: PasswordGeneratorOptions): string {
  let charset = '';
  const required: string[] = [];

  if (options.includeLowercase) {
    charset += LOWERCASE;
    required.push(LOWERCASE[getSecureRandomInt(LOWERCASE.length)]!);
  }

  if (options.includeUppercase) {
    charset += UPPERCASE;
    required.push(UPPERCASE[getSecureRandomInt(UPPERCASE.length)]!);
  }

  if (options.includeNumbers) {
    charset += NUMBERS;
    required.push(NUMBERS[getSecureRandomInt(NUMBERS.length)]!);
  }

  if (options.includeSymbols) {
    charset += SYMBOLS;
    required.push(SYMBOLS[getSecureRandomInt(SYMBOLS.length)]!);
  }

  if (charset.length === 0) {
    charset = LOWERCASE + UPPERCASE + NUMBERS;
    required.push(LOWERCASE[getSecureRandomInt(LOWERCASE.length)]!);
  }

  const remainingLength = Math.max(0, options.length - required.length);
  const randomChars: string[] = [];

  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = getSecureRandomInt(charset.length);
    randomChars.push(charset[randomIndex]!);
  }

  const allChars = [...required, ...randomChars];

  // Fisher-Yates shuffle with cryptographically secure random
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [allChars[i], allChars[j]] = [allChars[j]!, allChars[i]!];
  }

  return allChars.join('');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Copy sensitive text to clipboard with auto-clear
 * Automatically clears clipboard after specified timeout (default: 30 seconds)
 */
export async function copyToClipboardSecure(
  text: string,
  autoClearTimeout: number = 30000,
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);

    // Schedule automatic clipboard clear
    if (autoClearTimeout > 0) {
      setTimeout(async () => {
        try {
          // Read current clipboard content
          const currentClipboard = await navigator.clipboard.readText();

          // Only clear if our text is still in the clipboard
          if (currentClipboard === text) {
            await navigator.clipboard.writeText('');
          }
        } catch (error) {
          // Clipboard read might fail due to permissions, silently ignore
          console.debug('Could not auto-clear clipboard:', error);
        }
      }, autoClearTimeout);
    }

    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
