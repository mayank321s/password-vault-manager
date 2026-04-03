/**
 * Session Management Service
 *
 * Manages in-memory encryption keys and session state for the zero-knowledge
 * password manager. Provides functionality for:
 * - Secure in-memory storage of master key (encrypted)
 * - Decrypted private key caching with auto-clear
 * - Session locking/unlocking
 * - Auto-lock after inactivity
 * - Activity tracking
 */

import {
  decryptSeedPhrase,
  deriveMasterKey,
  deriveWrappingKeyFromSeedPhrase,
  unwrapPrivateKey,
} from '@repo/crypto-utils';
import { getUserKeys } from '../lib/storage';
import { SessionState, UnlockResult } from '../types';

// ============================================
// Session Storage (In-Memory)
// ============================================

class SessionManager {
  static instance: SessionManager;
  private password: string = '';
  private salt: string = '';
  private cachedPrivateKey: CryptoKey | null = null;
  private privateKeyCacheTimeout: ReturnType<typeof setTimeout> | null = null;
  private state: SessionState = {
    isLocked: true,
    isInitialized: false,
    lastActivity: Date.now(),
    autoLockTimeout: 15 * 60 * 1000, // 15 minutes default
  };
  private listeners: Set<(state: SessionState) => void> = new Set();
  private autoLockTimer: ReturnType<typeof setTimeout> | null = null;

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Initialize the session after login
   * Stores the master key encrypted with a session-specific key
   */
  async initializeSession(
    password: string,
    salt: string,
    autoLockMinutes: number = 15,
  ): Promise<void> {
    try {
      this.password = password;
      this.salt = salt;
      this.state.isLocked = false;
      this.state.isInitialized = true;
      this.state.autoLockTimeout = autoLockMinutes * 60 * 1000;
      this.updateActivity();
      this.notifyListeners();
      this.startAutoLockTimer();
    } catch (error) {
      console.error('Failed to initialize session:', error);
      throw new Error('Failed to initialize session');
    }
  }

  /**
   * Lock the session
   * Clears all in-memory keys
   */
  lockSession(): void {
    this.clearPrivateKeyCache();
    this.state.isLocked = true;
    this.stopAutoLockTimer();
    this.notifyListeners();
  }

  /**
   * Unlock the session with master password
   * Verifies the password by attempting to decrypt the stored private key
   */
  async unlockSession(masterPassword: string): Promise<UnlockResult> {
    try {
      const userKeys = await getUserKeys();
      if (!userKeys) {
        return { success: false, error: 'User keys not found' };
      }

      if (!this.salt) {
        return { success: false, error: 'Encryption salt not found' };
      }

      try {
        const masterKey = await deriveMasterKey(masterPassword, this.salt);
        const seedPhrase = await decryptSeedPhrase(
          userKeys.encryptedSeedPhrase,
          masterKey,
        );
        const wrappingKey = await deriveWrappingKeyFromSeedPhrase(seedPhrase);
        const privateKey = await unwrapPrivateKey(
          userKeys.encryptedPrivateKey,
          wrappingKey,
        );

        this.password = masterPassword;
        this.cachedPrivateKey = privateKey;
        this.startPrivateKeyCacheTimeout();

        this.state.isLocked = false;
        this.updateActivity();
        this.notifyListeners();
        this.startAutoLockTimer();

        return { success: true };
      } catch {
        return { success: false, error: 'Invalid master password' };
      }
    } catch (error) {
      console.error('Failed to unlock session:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to unlock session',
      };
    }
  }

  /**
   * Get the decrypted master key for sensitive operations
   * Requires session to be unlocked
   */
  async getMasterKey(): Promise<CryptoKey | null> {
    if (this.state.isLocked) {
      return null;
    }

    try {
      this.updateActivity();

      // Import the master key
      const masterKey = await deriveMasterKey(this.password, this.salt);

      return masterKey;
    } catch (error) {
      console.error('Failed to decrypt master key:', error);
      return null;
    }
  }

  /**
   * Get the user's private key
   * If cached, returns immediately. Otherwise, decrypts from storage.
   */
  async getPrivateKey(): Promise<CryptoKey | null> {
    if (this.state.isLocked) {
      return null;
    }

    this.updateActivity();

    if (this.cachedPrivateKey) {
      return this.cachedPrivateKey;
    }

    try {
      const userKeys = await getUserKeys();
      if (!userKeys) {
        return null;
      }

      const masterKey = await deriveMasterKey(this.password, this.salt);
      const seedPhrase = await decryptSeedPhrase(
        userKeys.encryptedSeedPhrase,
        masterKey,
      );
      const wrappingKey = await deriveWrappingKeyFromSeedPhrase(seedPhrase);
      const privateKey = await unwrapPrivateKey(
        userKeys.encryptedPrivateKey,
        wrappingKey,
      );

      this.cachedPrivateKey = privateKey;
      this.startPrivateKeyCacheTimeout();

      return privateKey;
    } catch (error) {
      console.error('Failed to get private key:', error);
      return null;
    }
  }

  /**
   * Clear the cached private key
   * Called after timeout or when locking session
   */
  private clearPrivateKeyCache(): void {
    this.cachedPrivateKey = null;
    if (this.privateKeyCacheTimeout) {
      clearTimeout(this.privateKeyCacheTimeout);
      this.privateKeyCacheTimeout = null;
    }
  }

  /**
   * Start timeout to clear cached private key
   * Private key is cached for 5 minutes after last use
   */
  private startPrivateKeyCacheTimeout(): void {
    if (this.privateKeyCacheTimeout) {
      clearTimeout(this.privateKeyCacheTimeout);
    }

    this.privateKeyCacheTimeout = setTimeout(
      () => {
        this.clearPrivateKeyCache();
      },
      5 * 60 * 1000,
    ); // 5 minutes
  }

  /**
   * Update last activity timestamp
   * Resets auto-lock timer
   */
  updateActivity(): void {
    this.state.lastActivity = Date.now();
    if (!this.state.isLocked) {
      this.resetAutoLockTimer();
    }
  }

  /**
   * Start the auto-lock timer
   */
  private startAutoLockTimer(): void {
    this.stopAutoLockTimer();
    this.autoLockTimer = setTimeout(() => {
      this.lockSession();
    }, this.state.autoLockTimeout);
  }

  /**
   * Stop the auto-lock timer
   */
  private stopAutoLockTimer(): void {
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }
  }

  /**
   * Reset the auto-lock timer
   */
  private resetAutoLockTimer(): void {
    if (!this.state.isLocked) {
      this.startAutoLockTimer();
    }
  }

  /**
   * Set auto-lock timeout
   */
  setAutoLockTimeout(minutes: number): void {
    this.state.autoLockTimeout = minutes * 60 * 1000;
    if (!this.state.isLocked) {
      this.resetAutoLockTimer();
    }
    this.notifyListeners();
  }

  /**
   * Get current session state
   */
  getState(): SessionState {
    return { ...this.state };
  }

  /**
   * Check if session is locked
   */
  isLocked(): boolean {
    return this.state.isLocked;
  }

  /**
   * Check if session is initialized
   */
  isInitialized(): boolean {
    return this.state.isInitialized;
  }

  /**
   * Subscribe to session state changes
   */
  subscribe(listener: (state: SessionState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  /**
   * Clear the session completely
   * Called on logout
   */
  clearSession(): void {
    this.lockSession();
    this.state.isInitialized = false;
    this.notifyListeners();
  }

  /**
   * Require unlocked session for sensitive operations
   * Throws error if session is locked
   */
  requireUnlocked(): void {
    if (this.state.isLocked) {
      throw new Error('Session is locked. Please unlock to continue.');
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
