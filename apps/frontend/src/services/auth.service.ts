import {
  AuthResponse,
  CompleteRegistration,
  LoginRequest,
  LoginTotp,
  PreAuthResponse,
  RecoverPasswordRequest,
  RecoverPasswordResponse,
  RecoveryDataResponse,
  RegisterUserRequest,
  SaltResponse,
  TotpEnroll,
  TotpSetupResponse,
} from '@repo/shared';
import { AxiosError } from 'axios';
import { API_V1_ROUTES } from '../common/constants/api-routes';
import { apiClient } from '../lib/api-client';
import {
  createRecoveryPayload,
  decryptSeedPhrase,
  deriveMasterKey,
  deriveWrappingKeyFromSeedPhrase,
  encryptSeedPhrase,
  encryptWithPublicKey,
  exportPublicKey,
  exportSigningPublicKey,
  exportVaultKey,
  generateRSAKeyPair,
  generateRSASigningKeyPair,
  generateSalt,
  generateSeedPhrase,
  generateSymmetricKey,
  hashPasswordForAuth,
  unwrapPrivateKey,
  unwrapSigningPrivateKey,
  wrapPrivateKey,
  wrapSigningPrivateKey,
} from '@repo/crypto-utils';
import {
  getSessionData,
  getUserKeys,
  saveSessionData,
  saveUserKeys,
} from '../lib/storage';
import { LoginResult, RegistrationResult } from '../types/auth.types';
import { sessionManager } from './session.service';

// ============================================
// Inter-step Caches (module-level, never exported)
// ============================================

interface RegistrationStepOneCache {
  seedPhrase: string;
  masterPassword: string;
  salt: string;
  email: string;
  registrationToken: string;
}

interface LoginStepOneCache {
  masterPassword: string;
  salt: string;
  preAuthToken: string;
}

interface RecoveryStepOneCache {
  enrollToken: string;
  newPassword: string;
  newSalt: string;
}

interface JwtOrganizationClaims {
  organizationId?: string | null;
  organizationType?: string | null;
}

let _registrationCache: RegistrationStepOneCache | null = null;
let _loginCache: LoginStepOneCache | null = null;
let _recoveryCache: RecoveryStepOneCache | null = null;

async function persistOrganizationClaims(accessToken: string): Promise<void> {
  try {
    const [, payload] = accessToken.split('.');
    if (!payload) {
      return;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload =
      normalizedPayload + '='.repeat((4 - (normalizedPayload.length % 4)) % 4);
    const claims = JSON.parse(atob(paddedPayload)) as JwtOrganizationClaims;

    if (claims.organizationId) {
      await saveSessionData('active_organization_id', claims.organizationId);
      await saveSessionData('organization_ids', claims.organizationId);
    }

    if (claims.organizationType) {
      await saveSessionData(
        'active_organization_type',
        claims.organizationType,
      );
    }
  } catch {
    // Ignore malformed tokens here; auth still proceeds.
  }
}

// ============================================
// Registration Flow
// ============================================

/**
 * Step 1 of registration: generate client-side cryptographic material,
 * create the user account on the server, and return TOTP setup data
 * (QR code + plaintext secret).
 *
 * No session is issued. The caller MUST follow up with completeRegistration()
 * once the user has scanned the QR code and can supply a live TOTP code.
 * The QR code plaintext secret should be discarded by the UI after step 2 succeeds.
 *
 * Client-side steps:
 *  1. Generate BIP39 seed phrase (12 words)
 *  2. Generate RSA-4096 encryption key pair
 *  3. Generate RSA-4096 signing key pair
 *  4. Derive wrapping key from seed phrase via HKDF
 *  5. Wrap both private keys with wrapping key (AES-GCM)
 *  6. Generate encryption salt
 *  7. Derive master key from password + salt via PBKDF2
 *  8. Encrypt seed phrase with master key (AES-GCM)
 *  9. Hash master password (Argon2 client-side)
 * 10. Register with server → receive TOTP QR code
 *
 * @param email          - User email address
 * @param username       - User display name
 * @param masterPassword - User's master password (never sent to server)
 * @param onProgress     - Optional progress callback
 * @returns TOTP setup response with QR code data URL and plaintext secret
 */
export async function registerUser(
  email: string,
  username: string,
  masterPassword: string,
  onProgress: (stage: string, progress: number) => void,
): Promise<TotpSetupResponse> {
  try {
    onProgress('Generating recovery phrase...', 8);
    const seedPhrase = await generateSeedPhrase();

    onProgress('Generating encryption keys...', 16);
    const keyPair = await generateRSAKeyPair();

    onProgress('Generating signing keys...', 22);
    const signingKeyPair = await generateRSASigningKeyPair();

    onProgress('Generating salt...', 28);
    const salt = generateSalt();

    onProgress('Deriving wrapping key from recovery phrase...', 34);
    const wrappingKey = await deriveWrappingKeyFromSeedPhrase(seedPhrase);

    onProgress('Wrapping private keys...', 42);
    const encryptedPrivateKey = await wrapPrivateKey(
      keyPair.privateKey,
      wrappingKey,
    );
    const encryptedSigningPrivateKey = await wrapSigningPrivateKey(
      signingKeyPair.privateKey,
      wrappingKey,
    );

    onProgress('Exporting public keys...', 50);
    const publicKey = await exportPublicKey(keyPair.publicKey);
    const signingPublicKey = await exportSigningPublicKey(
      signingKeyPair.publicKey,
    );

    onProgress('Generating vault key...', 58);
    const vaultKey = await generateSymmetricKey();
    const vaultKeyRaw = await exportVaultKey(vaultKey);
    const vaultEncryptedKey = await encryptWithPublicKey(
      vaultKeyRaw,
      keyPair.publicKey,
    );

    onProgress('Deriving master key from password...', 68);
    const masterKey = await deriveMasterKey(masterPassword, salt);

    onProgress('Encrypting recovery phrase...', 75);
    const encryptedSeedPhrase = await encryptSeedPhrase(seedPhrase, masterKey);

    onProgress('Hashing password...', 82);
    const passwordHash = await hashPasswordForAuth(masterPassword);

    onProgress('Registering with server...', 88);
    const requestData: RegisterUserRequest = {
      email: email.toLowerCase().trim(),
      username: username.trim(),
      passwordHash,
      publicKey,
      signingPublicKey,
      encryptedSeedPhrase,
      encryptedPrivateKey,
      encryptedSigningPrivateKey,
      encryptionSalt: salt,
      vaultEncryptedKey,
    };

    const response = await apiClient.post<TotpSetupResponse>(
      API_V1_ROUTES.auth.register,
      requestData,
    );

    // Cache crypto material for step 2. Cleared on completeRegistration() success.
    _registrationCache = {
      seedPhrase,
      masterPassword,
      salt,
      email: email.toLowerCase().trim(),
      registrationToken: response.data.registrationToken,
    };

    onProgress('Scan the QR code to continue...', 95);

    return response.data;
  } catch (error) {
    _registrationCache = null;
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Registration failed. Please try again.',
    );
  }
}

/**
 * Step 2 of registration: verify the TOTP code scanned from the QR code
 * returned by registerUser(), exchange it for a full session token,
 * and bootstrap the local session.
 *
 * MUST be called in the same browser session immediately after registerUser().
 * The in-memory cache populated by step 1 is cleared on success.
 *
 * @param totpCode   - 6-digit TOTP code from the authenticator app
 * @param onProgress - Optional progress callback
 * @returns RegistrationResult containing the seed phrase — show once, store securely
 */
export async function completeRegistration(
  totpCode: string,
  onProgress?: (stage: string, progress: number) => void,
): Promise<RegistrationResult> {
  if (!_registrationCache) {
    throw new Error('No pending registration. Call registerUser() first.');
  }

  const { seedPhrase, masterPassword, salt, email, registrationToken } =
    _registrationCache;

  try {
    onProgress?.('Verifying authenticator code...', 10);

    const dto: CompleteRegistration = { email, totpCode, registrationToken };
    const response = await apiClient.post<AuthResponse>(
      API_V1_ROUTES.auth.registerComplete,
      dto,
    );

    const { accessToken, user } = response.data;

    onProgress?.('Saving authentication data...', 60);
    await apiClient.setAuthToken(accessToken);
    await persistOrganizationClaims(accessToken);

    await saveUserKeys(
      user.id,
      user.encryptedPrivateKey,
      user.encryptedSeedPhrase,
      user.publicKey,
    );
    await saveSessionData('user_id', user.id);
    await saveSessionData('salt', user.encryptionSalt);
    await saveSessionData('user_email', user.email);
    await saveSessionData('user_username', user.username);

    onProgress?.('Initializing secure session...', 85);
    await sessionManager.initializeSession(masterPassword, salt);

    onProgress?.('Registration complete!', 100);

    // Cache is no longer needed once session is bootstrapped.
    _registrationCache = null;

    return {
      success: true,
      seedPhrase,
      user: {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
    };
  } catch (error) {
    // Leave cache intact so the user can retry with a new TOTP code.
    // apiClient rejects with a plain ApiError object (not an Error instance),
    // so extract statusCode/message directly instead of instanceof checks.
    const apiErr = error as { message?: string; statusCode?: number };
    if (apiErr.statusCode === 429) {
      throw new Error(
        'Too many failed attempts. Please wait 15 minutes before trying again.',
      );
    }
    throw new Error(
      apiErr.message ??
        (error instanceof Error
          ? error.message
          : 'Registration completion failed. Please try again.'),
    );
  }
}

/**
 * Validate registration inputs before submission.
 *
 * @param email          - Email address
 * @param username       - Username
 * @param masterPassword - Master password
 * @returns Validation result with error messages
 */
export function validateRegistrationInput(
  email: string,
  username: string,
  masterPassword: string,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email must be a valid email address');
  }

  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
  } else if (username.trim().length < 2) {
    errors.push('Username must be at least 2 characters');
  } else if (username.trim().length > 50) {
    errors.push('Username must not exceed 50 characters');
  }

  if (!masterPassword || masterPassword.length === 0) {
    errors.push('Master password is required');
  } else if (masterPassword.length < 12) {
    errors.push('Master password must be at least 12 characters');
  } else if (masterPassword.length > 128) {
    errors.push('Master password must not exceed 128 characters');
  }

  const hasLower = /[a-z]/.test(masterPassword);
  const hasUpper = /[A-Z]/.test(masterPassword);
  const hasNumber = /[0-9]/.test(masterPassword);
  const hasSpecial = /[!@#$%^&*\-_+=[\]{}|\\:;"'<>,.?/~`]/.test(masterPassword);

  if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
    errors.push(
      'Master password must contain uppercase, lowercase, numbers, and special characters',
    );
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// Login Flow
// ============================================

/**
 * Step 1 of login: verify the master password against the server.
 *
 * If the account has TOTP enrolled, the server returns a short-lived pre-auth
 * token. This function caches the pre-auth token along with the master password
 * and encryption salt for step 2, then returns `{ success: true, requiresTotp: true }`.
 * The caller must then present a TOTP input and call loginWithTotp().
 *
 * If the account has no TOTP secret (legacy path), a full session is issued
 * immediately and the function returns the complete LoginResult.
 *
 * @param email          - User email address
 * @param masterPassword - User's master password
 * @param onProgress     - Optional progress callback
 * @returns LoginResult — check `requiresTotp` to determine whether step 2 is needed
 */
export async function loginUser(
  email: string,
  masterPassword: string,
  onProgress?: (stage: string, progress: number) => void,
): Promise<LoginResult> {
  try {
    onProgress?.('Logging in...', 20);

    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await hashPasswordForAuth(masterPassword);
    const requestData: LoginRequest = {
      email: normalizedEmail,
      passwordHash,
    };

    // Fetch the encryption salt in parallel with the login request.
    // The salt is needed whether or not TOTP is required.
    const [loginResponse, saltResponse] = await Promise.all([
      apiClient.post<AuthResponse | PreAuthResponse>(
        API_V1_ROUTES.auth.login,
        requestData,
      ),
      apiClient.get<SaltResponse>(
        API_V1_ROUTES.auth.getSalt(encodeURIComponent(normalizedEmail)),
      ),
    ]);

    const salt = saltResponse.data.encryptionSalt;

    // Discriminate on the `requiresTotp` field introduced by PreAuthResponse.
    if (
      'requiresTotp' in loginResponse.data &&
      loginResponse.data.requiresTotp
    ) {
      const { preAuthToken } = loginResponse.data as PreAuthResponse;

      // Cache everything needed for step 2. Never expose preAuthToken outside this module.
      _loginCache = { masterPassword, salt, preAuthToken };

      return { success: true, requiresTotp: true };
    }

    // Legacy / single-step path: server issued a full session directly.
    const { accessToken, user } = loginResponse.data as AuthResponse;

    onProgress?.('Deriving master key...', 50);
    const masterKey = await deriveMasterKey(masterPassword, salt);

    onProgress?.('Decrypting recovery phrase...', 65);
    const seedPhrase = await decryptSeedPhrase(
      user.encryptedSeedPhrase,
      masterKey,
    );

    onProgress?.('Deriving wrapping key...', 75);
    await deriveWrappingKeyFromSeedPhrase(seedPhrase);

    onProgress?.('Saving session data...', 85);
    await apiClient.setAuthToken(accessToken);
    await persistOrganizationClaims(accessToken);

    await saveUserKeys(
      user.id,
      user.encryptedPrivateKey,
      user.encryptedSeedPhrase,
      user.publicKey,
    );
    await saveSessionData('user_id', user.id);
    await saveSessionData('salt', user.encryptionSalt);
    await saveSessionData('user_email', user.email);
    await saveSessionData('user_username', user.username);

    onProgress?.('Initializing secure session...', 95);
    await sessionManager.initializeSession(masterPassword, salt);

    onProgress?.('Login complete!', 100);

    return {
      success: true,
      user: {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
    };
  } catch (error) {
    _loginCache = null;
    if (
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      error.statusCode === 429
    ) {
      throw new Error('Too many login attempts. Please try again later.');
    }
    if (error instanceof AxiosError && error.response?.status === 429) {
      throw new Error('Too many login attempts. Please try again later.');
    }
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Login failed. Please check your credentials.',
    );
  }
}

/**
 * Step 2 of login: exchange the cached pre-auth token and the TOTP code
 * for a full session token.
 *
 * MUST be called after loginUser() returned `{ requiresTotp: true }`.
 * The in-memory cache populated by step 1 is cleared on success.
 *
 * @param totpCode   - 6-digit TOTP code from the authenticator app
 * @param onProgress - Optional progress callback
 * @returns Full LoginResult with user data
 */
export async function loginWithTotp(
  totpCode: string,
  onProgress?: (stage: string, progress: number) => void,
): Promise<LoginResult> {
  if (!_loginCache) {
    throw new Error('No pending TOTP login. Call loginUser() first.');
  }

  const { masterPassword, salt, preAuthToken } = _loginCache;

  try {
    onProgress?.('Verifying authenticator code...', 15);

    const dto: LoginTotp = { preAuthToken, totpCode };
    const response = await apiClient.post<AuthResponse>(
      API_V1_ROUTES.auth.loginTotp,
      dto,
    );

    const { accessToken, user } = response.data;

    onProgress?.('Deriving master key...', 40);
    const masterKey = await deriveMasterKey(masterPassword, salt);

    onProgress?.('Decrypting recovery phrase...', 55);
    const seedPhrase = await decryptSeedPhrase(
      user.encryptedSeedPhrase,
      masterKey,
    );

    onProgress?.('Deriving wrapping key...', 70);
    await deriveWrappingKeyFromSeedPhrase(seedPhrase);

    onProgress?.('Saving session data...', 82);
    await apiClient.setAuthToken(accessToken);
    await persistOrganizationClaims(accessToken);

    await saveUserKeys(
      user.id,
      user.encryptedPrivateKey,
      user.encryptedSeedPhrase,
      user.publicKey,
    );
    await saveSessionData('user_id', user.id);
    await saveSessionData('salt', user.encryptionSalt);
    await saveSessionData('user_email', user.email);
    await saveSessionData('user_username', user.username);

    onProgress?.('Initializing secure session...', 93);
    await sessionManager.initializeSession(masterPassword, salt);

    onProgress?.('Login complete!', 100);

    // Cache is no longer needed once session is bootstrapped.
    _loginCache = null;

    return {
      success: true,
      user: {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
    };
  } catch (error) {
    // Leave cache intact so the user can retry with a fresh TOTP code.
    if (error instanceof AxiosError && error.response?.status === 429) {
      throw new Error('Too many attempts. Please try again later.');
    }
    throw new Error(error instanceof Error ? error.message : 'Invalid Code');
  }
}

// ============================================
// Session Unlock (Offline)
// ============================================

export type UnlockSessionResult =
  | { success: true }
  | { success: false; reason: 'missing-data' | 'wrong-password' };

/**
 * Unlock a locked session using the master password.
 *
 * Fully offline — reads the encrypted seed phrase and wrapped private key
 * from IndexedDB, reads the encryption salt from IndexedDB, derives and
 * verifies all keys client-side, then reinitialises the in-memory session
 * manager. No HTTP requests are made.
 *
 * @param masterPassword - User's master password
 * @returns UnlockSessionResult — discriminates between success, missing local
 *          data (requires full re-login), and wrong password (can retry).
 */
export async function unlockSession(
  masterPassword: string,
): Promise<UnlockSessionResult> {
  const [userKeys, salt] = await Promise.all([
    getUserKeys(),
    getSessionData('salt'),
  ]);

  if (!userKeys || !salt) {
    // IndexedDB data is gone — cannot unlock without a full login.
    return { success: false, reason: 'missing-data' };
  }

  try {
    // Derive the master key and attempt to decrypt the seed phrase.
    // An incorrect password will throw during AES-GCM decryption.
    const masterKey = await deriveMasterKey(masterPassword, salt);
    const seedPhrase = await decryptSeedPhrase(
      userKeys.encryptedSeedPhrase,
      masterKey,
    );

    // Verify the seed phrase is usable by deriving the wrapping key and
    // unwrapping the private key. This proves the password is correct.
    const wrappingKey = await deriveWrappingKeyFromSeedPhrase(seedPhrase);
    await unwrapPrivateKey(userKeys.encryptedPrivateKey, wrappingKey);

    // Restore in-memory session state so getMasterKey() / getPrivateKey() work.
    await sessionManager.initializeSession(masterPassword, salt);

    return { success: true };
  } catch {
    // Decryption failed — the password is wrong. IndexedDB data is intact;
    // the user should be allowed to retry with the correct password.
    return { success: false, reason: 'wrong-password' };
  }
}

// ============================================
// Account Recovery
// ============================================

/**
 * Recover account using BIP39 seed phrase.
 *
 * Recovery flow:
 *  1. Derive wrapping key from seed phrase (HKDF)
 *  2. Fetch encrypted recovery data from server
 *  3. Unwrap signing private key with wrapping key
 *  4. Derive new master key from new password + fresh salt
 *  5. Re-encrypt seed phrase with new master key
 *  6. Build signed recovery payload
 *  7. Submit payload — server verifies RSA-PSS signature, updates credentials,
 *     revokes all sessions, generates a fresh TOTP secret, and returns an
 *     enrollment token (purpose=totp-enrollment) + QR code for re-enrollment
 *
 * The enrollment token is cached in `_recoveryCache`. The caller must follow
 * up with `enrollTotpAfterRecovery()` once the user has scanned the QR code.
 *
 * @param email       - User email address
 * @param seedPhrase  - 12-word BIP39 mnemonic
 * @param newPassword - New master password
 * @param onProgress  - Optional progress callback
 * @returns TOTP re-enrollment data (QR code URL and plaintext secret)
 */
export async function recoverAccountWithSeedPhrase(
  email: string,
  seedPhrase: string,
  newPassword: string,
  onProgress?: (stage: string, progress: number) => void,
): Promise<{ qrCodeDataUrl: string; secret: string }> {
  try {
    onProgress?.('Deriving wrapping key from recovery phrase...', 10);
    const wrappingKey = await deriveWrappingKeyFromSeedPhrase(seedPhrase);

    onProgress?.('Fetching user recovery data...', 20);
    const recoveryData = await apiClient.get<RecoveryDataResponse>(
      API_V1_ROUTES.auth.getRecoveryData(
        encodeURIComponent(email.toLowerCase().trim()),
      ),
    );

    const { encryptedPrivateKey, encryptedSigningPrivateKey } =
      recoveryData.data;

    onProgress?.('Unwrapping signing private key...', 30);
    const signingPrivateKey = await unwrapSigningPrivateKey(
      encryptedSigningPrivateKey,
      wrappingKey,
    );

    onProgress?.('Generating new encryption parameters...', 40);
    const newSalt = generateSalt();

    onProgress?.('Deriving new master key...', 50);
    const newMasterKey = await deriveMasterKey(newPassword, newSalt);

    onProgress?.('Encrypting recovery phrase with new password...', 58);
    const newEncryptedSeedPhrase = await encryptSeedPhrase(
      seedPhrase,
      newMasterKey,
    );

    onProgress?.('Re-wrapping private keys with new credentials...', 66);
    const newWrappingKey = await deriveWrappingKeyFromSeedPhrase(seedPhrase);

    const newEncryptedPrivateKey = encryptedPrivateKey;
    const newEncryptedSigningPrivateKey = await wrapSigningPrivateKey(
      signingPrivateKey,
      newWrappingKey,
    );

    onProgress?.('Hashing new password...', 74);
    const newPasswordHash = await hashPasswordForAuth(newPassword);

    onProgress?.('Creating signed recovery payload...', 82);
    const { payload, signature } = await createRecoveryPayload(
      {
        passwordHash: newPasswordHash,
        encryptedSeedPhrase: newEncryptedSeedPhrase,
        encryptedPrivateKey: newEncryptedPrivateKey,
        encryptedSigningPrivateKey: newEncryptedSigningPrivateKey,
        encryptionSalt: newSalt,
      },
      signingPrivateKey,
    );

    onProgress?.('Sending recovery request...', 90);
    const request: RecoverPasswordRequest = {
      email: email.toLowerCase().trim(),
      payload,
      signature,
    };
    const response = await apiClient.post<RecoverPasswordResponse>(
      API_V1_ROUTES.auth.recover,
      request,
    );

    // Cache the enrollment token for the follow-up enrollTotpAfterRecovery() call.
    // The token binds this recovery session to the completing request and is
    // cleared on successful enrollment.
    _recoveryCache = {
      enrollToken: response.data.enrollToken,
      newPassword,
      newSalt,
    };

    onProgress?.('Scan the QR code to re-enrol your authenticator...', 100);

    return {
      qrCodeDataUrl: response.data.qrCodeDataUrl,
      secret: response.data.secret,
    };
  } catch (error) {
    _recoveryCache = null;
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Account recovery failed. Please check your recovery phrase.',
    );
  }
}

/**
 * Final step of account recovery: verify the TOTP code to complete
 * re-enrollment after a seed-phrase recovery.
 *
 * MUST be called after recoverAccountWithSeedPhrase() has succeeded.
 * The in-memory `_recoveryCache` is cleared on success.
 *
 * @param totpCode   - 6-digit TOTP code from the newly-scanned QR code
 * @param onProgress - Optional progress callback
 * @returns LoginResult with user data (no seed phrase — it was retained from recovery)
 */
export async function enrollTotpAfterRecovery(
  totpCode: string,
  onProgress?: (stage: string, progress: number) => void,
): Promise<LoginResult> {
  if (!_recoveryCache) {
    throw new Error(
      'No pending TOTP enrollment. Call recoverAccountWithSeedPhrase() first.',
    );
  }

  const { enrollToken, newPassword, newSalt } = _recoveryCache;

  try {
    onProgress?.('Verifying authenticator code...', 15);

    const dto: TotpEnroll = { enrollToken, totpCode };
    const response = await apiClient.post<AuthResponse>(
      API_V1_ROUTES.auth.enrollTotp,
      dto,
    );

    const { accessToken, user } = response.data;

    onProgress?.('Saving authentication data...', 55);
    await apiClient.setAuthToken(accessToken);
    await persistOrganizationClaims(accessToken);

    await saveUserKeys(
      user.id,
      user.encryptedPrivateKey,
      user.encryptedSeedPhrase,
      user.publicKey,
    );
    await saveSessionData('user_id', user.id);
    await saveSessionData('salt', user.encryptionSalt);
    await saveSessionData('user_email', user.email);
    await saveSessionData('user_username', user.username);

    onProgress?.('Initializing secure session...', 85);
    await sessionManager.initializeSession(newPassword, newSalt);

    onProgress?.('Enrollment complete!', 100);

    _recoveryCache = null;

    return {
      success: true,
      user: {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
    };
  } catch (error) {
    // Leave cache intact so the user can retry with a fresh TOTP code.
    // apiClient rejects with a plain ApiError object (not an Error instance),
    // so extract statusCode/message directly instead of instanceof checks.
    const apiErr = error as { message?: string; statusCode?: number };
    if (apiErr.statusCode === 429) {
      throw new Error(
        'Too many failed attempts. Please wait 15 minutes before trying again.',
      );
    }
    throw new Error(
      apiErr.message ??
        (error instanceof Error
          ? error.message
          : 'TOTP enrollment failed. Please try again.'),
    );
  }
}

/**
 * Logout: invalidate the server session and clear all local cryptographic data.
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post(API_V1_ROUTES.auth.logout);
    sessionManager.clearSession();
    await apiClient.clearAuthToken();
  } catch (error) {
    console.warn('Server logout failed:', error);
  }
}

/**
 * Get current user info from storage.
 *
 * @returns User info or null if not logged in
 */
export async function getCurrentUser(): Promise<{
  userId: string;
  publicKey: string;
} | null> {
  try {
    const keys = await getUserKeys();
    if (!keys) {
      return null;
    }

    return {
      userId: keys.userId,
      publicKey: keys.publicKey,
    };
  } catch {
    return null;
  }
}
