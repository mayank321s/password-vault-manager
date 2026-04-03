export interface SessionState {
  isLocked: boolean;
  isInitialized: boolean;
  lastActivity: number;
  autoLockTimeout: number; // in milliseconds
}

export interface UnlockResult {
  success: boolean;
  error?: string;
}
