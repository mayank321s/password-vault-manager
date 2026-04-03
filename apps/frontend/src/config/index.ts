export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  appName: import.meta.env.VITE_APP_NAME || 'Password Manager',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  sessionTimeout: parseInt(
    import.meta.env.VITE_SESSION_TIMEOUT || '900000',
    10,
  ), // 15 minutes
  autoLockTimeout: parseInt(
    import.meta.env.VITE_AUTO_LOCK_TIMEOUT || '900000',
    10,
  ), // 15 minutes
  enableSeedPhraseRecovery:
    import.meta.env.VITE_ENABLE_SEED_PHRASE_RECOVERY === 'true',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;
