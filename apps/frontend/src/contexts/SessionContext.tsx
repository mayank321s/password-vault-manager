/**
 * Session Context
 *
 * React Context for managing session state throughout the application.
 * Provides hooks for:
 * - Accessing session lock state
 * - Triggering unlock prompts
 * - Performing actions that require unlocked session
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { sessionManager } from '../services/session.service';
import { broadcastExtensionSessionSnapshot } from '../services/extension-bridge.service';
import { SessionState, UnlockResult } from '../types';
import { clearAllExceptEmail } from '../lib/storage';

// ============================================
// Types
// ============================================

interface SessionContextType {
  sessionState: SessionState;
  isLocked: boolean;
  isInitialized: boolean;
  showUnlockPrompt: boolean;
  lockSession: () => void;
  unlockSession: (password: string) => Promise<UnlockResult>;
  requestUnlock: () => Promise<boolean>;
  dismissUnlockPrompt: () => void;
  updateActivity: () => void;
  setAutoLockTimeout: (minutes: number) => void;
}

interface SessionProviderProps {
  children: ReactNode;
}

// ============================================
// Context
// ============================================

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// ============================================
// Provider Component
// ============================================

export function SessionProvider({ children }: SessionProviderProps) {
  const [sessionState, setSessionState] = useState<SessionState>(
    sessionManager.getState(),
  );
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const [unlockPromiseResolve, setUnlockPromiseResolve] = useState<
    ((value: boolean) => void) | null
  >(null);

  // Subscribe to session state changes
  useEffect(() => {
    const unsubscribe = sessionManager.subscribe((state) => {
      setSessionState(state);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    broadcastExtensionSessionSnapshot(sessionState).catch((error) => {
      console.error('Failed to broadcast extension session state:', error);
    });
  }, [sessionState]);

  // Lock session
  const lockSession = useCallback(() => {
    sessionManager.lockSession();
    clearAllExceptEmail().catch((err) => {
      console.error('Failed to clear session data on lock:', err);
    });
  }, []);

  // Unlock session with password
  const unlockSession = useCallback(
    async (password: string): Promise<UnlockResult> => {
      const result = await sessionManager.unlockSession(password);

      if (result.success) {
        setShowUnlockPrompt(false);
        if (unlockPromiseResolve) {
          unlockPromiseResolve(true);
          setUnlockPromiseResolve(null);
        }
      }

      return result;
    },
    [unlockPromiseResolve],
  );

  // Request unlock (shows prompt and returns promise that resolves when unlocked)
  const requestUnlock = useCallback((): Promise<boolean> => {
    if (!sessionState.isLocked) {
      return Promise.resolve(true);
    }

    return new Promise<boolean>((resolve) => {
      setUnlockPromiseResolve(() => resolve);
      setShowUnlockPrompt(true);
    });
  }, [sessionState.isLocked]);

  // Dismiss unlock prompt
  const dismissUnlockPrompt = useCallback(() => {
    setShowUnlockPrompt(false);
    if (unlockPromiseResolve) {
      unlockPromiseResolve(false);
      setUnlockPromiseResolve(null);
    }
  }, [unlockPromiseResolve]);

  // Update activity
  const updateActivity = useCallback(() => {
    sessionManager.updateActivity();
  }, []);

  // Set auto-lock timeout
  const setAutoLockTimeout = useCallback((minutes: number) => {
    sessionManager.setAutoLockTimeout(minutes);
  }, []);

  const value: SessionContextType = {
    sessionState,
    isLocked: sessionState.isLocked,
    isInitialized: sessionState.isInitialized,
    showUnlockPrompt,
    lockSession,
    unlockSession,
    requestUnlock,
    dismissUnlockPrompt,
    updateActivity,
    setAutoLockTimeout,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

// ============================================
// Hooks
// ============================================

/**
 * useSession Hook
 *
 * Access session state and functions
 */
export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
