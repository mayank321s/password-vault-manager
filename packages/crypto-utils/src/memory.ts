// ============================================
// Memory Cleanup Utilities
// ============================================

/**
 * Clear sensitive data from memory (best-effort)
 * Note: JavaScript doesn't provide true memory zeroing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function clearSensitiveData(data: any): void {
  if (data && typeof data === 'object') {
    for (const key in data) {
      if (typeof data[key] === 'string') {
        data[key] = '\0'.repeat(data[key].length);
      } else if (data[key] instanceof Uint8Array) {
        data[key].fill(0);
      } else if (typeof data[key] === 'object') {
        clearSensitiveData(data[key]);
      }
    }
  }
}

/**
 * Auto-clear sensitive data after timeout
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function autoClearAfter(data: any, timeoutMs = 30000): void {
  setTimeout(() => clearSensitiveData(data), timeoutMs);
}
