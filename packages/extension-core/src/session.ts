export interface ExtensionSessionStateLike {
  isLocked: boolean;
  isInitialized: boolean;
  lastActivity: number;
  autoLockTimeout: number;
}

export interface ExtensionSessionSnapshot {
  isLocked: boolean;
  isInitialized: boolean;
  autoLockTimeoutMs: number;
  lastActivityAt: string;
  lockReason: 'manual' | 'idle' | 'unknown';
  userId: string | null;
  organizationId: string | null;
  organizationType: string | null;
}

export function createExtensionSessionSnapshot(input: {
  sessionState: ExtensionSessionStateLike;
  userId: string | null;
  organizationId: string | null;
  organizationType: string | null;
  now?: number;
}): ExtensionSessionSnapshot {
  const now = input.now ?? Date.now();
  const idleWindow = now - input.sessionState.lastActivity;
  const lockReason = input.sessionState.isLocked
    ? idleWindow >= input.sessionState.autoLockTimeout
      ? 'idle'
      : 'manual'
    : 'unknown';

  return {
    isLocked: input.sessionState.isLocked,
    isInitialized: input.sessionState.isInitialized,
    autoLockTimeoutMs: input.sessionState.autoLockTimeout,
    lastActivityAt: new Date(input.sessionState.lastActivity).toISOString(),
    lockReason,
    userId: input.userId,
    organizationId: input.organizationId,
    organizationType: input.organizationType,
  };
}

export function requiresExtensionUnlock(
  snapshot: ExtensionSessionSnapshot,
): boolean {
  return snapshot.isInitialized && snapshot.isLocked;
}
