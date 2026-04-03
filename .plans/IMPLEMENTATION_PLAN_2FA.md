# 2FA (TOTP) Agentic Implementation Plan

## Overview
Implement a Time-Based One-Time Password (TOTP) two-factor authentication flow.
- **Registration**: Transition from standard form submission to generating a TOTP setup (QR code) before finalizing the user creation and exposing the seed phrase.
- **Login**: Split into two distinct stages using a short-lived `preAuthToken` JWT boundary. Stage 1 verifies the password; Stage 2 verifies the TOTP code.
- **Unlock**: Overhaul the unlock mechanism to operate entirely offline (client-side) using IndexedDB, bypassing TOTP and server validation outright.

---

## Phase 1: Environment Setup
1. **Add Backend Dependencies**: Install specific packages to the backend workspace using your package manager.
   - Install dependencies: `otplib` and `qrcode`.
   - Install dev-dependencies: type definitions for `qrcode`.
2. **Environment Variables**: Add a new environment variable `TOTP_ENCRYPTION_KEY` (a 256-bit / 32-byte hex or base64 string) to the backend `.env` and configuration module. This will be used for AES-256-GCM encryption of the TOTP secrets at rest.

---

## Phase 2: Database Schema & Type Definitions
### Step 2.1: Database Migration
1. **Target**: Create a new timestamped migration file in the backend database migrations directory.
2. **Up Action**: Add an optional varchar column named `totp_secret` (max length 255) to the `users` table. This column will hold the encrypted base32 secret. It is nullable only to support the transient state between initial registration and registration completion.
3. **Down Action**: Instruct the migration to drop the `totp_secret` column from the `users` table.

### Step 2.2: ORM Model Modification
1. **Target**: Backend `user.model.ts`.
2. **Action**: Add the new column to the class definition. Map `totpSecret` as an optional string model property.

### Step 2.3: Shared Zod Schemas & Types
1. **Target**: auth.schema.ts.
2. **Action**: Define and export the following literal validation schemas:
   - **PreAuthResponse**: Needs a true literal boolean `requiresTotp` and a string `preAuthToken`.
   - **TotpSetupResponse**: Needs strings for `qrCodeDataUrl`, `secret`, and `email`.
   - **TotpVerify**: Needs a `totpCode` string exactly 6 numeric digits long.
   - **CompleteRegistration**: Extends `TotpVerify`, adding a valid `email` string.
   - **LoginTotp**: Extends `TotpVerify`, adding a `preAuthToken` string.
3. **Action**: Export their inferred TypeScript types in the corresponding `auth.types.ts` package.

---

## Phase 3: Backend Application Logic
### Step 3.1: TotpService Creation
1. **Target**: Create `apps/backend/src/common/services/totp.service.ts`.
2. **Action**: Create an injectable NestJS service class that injects the backend configuration to access `TOTP_ENCRYPTION_KEY`.
3. **Methods**:
   - `generateSecret`: Uses `otplib` authenticator to generate and return a base32 secret.
   - `encryptSecret`: Takes a raw base32 secret and encrypts it using Node's native `crypto` module (AES-256-GCM) with the `TOTP_ENCRYPTION_KEY`. Returns a concatenated string (e.g., `iv:authTag:encryptedData`).
   - `decryptSecret`: Takes the encrypted string, extracts the IV and auth tag, and decrypts it back to the raw base32 secret using AES-256-GCM.
   - `generateQRCodeDataUrl`: Accepts a raw secret and email. Uses `otplib` to format a standard KeyURI (Issuer: "Password Manager"), then parses that into a data URL using the `qrcode` library.
   - `verify`: Accepts a token and an **encrypted** secret. It first decrypts the secret using `decryptSecret`, then uses `otplib` to verify the token against the raw secret, wrapping in a try-catch to swallow parsing errors and return a boolean.
4. **Action**: Register this new service in the Backend `AuthModule` providers.

### Step 3.2: DTO Generation
1. **Target**: Backend `auth.dto.ts`.
2. **Action**: Create and export class-based DTOs wrapping the five new shared Zod schemas to serve as API payload validations.

### Step 3.3: Global JWT Strategy Security (Crucial Addition)
1. **Target**: Backend global JWT guard or JWT strategy template (`jwt.strategy.ts` or similar).
2. **Action**: Add explicit validation asserting that the decoded token payload's `purpose` claim does **not** equal `totp-login`. If it does, immediately throw an Unauthorized error. This prevents the temporary pre-auth token from being passed into fully authenticated system routes.

### Step 3.4: AuthService Registration Overhaul
1. **Target**: Backend `auth.service.ts` - `register` method.
2. **Action**: Inside the database transaction, prior to creating the user record, rely on the `TotpService` to generate a raw secret. Immediately encrypt this secret using `TotpService.encryptSecret`. Apply this **encrypted** secret to the initial user entity.
3. **Action**: Post-transaction, do not generate a user session. Instead, generate the QR code data URL using the service (passing the **raw**, unencrypted secret), and return an object combining the QR code URL, the raw textual secret, and the user's email.

### Step 3.5: AuthService Complete Registration Handshake
1. **Target**: Backend `auth.service.ts` - Add `completeRegistration` method.
2. **Action**: Accept an email and a 6-digit TOTP code. Find the user by email.
3. **Action**: Validate the provided code against the user's database `totpSecret` using `TotpService`. Throw Unauthorized on failure.
4. **Action**: On success, generate standard authentication tokens and sessions, and return the standard complete authentication response.

### Step 3.6: AuthService Login Split
1. **Target**: Backend `auth.service.ts` - `login` method.
2. **Action**: Upon successful password verification, ensure the user has a `totpSecret` associated with their account.
3. **Action**: If `totpSecret` is missing, throw an `UnauthorizedException` stating that the user must complete their 2FA registration before accessing the application. (No legacy bypass padding is allowed).
4. **Action**: If a `totpSecret` exists, inject a temporary payload via the `jwtService` with the subject mapped to the user ID and a strict custom claim `purpose: 'totp-login'` set to expire in 5 minutes. Return the flag `requiresTotp: true` alongside this transient token.

### Step 3.7: AuthService Finalize Login
1. **Target**: Backend `auth.service.ts` - Add `loginWithTotp` method.
2. **Action**: Accept the `preAuthToken` and TOTP code. Manually decode the JWT and explicitly check that the purpose claim is exactly `totp-login`. Throw Unauthorized if missing or altered.
3. **Action**: Retrieve the user by the JWT subject ID. Use the `TotpService` to verify the provided 6-digit code against their securely encrypted `totpSecret`. Throw Unauthorized on failure.
4. **Action**: Produce the final valid session tokens and return the standard authentication payload.

### Step 3.8: Account Recovery Overhaul (Crucial Addition)
1. **Target**: Backend Account Recovery handler logic.
2. **Action**: If an account is successfully recovered (via standard email/master key reset logic), the process MUST explicitly nullify the `totpSecret` in the database so the user can be routed to set up a new authenticator upon their next login attempt.

### Step 3.9: API Controller Exposure
1. **Target**: Backend `auth.controller.ts`.
2. **Action**: Update the `/register` endpoint's return envelope.
3. **Action**: Expose `POST /register/complete` utilizing the `CompleteRegistration` DTO with an aggressive throttle guard limiting to 5 requests per hour.
4. **Action**: Expose `POST /login/totp` utilizing the `LoginTotp` DTO bounding with an aggressive throttle guard of 5 requests per 15 minutes.

---

## Phase 4: Frontend Implementations
### Step 4.1: API Endpoints Registration
1. **Target**: Frontend `api-routes.ts`.
2. **Action**: Expose string constants matching the path to `register/complete` and `login/totp`.

### Step 4.2: Frontend AuthService Orchestration
1. **Target**: Frontend `services/auth.service.ts`.
2. **Action - Register Step 1**: Adapt the `registerUser` function to strictly post external data and return the `TotpSetupResponse` object, whilst caching the memory-bound crypto properties (salt, raw email, masterPassword) to avoid form recreation.
3. **Action - Register Step 2**: Create a new function targeting the verification endpoint using the cached primitives. On successful API response, perform the localized seed-phrase decryption and bootstrap the session manager using indexed variables.
4. **Action - Login Step 1**: Refactor `loginUser` to target the login endpoint. Anticipate the `requiresTotp` payload response. The method should now natively assume it will transition control UI state over to the TOTP component, while keeping login primitives cached locally. Do not support bypassing Stage 2.
5. **Action - Login Step 2**: Generate a function hitting `login/totp` with the API pre-token. Upon success, fetch salt independently (if external), derive all required keys, and bootstrap the local session.
6. **Action - Offline Unlock (Crucial redesign)**: Author a standalone offline method `unlockSession`. Use it to execute local indexDB lookouts for the cached encrypted seed phrase. Re-derive the master key cleanly relying only on client hardware without any HTTP traffic whatsoever. Returns a binary success state.

### Step 4.3: User Interface Registration View
1. **Target**: Frontend `pages/register/` hook and component files.
2. **Action**: Update localized routing enumerators. Extend local component-state bounds to track the active QR context variables pending execution. 
3. **Action**: Build conditional rendering inside the TSX file intercepting between "processing" and "seed-phrase". Render an explainer text, inject the visual QR payload, and deploy an exact 6-character, numeric-restricted controlled HTML form enforcing immediate input handovers to the step-2 registration procedure. Include validation boundary messages. Update CSS descriptors for layout.

### Step 4.4: User Interface Login View
1. **Target**: Frontend `pages/login/` hook and component files.
2. **Action**: Migrate to conditional dual-pane rendering. Ensure Step 1 clears cleanly. Implement the step-2 interface showing a centered identical numeric-locked input field. Provide explicit internal UI buttons routing the user backwards to restart step 1 gracefully if token expiry occurs or credentials were misrepresented.

### Step 4.5: User Interface Unlock View
1. **Target**: Frontend `pages/unlock/` hook and component files.
2. **Action**: Deprecate any legacy mutation pointing towards server payloads. Intercept local validation requests mapped to the new offline `unlockSession` method. Upon rejection, immediately reset indexed stores and orchestrate a forceful hard redirect pushing the user back into the `/login` workflow.

---

## Phase 5: Verification and Functional Sandbox 
*(Checklist specifically engineered for QA execution)*
1. Query database directly post-migration to confirm `totp_secret` represents properly on empty user tables.
2. Create standard baseline user to extract QR text sequence. Manually parse via base32 CLI to ensure validation outputs match expected TOTP signatures.
3. Authenticate fully, disconnect from server network layer, refresh, and test the offline `unlockSession` protocol explicitly verifying zero 200 HTTP calls are generated.
4. Forcefully append `purpose: totp-login` onto an active user Session JWT payload and attempt an arbitrary `/vault/` retrieval to confirm the backend JWT Strategy explicitly rejects it with a core HTTP-401.
5. Initiate account recovery phase to simulate lost device; finalize and recount database row variables to guarantee `totp_secret` properly reverts back to null.
6. Hammer the `auth/login/totp` endpoint utilizing arbitrary wrong codes sequentially 6 times ensuring identical IP lockouts respond accurately.