### **Plan: Registration Security Hardening**

This plan details the necessary steps to enhance the security of the user registration flow. The core idea is to introduce a token-based mechanism to link the registration initiation and completion steps, preventing unauthorized access and brute-force attacks.

#### **Phase 1: Database and Model Updates** ✅

1.  **Update User Model**:
    *   Navigate to user.model.ts.
    *   Add four new optional fields to the `User` model definition to track registration state:
        *   `registrationCompletedAt`: A `Date` to timestamp when registration is finalized.
        *   `registrationJti`: A `string` to store the JWT ID of the registration token.
        *   `totpRegistrationAttempts`: A `number` to count failed TOTP verification attempts during registration.
        *   `totpRegistrationLockedUntil`: A `Date` to lock the account from further registration attempts if the attempt threshold is breached.

2.  **Create Database Migration**:
    *   Generate a new Sequelize migration file in migrations.
    *   The migration will add the corresponding columns to the `Users` table:
        *   `registration_completed_at` (TIMESTAMPTZ, nullable)
        *   `registration_jti` (VARCHAR(255), nullable)
        *   `totp_registration_attempts` (INTEGER, not null, default 0)
        *   `totp_registration_locked_until` (TIMESTAMPTZ, nullable)
    *   Ensure the down migration correctly removes these four columns.

#### **Phase 2: Shared Schemas and DTOs** ✅

1.  **Update Shared Zod Schemas**:
    *   Open auth.schema.ts.
    *   Modify `completeRegistrationSchema` to require a `registrationToken` (string, min 10).
    *   Modify `totpSetupResponseSchema` to include `registrationToken` (string).
    *   Add a new `recoverPasswordResponseSchema` to include `enrollToken`, `qrCodeDataUrl`, `secret`, and `email`.
    *   Create a new `totpEnrollSchema` for post-recovery TOTP setup, containing `enrollToken` (min 10) and `totpCode`.

2.  **Update Backend DTOs**:
    *   Navigate to auth.dto.ts.
    *   Create new DTO classes: `TotpEnrollDto` and `RecoverPasswordResponseDto` using `createZodDto`.

3.  **Update Shared Types**:
    *   Add `TotpEnroll` and `RecoverPasswordResponse` type exports to auth.types.ts.

#### **Phase 3: Core Backend Logic** ✅

1.  **Enhance `AuthService`**:
    *   **`register` method**: Generate `registrationJti`, store on user row, sign 15-minute JWT with `purpose=registration-completion`, return as `registrationToken`.
    *   **`completeRegistration` method**: Enforce 6 ordered security layers — JWT verify, purpose check, subject-email binding, JTI binding, completion guard, per-account TOTP lockout. Track failed attempts with 15-minute lockout at threshold 5.
    *   **`recoverPassword` method**: Return type changed to `RecoverPasswordResponseDto`. Generate fresh TOTP secret, sign 15-minute `enrollToken` (purpose=totp-enrollment), reset registration state fields, return QR code and enrollment token.
    *   **New `enrollTotp` method**: Mirror of `completeRegistration` for post-recovery TOTP re-enrollment. Resolves user via `token.sub`, enforces purpose/JTI/lockout guards.

2.  **Update `AuthController`**:
    *   `POST /register/complete` throttle tightened to 3 attempts per 15 minutes.
    *   New `POST /totp/enroll` endpoint (3/15 min throttle) calling `enrollTotp`.

---

#### **Phase 4: Frontend — API Routes and Service Layer**

**Goal:** Update the frontend service layer to pass `registrationToken` when completing registration and to drive the new post-recovery TOTP enrollment step.

1.  **Add `enrollTotp` API route**:
    *   Open `apps/frontend/src/common/constants/api-routes.ts`.
    *   Add `enrollTotp: '/api/v1/auth/totp/enroll'` to the `auth` routes object.

2.  **Update `_registrationCache` type**:
    *   In `apps/frontend/src/services/auth.service.ts`, the module-level `_registrationCache` type must include `registrationToken: string`.
    *   When `registerUser()` receives the `TotpSetupResponse` (which now carries `registrationToken`), store it in the cache alongside the existing fields.

3.  **Update `completeRegistration(totpCode)`**:
    *   Read `registrationToken` from `_registrationCache`.
    *   If not present (cache expired or cleared), throw with a clear message prompting the user to restart registration.
    *   Include `registrationToken` in the `POST /register/complete` request body.
    *   No changes to success/failure handling — the function already stores the session and returns the seed phrase.

4.  **Add `_recoveryCache` for enrollment token**:
    *   Add a module-level `_recoveryCache: { enrollToken: string } | null` variable.
    *   After `recoverAccountWithSeedPhrase()` receives the new response (`enrollToken`, `qrCodeDataUrl`, `secret`), store `enrollToken` in `_recoveryCache`.
    *   Return `{ qrCodeDataUrl, secret }` from the function so the calling UI can display the QR code and enter the TOTP code.

5.  **Add `enrollTotpAfterRecovery(totpCode)`**:
    *   New exported function in `auth.service.ts`.
    *   Reads `enrollToken` from `_recoveryCache`. Throws if not present (session expired).
    *   POSTs `{ enrollToken, totpCode }` to `enrollTotp` route.
    *   On success: calls existing session initialization logic (store auth token, user keys, initialize session manager) identically to `completeRegistration()`.
    *   Clears `_recoveryCache` on success.
    *   Returns `{ success: true, user }` — no seed phrase returned since the seed phrase is retained from before recovery.

6.  **Update `useAuthMutations.ts`**:
    *   Add `useEnrollTotpMutation({ setProgress })` that calls `enrollTotpAfterRecovery()`.

---

#### **Phase 5: Frontend — Account Recovery UI**

**Goal:** Extend the recovery page with a post-recovery TOTP setup step that mirrors the registration TOTP setup step.

1.  **Update `pages/account-recovery/types.ts`**:
    *   Extend `RecoveryStep` type to include `'totp-setup'` and `'complete'`.
    *   Add `RecoveryTotpData` interface: `{ qrCodeDataUrl: string; secret: string }`.

2.  **Update `pages/account-recovery/account-recovery.hook.ts`**:
    *   Add state: `step: RecoveryStep` (default `'form'`), `totpCode: string`, `recoveryTotpData: RecoveryTotpData | null`.
    *   Change `recoveryMutation` `onSuccess`: instead of navigating to `/login`, set `step = 'totp-setup'` and store `qrCodeDataUrl` + `secret` in state.
    *   Add `enrollMutation` using `useEnrollTotpMutation`. On success navigate to `/vaults` (user is now fully authenticated). On error surface the error message (lockout, invalid code, expired token).
    *   Add `handleTotpCodeChange(value: string)`: enforce numeric-only, max 6 digits.
    *   Add `handleTotpSubmit(e)`: validate 6-digit code, call `enrollMutation`.
    *   Add `handleRestartRecovery()`: reset all state back to `'form'` step and clear `_recoveryCache` via a cleanup call.

3.  **Update `pages/account-recovery/account-recovery.tsx`**:
    *   Add `totp-setup` step render branch.
    *   Reuse the same QR code + manual entry + 6-digit input UI pattern from `pages/register/register.tsx` (no abstraction needed — copy the structure, adapt labels to say "Re-enroll your authenticator app").
    *   Display the `secret` for manual entry.
    *   Show submit button that calls `handleTotpSubmit`.
    *   Add a "Back / restart recovery" link that calls `handleRestartRecovery`.

---

#### **Phase 6: Frontend — Error Handling and UX**

**Goal:** Surface lockout state, token expiry, and attempt counts clearly in the UI.

1.  **Registration TOTP step (`pages/register/`)**:
    *   If `completeRegistrationMutation` returns a 401 error, show `"Invalid code. Please try again."`.
    *   If it returns a 429 error, show `"Too many failed attempts. Please wait 15 minutes before trying again."` and disable the submit button until the lockout window clears or the user restarts registration.
    *   If the `registrationToken` is missing from cache (window left open > 15 min), show `"Your registration session has expired. Please start over."` and call `handleRestartRegistration()`.

2.  **Recovery TOTP step (`pages/account-recovery/`)**:
    *   Same 401 / 429 error handling pattern as above for `enrollMutation`.
    *   If `_recoveryCache` is cleared (token expired), surface `"Your recovery session has expired. Please restart the recovery process."`.

3.  **`api-client.ts` 429 response handling**:
    *   Verify the existing 429 interceptor surfaces the `message` field from the backend response body rather than a generic string. If not, update the interceptor to extract `response.data.message`.

