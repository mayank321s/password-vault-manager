
# Detailed Implementation Plan: Microsoft SSO Integration

This document provides a granular, step-by-step guide for integrating Microsoft Single Sign-On (SSO) into the existing application. It is designed to be executed by an AI agent.

**Feature Flags:**
- **Backend:** `FEATURE_MICROSOFT_SSO_ENABLED`
- **Frontend:** `VITE_FEATURE_MICROSOFT_SSO_ENABLED`

---

## **Phase 1: Backend Implementation (NestJS)**

### **Step 1.1: Install Dependencies**
- In the `apps/backend` directory, run the command to add the `passport-azure-ad` package.

### **Step 1.2: Configure Environment Variables**
1.  **Update `app.config.ts`**:
    -   Navigate to `apps/backend/src/config/app.config.ts`.
    -   Add `FEATURE_MICROSOFT_SSO_ENABLED` as an optional string to the Zod schema for environment variables.
2.  **Create `microsoft.config.ts`**:
    -   Create a new file at `apps/backend/src/config/microsoft.config.ts`.
    -   Define and export a Zod schema and a registered configuration for Microsoft Entra (Azure AD) credentials: `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, and `MICROSOFT_TENANT_ID`.
3.  **Update `index.ts`**:
    -   Navigate to `apps/backend/src/config/index.ts`.
    -   Import and export the new `microsoftConfiguration`.

### **Step 1.3: Update Database**
1.  **Modify User Model**:
    -   Navigate to `apps/backend/src/database/models/user.model.ts`.
    -   Add the following optional fields to the `User` model to store SSO-specific identifiers: `ssoProvider` (string), `ssoSubjectId` (string), and `ssoTenantId` (string).
2.  **Generate Database Migration**:
    -   Create a new Sequelize migration file in the `apps/backend/src/database/migrations/` directory.
    -   The `up` method should add the `sso_provider`, `sso_subject_id`, and `sso_tenant_id` columns to the `users` table.
    -   The `down` method should remove these three columns.

### **Step 1.4: Implement SSO Authentication Strategy**
1.  **Create Microsoft Passport Strategy**:
    -   Create a new file at `apps/backend/src/api/v1/auth/strategies/microsoft.strategy.ts`.
    -   Implement a Passport strategy using `OIDCStrategy` from `passport-azure-ad`.
    -   Configure it with the credentials from `microsoftConfiguration`.
    -   The `validate` function will receive the user's profile from Microsoft. It should find or create a user based on the `oid` (subject ID) and `tid` (tenant ID).
    -   Ensure the strategy is injectable and extends `PassportStrategy`.

### **Step 1.5: Create SSO Controller and Service**
1.  **Create `auth-sso.service.ts`**:
    -   Create a new file at `apps/backend/src/api/v1/auth/auth-sso.service.ts`.
    -   This service will contain the logic to process SSO logins, find existing users, or provision new ones.
2.  **Create `auth-sso.controller.ts`**:
    -   Create a new file at `apps/backend/src/api/v1/auth/auth-sso.controller.ts`.
    -   Define two routes:
        -   `GET /api/v1/auth/sso/microsoft`: This route will be protected by the `AuthGuard('azuread')` and will initiate the SSO flow.
        -   `GET /api/v1/auth/sso/microsoft/callback`: This route will also use the `AuthGuard('azuread')`. It will handle the redirect from Microsoft, call the `auth-sso.service` to log the user in, and then redirect the user to the frontend's unlock page.

### **Step 1.6: Update Auth Module**
-   Navigate to `apps/backend/src/api/v1/auth/auth.module.ts`.
-   Import and declare `AuthSsoController`, `AuthSsoService`, and `MicrosoftStrategy` in the module's providers and controllers.

### **Step 1.7: Gate Legacy Auth Routes**
-   Navigate to `apps/backend/src/api/v1/auth/auth.controller.ts`.
-   For each password-based endpoint (`/login`, `/register`, etc.), add a check. If `FEATURE_MICROSOFT_SSO_ENABLED` is true, the endpoint should immediately throw a `ForbiddenException`.

---

## **Phase 2: Frontend Implementation (React)**

### **Step 2.1: Configure Environment Variables**
1.  **Update `vite-env.d.ts`**:
    -   Navigate to `apps/frontend/src/vite-env.d.ts`.
    -   Add `VITE_FEATURE_MICROSOFT_SSO_ENABLED` to the `ImportMetaEnv` interface.
2.  **Update `config/index.ts`**:
    -   Navigate to `apps/frontend/src/config/index.ts`.
    -   Add a variable `isMicrosoftSsoEnabled` that reads the `VITE_FEATURE_MICROSOFT_SSO_ENABLED` environment variable.
    -   Add a variable `microsoftSsoUrl` pointing to `/api/v1/auth/sso/microsoft`.

### **Step 2.2: Update UI based on Feature Flag**
1.  **Modify `login.tsx`**:
    -   Navigate to `apps/frontend/src/pages/login/login.tsx`.
    -   If `isMicrosoftSsoEnabled` is true, hide the email/password form and instead display a single "Sign in with Microsoft" button. This button should be a link (`<a>` tag) pointing to `microsoftSsoUrl`.
2.  **Modify `register.tsx`**:
    -   Navigate to `apps/frontend/src/pages/register/register.tsx`.
    -   If `isMicrosoftSsoEnabled` is true, hide the entire registration form. You can show a message directing users to the login page.

### **Step 2.3: Create New User Setup Flow**
1.  **Create `sso-setup` Page**:
    -   Create a new page component directory at `apps/frontend/src/pages/sso-setup/`.
    -   This page will be for first-time SSO users. It will contain a form for the user to create and confirm their master password.
    -   The logic will reuse existing functions from `auth.service.ts` to generate the user's cryptographic keys and save them.
2.  **Add Route in `App.tsx`**:
    -   Navigate to `apps/frontend/src/App.tsx`.
    -   Add a new route for `/sso-setup` that renders the `SsoSetup` page.

### **Step 2.4: Update Existing Unlock Flow**
-   Navigate to `apps/frontend/src/pages/unlock/unlock.tsx`.
-   The logic needs to be adjusted to handle users redirected from the SSO callback. It should prompt for the master password to decrypt the vault, as it does for password-based users.

### **Step 2.5: Update API Routes**
-   Navigate to `apps/frontend/src/common/constants/api-routes.ts`.
-   Add the new SSO-related API endpoints to the constants file.

---

## **Phase 3: Verification**

### **Step 3.1: Backend Testing**
-   Write unit tests for the `MicrosoftStrategy` to ensure it correctly processes user profiles.
-   Write E2E tests for the SSO controller to verify the redirect flow and the gating of legacy endpoints when the feature flag is active.

### **Step 3.2: Frontend Testing**
-   Write component tests for the `Login` and `Register` pages to assert that the UI changes correctly based on the feature flag.
-   Write tests for the new `SsoSetup` page to ensure the master password creation flow works as expected.

### **Step 3.3: Manual End-to-End Testing**
-   Perform a full manual test of the login flow for both new and existing SSO users.
-   Verify that password-based login and registration are inaccessible when the feature flag is enabled.
-   Use browser developer tools to confirm that no sensitive tokens are stored in local storage or exposed in URL parameters.
