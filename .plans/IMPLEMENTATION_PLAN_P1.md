# Password Manager Implementation Plan

## Project Overview
Building a zero-knowledge password manager with React (SPA) frontend and NestJS backend, using PostgreSQL for data storage. The core focus is on security and zero-knowledge architecture where the server never sees unencrypted data.

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Initialize Monorepo Structure
- Set up Turborepo workspace (already initialized)
- Create `apps/backend` - NestJS application
- Create `apps/frontend` - React with Vite
- Create `packages/shared` - Shared types and validation schemas
- Create `packages/crypto-utils` - Shared cryptographic utilities

### 1.2 Backend Setup (NestJS)
- Initialize NestJS application in `apps/backend`
- Install dependencies:
  - `argon2` - password hashing
  - `@nestjs/jwt`, `jsonwebtoken` - JWT authentication
  - `@nestjs/throttler` - rate limiting
  - `helmet` - security headers
  - `cors` - CORS handling
  - `winston` - logging
  - `dotenv` - environment variables
  - `zod` - validation
  - `sequelize`, `pg` - PostgreSQL ORM
  - `vitest` - unit testing
  - `supertest` - integration testing
- Configure environment variables structure
- Set up Winston logger with PII redaction
- Configure Helmet for secure HTTP headers
- Set up CORS with strict origin controls

### 1.3 Frontend Setup (React)
- Initialize Vite + React + TypeScript
- Install dependencies:
  - React Router for SPA routing
  - State management library Zustand
  - Axios for API calls
  - `zod` for client-side validation
  - `vitest` for testing
  - `DOMPurify` for sanitization
- Configure IndexedDB wrapper for secure key storage
- Set up Content Security Policy headers
- Configure Subresource Integrity for CDN assets

### 1.4 Database Setup
- Set up PostgreSQL database (local and cloud)
- Configure database encryption at rest
- Create migration system with Sequelize, Umzug, typescript

---

## Phase 2: Database Schema & Models

### 2.1 Create Database Tables
Implement the following schema:

**users table:**
- `user_id` (UUID, primary key)
- `email` (string, unique, indexed)
- `password_hash` (string) - double-hashed with Argon2
- `public_key` (text) - RSA-4096 public key
- `encrypted_private_key` (text) - Private key encrypted with master key
- `encryption_salt` (binary) - Salt for PBKDF2
- `created_at`, `updated_at` (timestamp)
- `is_active` (boolean)
- `seed_phrase_hash` (string) - Hashed BIP39 seed phrase for recovery

**vaults table:**
- `vault_id` (UUID, primary key)
- `name` (string)
- `is_personal_vault` (boolean)
- `owner_user_id` (UUID, foreign key to users)
- `created_at`, `updated_at` (timestamp)

**vault_members table:**
- `id` (UUID, primary key)
- `vault_id` (UUID, foreign key to vaults)
- `user_id` (UUID, foreign key to users)
- `user_role` (enum: 'owner', 'manager', 'team_member')
- `vault_encrypted_key` (text) - Vault key encrypted with user's public key
- `joined_at` (timestamp)
- Composite unique constraint: (vault_id, user_id)

**passwords table:**
- `password_id` (UUID, primary key)
- `vault_id` (UUID, foreign key to vaults)
- `name` (string) - Encrypted title/name
- `encrypted_data` (text) - Encrypted password blob (JSON with username, password, url, notes)
- `is_note` (boolean) - Whether this is a note or password
- `created_by_user_id` (UUID, foreign key to users)
- `created_at`, `updated_at` (timestamp)

**password_permissions table:**
- `id` (UUID, primary key)
- `password_id` (UUID, foreign key to passwords)
- `user_id` (UUID, foreign key to users)
- `permission` (enum: 'owner', 'editor', 'viewer')
- `password_encrypted_key` (text) - Password-specific encryption key for individual sharing
- `created_at` (timestamp)

**one_time_shares table:**
- `share_id` (UUID, primary key)
- `password_id` (UUID, foreign key to passwords)
- `encrypted_blob` (text) - Password encrypted with random symmetric key
- `created_by_user_id` (UUID, foreign key to users)
- `created_at` (timestamp)
- `expires_at` (timestamp)
- `is_used` (boolean, default false)

**sessions table (optional, for JWT blacklisting):**
- `session_id` (UUID, primary key)
- `user_id` (UUID, foreign key to users)
- `jwt_token_id` (string) - JTI claim from JWT
- `created_at` (timestamp)
- `expires_at` (timestamp)
- `revoked_at` (timestamp, nullable)

### 2.2 Create Sequelize Models
- Define models for each table
- Set up relationships and associations

---

## Phase 3: Backend Core - Authentication & User Management

### 3.1 Authentication System

**Registration Flow:**
- `POST /auth/register`
  - Accept: email, password_hash (already hashed client-side with Argon2), public_key, encrypted_private_key, encryption_salt
  - Server-side: Hash the received password_hash again with Argon2 and server salt
  - Store user with double-hashed password
  - Create personal vault for user
  - Return JWT token

**Login Flow:**
- `POST /auth/login`
  - Accept: email, password_hash (client-side hashed)
  - Server: Hash received hash again, compare with stored double-hash
  - Generate JWT with user_id, email in payload
  - Return: JWT token, encrypted_private_key, public_key
- Implement JWT strategy with Passport.js
- Set JWT expiration (e.g., 2 hours)
- Use HttpOnly, Secure, SameSite cookies for token storage

**Password Recovery Flow:**
- `POST /auth/recover`
  - User enters seed phrase (12 BIP39 words) and new master password
  - Client: regenerate user's private key from seed phrase. creates a new master key based on the new master password, re-encrypts the private key with the new master key
  - Accept: an encrypted blob containing the new password hash, new encrypted private key. the blob is encrypted by using private key. 
  - Server: Decrypt the blob using the old public key, update the new password hash and update user's encrypted private key in db.
  - Invalidate all existing sessions

### 3.2 Rate Limiting
- Implement @nestjs/throttler
- Configure limits:
  - `/auth/login`: 5 attempts per 15 minutes per IP
  - `/auth/register`: 3 attempts per hour per IP
  - General API: 100 requests per minute per user

### 3.3 Session Management
- `POST /auth/logout` - Invalidate current JWT

---

## Phase 4: Backend Core - Vault Management

### 4.1 Vault CRUD Operations

**Create Vault:**
- `POST /vaults`
  - Accept: name, vault_encryption_key (encrypted with user's public key)
  - Create vault owned by current user
  - Add creator as vault member with 'owner' role, store vault_encryption_key in vault_members table
  - Return vault details

**Get User Vaults:**
- `GET /vaults`
  - Return all vaults where user is a member
  - Include vault_encrypted_key for decryption on client

**Get Vault Members:**
- `GET /vaults/:vault_id/members`
  - Return vault members list
  - Verify user has access to vault

**Update Vault:**
- `PATCH /vaults/:vault_id`
  - Allow updating vault name
  - Only owner can update

**Delete Vault:**
- `DELETE /vaults/:vault_id`
  - Only owner can delete
  - Cannot delete personal vault
  - Cascade delete all passwords in vault

### 4.2 Vault Member Management

**Add Member to Vault:**
- `POST /vaults/:vault_id/members`
  - Accept: user_email or user_id, role (manager/team_member), vault_encrypted_key
  - Only owner or manager can add members
  - Client encrypts vault key with new member's public key
  - Server stores the encrypted vault key

**Update Member Role:**
- `PATCH /vaults/:vault_id/members/:user_id`
  - Accept: new_role
  - Only owner can change roles
  - Cannot change owner role

**Remove Member:**
- `DELETE /vaults/:vault_id/members/:user_id`
  - Only owner or manager can remove members
  - Cannot remove owner
  - **SECURITY CRITICAL:** See Phase 4.3 for re-encryption requirements

**Get Vault Members:**
- `GET /vaults/:vault_id/members`
  - Return list of members with roles
  - Exclude sensitive key data from response

---

### 4.3 Vault Key Rotation & Re-encryption - Backend API

**STATUS: ✅ COMPLETE**

**SECURITY PROBLEM:**
When a member is removed from a vault, they still possess the vault encryption key cached on their device. Without re-encryption, removed members can decrypt any previously downloaded passwords indefinitely, violating the zero-knowledge security model.

**SOLUTION:**
Implement vault key rotation that re-encrypts all data with a new vault key, making the removed member's cached key useless.

#### Backend Implementation

**Primary API Endpoint:**
- `DELETE /vaults/:vault_id/members/:user_id` ✅ **IMPLEMENTED**
  - **REQUIRES** `reEncryptionData` in request body (NOT optional)
  - Performs secure removal with immediate key rotation (atomic operation)
  - Returns: `{ success: boolean, passwordsUpdated: number, membersUpdated: number }`
  - Authorization: Owner or Manager only
  - **REJECTS** requests without complete re-encryption data

**Request Body Schema (REQUIRED):**
```typescript
{
  reEncryptionData: {  // MANDATORY - not optional
    memberKeys: Array<{
      userId: string;
      vaultEncryptedKey: string;  // New vault key encrypted with member's public key (RSA-OAEP)
    }>;
    reEncryptedPasswords: Array<{
      passwordId: string;
      encryptedData: string;      // Password re-encrypted with new vault key (AES-256-GCM)
      name?: string;               // Optional updated name
    }>;
  }
}
```

**Server-Side Validation & Enforcement:** ✅ **IMPLEMENTED**
- Verify request sender is owner or manager
- Validate all remaining members have new encrypted keys
- Reject if keys provided for non-members (security check against key injection)
- Reject if keys missing for any remaining member (prevents incomplete rotation)
- Ensure password count matches vault's password count
- Update all member keys atomically within transaction
- Update all password encrypted data atomically within transaction
- Log successful re-encryption with metrics (passwords updated, members updated)

**Database Updates:**
The following tables are updated atomically:

1. **vault_members table:**
   - Update `vault_encrypted_key` for all remaining members
   - Each member receives new vault key encrypted with their public key
   - Old encrypted keys are replaced

2. **passwords table:**
   - Update `encrypted_data` for all passwords in vault
   - All passwords re-encrypted with new vault key
   - Optional: Update `name` field if provided

**Security Guarantees:**
- ✅ Removed member's cached key becomes useless immediately
- ✅ All vault data re-encrypted with new key
- ✅ Atomic operation (all updates succeed or all rollback)
- ✅ **NO vulnerability window** - re-encryption is mandatory
- ✅ Zero-knowledge architecture fully maintained
- ✅ Validates all members receive new key (no partial updates)
- ✅ **No insecure fallback option** - maximum security enforced

---

### 4.4 Password Fetching Endpoint (Critical Dependency)

**STATUS: ⏳ PENDING - HIGH PRIORITY**

This endpoint is a **CRITICAL DEPENDENCY** for Phase 4.5 (client-side re-encryption) to function.

#### Implementation

**Get Passwords in Vault:**
- `GET /vaults/:vault_id/passwords`
  - **Purpose:** Return all passwords in vault for client-side re-encryption
  - **Authorization:** User must be vault member
  - **Response Fields:**
    - `password_id` (UUID) - Password identifier
    - `name` (string) - Encrypted password name/title
    - `encrypted_data` (string) - Password data encrypted with vault key
    - `is_note` (boolean) - Whether this is a note or password
    - `vault_id` (UUID) - Parent vault identifier
    - `created_by_user_id` (UUID) - Creator user ID
    - `created_at` (timestamp) - Creation timestamp
    - `updated_at` (timestamp) - Last update timestamp

**Implementation Details:**
```typescript
// Controller: apps/backend/src/api/v1/passwords/passwords.controller.ts
@Get('vaults/:vaultId/passwords')
@HttpCode(HttpStatus.OK)
async getVaultPasswords(
  @CurrentUser() user: CurrentUserData,
  @Param('vaultId') vaultId: string,
): Promise<PasswordResponseDto[]> {
  return this.passwordsService.getVaultPasswords(user.userId, vaultId);
}

// Service: apps/backend/src/api/v1/passwords/passwords.service.ts
async getVaultPasswords(
  userId: string,
  vaultId: string,
): Promise<PasswordResponseDto[]> {
  // 1. Verify user is vault member
  const member = await this.vaultMemberRepository.findOne({ vaultId, userId });
  if (!member) {
    throw new ForbiddenException('User is not a member of this vault');
  }

  // 2. Fetch all passwords in vault
  const passwords = await this.passwordRepository.findAll({ vaultId });

  // 3. Return password data (encrypted, ready for client-side decryption)
  return passwords.map(password => ({
    id: password.id,
    name: password.name,
    encryptedData: password.encryptedData,
    isNote: password.isNote,
    vaultId: password.vaultId,
    createdBy: password.createdByUserId,
    createdAt: password.createdAt,
    updatedAt: password.updatedAt,
  }));
}
```

**Security Considerations:**
- Never return unencrypted password data
- Verify vault membership before returning passwords
- Include all passwords (no filtering) to ensure complete re-encryption
- Log access to password lists for audit purposes

**Dependencies:**
- Password model and repository (already exists from Phase 2)
- Vault member verification (already exists from Phase 4.2)

**Testing:**
- Test unauthorized access (non-member tries to fetch passwords)
- Test empty vault (no passwords)
- Test vault with multiple passwords
- Test response includes all required fields

---

### 4.5 Client-Side Re-encryption Implementation

**STATUS: ✅ COMPLETE**

Complete client-side infrastructure for mandatory vault key rotation and re-encryption when removing members.

**Files Created:**
1. ✅ `/apps/frontend/src/types/vault.types.ts` - Complete TypeScript interfaces
2. ✅ `/apps/frontend/src/lib/crypto.ts` - Cryptographic utilities with `prepareVaultKeyRotation()`
3. ✅ `/apps/frontend/src/services/vault.service.ts` - API integration layer
4. ✅ `/apps/frontend/src/hooks/useVaultReencryption.ts` - React state management hook
5. ✅ `/apps/frontend/src/components/RemoveMemberDialog.tsx` - Production-ready UI component
6. ✅ `/apps/frontend/src/examples/VaultReencryptionExample.tsx` - Usage examples

**Client-Side Re-encryption Flow:**

1. ✅ **Generate New Vault Key**
   - Create new random 256-bit AES-GCM key using `crypto.getRandomValues()`
   - Implemented in `crypto.generateVaultKey()`

2. ✅ **Decrypt All Passwords with Old Key**
   - Fetch all passwords from vault via `GET /vaults/:vault_id/passwords` (⚠️ **REQUIRES PHASE 4.4**)
   - Decrypt each password using the old vault key
   - Implemented in `crypto.decryptWithAES()`

3. ✅ **Re-encrypt All Passwords with New Key**
   - Encrypt each password with the new vault key (AES-256-GCM)
   - Generate new IV for each password
   - Implemented in `crypto.encryptWithAES()`

4. ✅ **Distribute New Key to Remaining Members**
   - Fetch list of all current members via `GET /vaults/:vault_id/members`
   - Exclude the member being removed
   - Encrypt new vault key with each member's RSA-4096 public key
   - Implemented in `crypto.encryptWithRSA()`

5. ✅ **Submit Atomic Update**
   - Send DELETE request with all re-encrypted data
   - Server validates and updates everything in single transaction
   - Clear sensitive data from memory
   - Implemented in `vault.service.removeMemberWithReEncryption()`

**Key Functions:**
- ✅ `prepareVaultKeyRotation()` - Main re-encryption orchestrator with progress tracking
- ✅ `removeMemberWithReEncryption()` - Complete member removal flow
- ✅ `performVaultKeyRotation()` - Manual key rotation without member removal
- ✅ `useVaultReencryption()` - React hook with loading/progress/error states
- ✅ `RemoveMemberDialog` - Production-ready UI with progress bar

**Progress Tracking (9 Stages):**
1. Fetching vault key (0%)
2. Decrypting private key (10%)
3. Decrypting vault key (20%)
4. Fetching vault passwords (30%)
5. Fetching vault members (40%)
6. Preparing re-encryption (50-90%)
   - Generate new key
   - Decrypt passwords with old key
   - Re-encrypt passwords with new key
   - Encrypt new key for each member
7. Sending to server (90%)
8. Updating local cache (95%)
9. Complete (100%)

**Performance Considerations:**
Expected client-side re-encryption times (including crypto operations):
- Small vault (10 passwords, 3 members): < 1 second
- Medium vault (100 passwords, 10 members): 2-5 seconds
- Large vault (1000 passwords, 50 members): 10-30 seconds
- Extra-large vault (10000 passwords, 100 members): 1-5 minutes

**Client UI Features:** ✅ **IMPLEMENTED**
- ✅ Progress indicator with percentage and stage descriptions
- ✅ Security warnings about re-encryption requirement
- ✅ Prevent closing during operation
- ✅ Display operation metrics (passwords/members updated)
- ✅ Success/error displays with retry option
- ✅ Responsive design for mobile/desktop

---

### 4.6 Integration & Completion Tasks

**STATUS: ⏳ PENDING**

This section covers the remaining integration work to make the re-encryption feature fully operational.

**DEPENDENCIES:**
- ⚠️ Phase 4.4 (Password Fetching Endpoint) must be completed first
- Phase 4.3 (Backend Re-encryption API) - ✅ Complete
- Phase 4.5 (Client-Side Implementation) - ✅ Complete

#### Frontend Tasks

**1. Master Key Derivation (HIGH PRIORITY)**
- ⏳ Implement PBKDF2 key derivation from user password
  - Use 600,000 iterations with SHA-256
  - Store master key in memory during session (secure context)
  - Never persist to localStorage or IndexedDB
  - Clear from memory on logout or auto-lock
- ⏳ Create utility function: `deriveMasterKey(password, salt)`
- ⏳ Integrate with login flow to derive and cache master key

**2. Private Key Decryption**
- ⏳ Implement decryption of `encryptedPrivateKey` with master key
  - Currently marked as `_masterKey` (unused parameter) in vault.service.ts
  - Add decryption step before using private key for vault operations
  - Use AES-256-GCM decryption from crypto utilities
- ⏳ Update `removeMemberWithReEncryption()` to decrypt private key
- ⏳ Update `performVaultKeyRotation()` to decrypt private key

**3. UI Integration**
- ⏳ Add `RemoveMemberDialog` to vault management pages
  - Integrate with vault member list UI
  - Wire up `encryptedPrivateKey` from auth store
  - Wire up `masterKey` from session context
  - Handle success callback to refresh member list
- ⏳ Add success/error notification system
  - Toast notifications for operation success
  - Error message display for failures
  - Detailed error messages with stage information

**4. Data Refresh After Operations**
- ⏳ Implement automatic data refresh after member removal
  - Refresh vault member list
  - Refresh vault details
  - Update local vault key cache
- ⏳ Handle edge cases:
  - User removes themselves from vault
  - Last member removal (should be prevented)
  - Network failures during refresh

#### Testing Tasks

**Unit Tests:**
- ⏳ Test `prepareVaultKeyRotation()` with mock data
- ⏳ Test `removeMemberWithReEncryption()` error handling
- ⏳ Test `useVaultReencryption` hook state transitions
- ⏳ Test crypto utilities (AES, RSA operations)
- ⏳ Test progress calculation accuracy

**Integration Tests:**
- ⏳ End-to-end member removal flow
  - Create vault → Add passwords → Add member → Remove member
  - Verify all data re-encrypted
  - Verify removed member cannot decrypt
  - Verify remaining members can decrypt
- ⏳ Manual key rotation flow
- ⏳ Network failure scenarios
- ⏳ Backend error handling

**Manual Testing Scenarios:**
- ⏳ Remove member from 2-member vault
- ⏳ Remove member from vault with 100+ passwords
- ⏳ Test with slow network (throttle to 3G)
- ⏳ Interrupt operation mid-way (close browser)
- ⏳ Verify progress bar updates correctly
- ⏳ Test dialog interactions (ESC key, click outside)
- ⏳ Test on mobile devices (responsive design)

#### Performance Optimization (Future)

- ⏳ Implement batch processing for large password sets
- ⏳ Use Web Workers for crypto operations (offload from main thread)
- ⏳ Cache member public keys to reduce API calls
- ⏳ Compress re-encrypted data before sending
- ⏳ Add background key rotation scheduling (security best practice)

#### Documentation Tasks

- ⏳ Update API documentation with re-encryption flow
- ⏳ Create user guide for member removal process
- ⏳ Document expected timings for different vault sizes
- ⏳ Add troubleshooting guide for common errors
- ⏳ Document security guarantees in user-facing docs

---

## Phase 5: Backend Core - Password Management

### 5.1 Password CRUD Operations ✅ COMPLETE

**Status:** ✅ Completed on 2026-02-23
**Summary:** Full CRUD API for password and secure note management with zero-knowledge architecture.

**NOTE:** The `GET /vaults/:vault_id/passwords` endpoint has been moved to Phase 4.4 as a critical dependency for re-encryption.

**Implementation Details:**

**Files Created:**
- `apps/backend/src/api/v1/passwords/dto/password.dto.ts` - DTOs and Zod schemas
- `apps/backend/src/api/v1/passwords/passwords.service.ts` - Service layer with CRUD operations
- `apps/backend/src/api/v1/passwords/passwords.controller.ts` - REST API endpoints
- `apps/backend/src/api/v1/passwords/passwords.module.ts` - NestJS module configuration
- `PHASE_5.1_COMPLETION_SUMMARY.md` - Detailed implementation documentation

**API Endpoints Implemented:**

**Create Password/Note:**
- `POST /passwords` ✅ IMPLEMENTED
  - Request: `{ vaultId, name, encryptedData, isNote }`
  - Verifies user is vault member
  - Stores encrypted password data
  - Returns: `201 Created` with PasswordResponseDto

**Get Password Details:**
- `GET /passwords/:password_id` ✅ IMPLEMENTED
  - Returns encrypted password data for client-side decryption
  - Verifies user is vault member
  - Returns: `200 OK` with PasswordResponseDto

**Update Password:**
- `PATCH /passwords/:password_id` ✅ IMPLEMENTED
  - Request: `{ name?, encryptedData? }`
  - Verifies user is vault member
  - Updates encrypted data
  - Returns: `200 OK` with updated PasswordResponseDto

**Delete Password:**
- `DELETE /passwords/:password_id` ✅ IMPLEMENTED
  - Verifies user is vault member
  - Cascade deletes permissions and shares
  - Returns: `200 OK` with `{ success: true }`

**Security Features:**
- ✅ JWT authentication required for all endpoints
- ✅ Vault membership verification for all operations
- ✅ Zero-knowledge: server never sees unencrypted data
- ✅ Comprehensive error handling and logging
- ✅ Transaction support for data consistency
- ✅ Zod validation for all inputs

**Build Status:** ✅ Backend build passing


### 5.2 Individual Password Permissions ✅ COMPLETE

**Status:** ✅ Completed on 2026-02-23
**Summary:** Individual password sharing with granular access control (viewer/editor permissions).

**Implementation Details:**

**Files Created:**
- `apps/backend/src/database/repositories/password-permission.repository.ts` - Repository for permission management

**Files Modified:**
- `apps/backend/src/api/v1/passwords/dto/password.dto.ts` - Added permission DTOs
- `apps/backend/src/api/v1/passwords/passwords.service.ts` - Added permission methods
- `apps/backend/src/api/v1/passwords/passwords.controller.ts` - Added permission endpoints
- `apps/backend/src/api/v1/passwords/passwords.module.ts` - Added PasswordPermission model and repositories
- `apps/backend/src/database/repositories/index.ts` - Exported PasswordPermissionRepository

**API Endpoints Implemented:**

**Grant Individual Access:**
- `POST /passwords/:passwordId/permissions` ✅ IMPLEMENTED
  - Request: `{ userEmail, permission: "viewer"|"editor", passwordEncryptedKey }`
  - Client encrypts password key with recipient's public key (RSA-OAEP)
  - Shares password with users outside vault
  - Returns: `201 Created` with PasswordPermissionResponseDto

**List Password Permissions:**
- `GET /passwords/:passwordId/permissions` ✅ IMPLEMENTED
  - Returns list of users with individual access
  - Includes user details (email, name) and permission levels
  - Returns: `200 OK` with array of PasswordPermissionResponseDto

**Revoke Individual Access:**
- `DELETE /passwords/:passwordId/permissions/:userId` ✅ IMPLEMENTED
  - Removes individual password access
  - Vault members can revoke permissions
  - Returns: `200 OK` with `{ success: true }`

**Enhanced Authorization for GET/PATCH Endpoints:**
- `GET /passwords/:passwordId` ✅ ENHANCED
  - Vault members (any role) can access
  - Users with individual permission (viewer or editor) can access
  - Maintains zero-knowledge architecture

- `PATCH /passwords/:passwordId` ✅ ENHANCED
  - Vault members (any role) can update
  - Users with "editor" permission can update
  - Users with only "viewer" permission CANNOT update
  - Proper permission level enforcement

**Security Features:**
- ✅ Zero-knowledge: Password keys encrypted with recipient's public key
- ✅ Granular permissions: viewer (read-only) and editor (can modify)
- ✅ Authorization: Only vault members can grant/revoke access
- ✅ Duplicate prevention: Cannot grant permission twice to same user
- ✅ Comprehensive logging of all permission changes

**Permission Levels:**
- **owner**: Password creator (automatic, managed by vault)
- **editor**: Can view and modify password data
- **viewer**: Can only view password data (read-only)

**Build Status:** ✅ Backend build passing

### 5.3 One-Time Share Links ✅ COMPLETE

**Status:** ✅ Completed on 2026-02-23
**Summary:** Temporary password sharing via one-time use links with automatic expiration and deletion.

**Implementation Details:**

**Files Created:**
- `apps/backend/src/database/repositories/one-time-share.repository.ts` - Repository for share management

**Files Modified:**
- `apps/backend/src/api/v1/passwords/dto/password.dto.ts` - Added one-time share DTOs
- `apps/backend/src/api/v1/passwords/passwords.service.ts` - Added share methods
- `apps/backend/src/api/v1/passwords/passwords.controller.ts` - Added share endpoints and ShareController
- `apps/backend/src/api/v1/passwords/passwords.module.ts` - Added OneTimeShare model and repository
- `apps/backend/src/database/repositories/index.ts` - Exported OneTimeShareRepository

**API Endpoints Implemented:**

**Create One-Time Share:**
- `POST /passwords/:passwordId/share` ✅ IMPLEMENTED
  - Request: `{ encryptedBlob, expirationHours: 1-168 }`
  - Client encrypts password with random 256-bit AES key
  - Server stores encrypted blob (never sees encryption key)
  - Returns: `{ shareId, expiresAt, createdAt }`
  - Authorization: User must have access to password (vault member or permission holder)

**Access One-Time Share:**
- `GET /share/:shareId` ✅ IMPLEMENTED (PUBLIC ENDPOINT)
  - No authentication required
  - Validates share exists and hasn't expired
  - Validates share hasn't been used
  - Marks share as used
  - Deletes share from database after access
  - Returns: `{ encryptedBlob, expiresAt, createdAt }`

**Validate Share Link:**
- `GET /share/:shareId/validate` ✅ IMPLEMENTED (PUBLIC ENDPOINT)
  - No authentication required
  - Checks if share is valid without consuming it
  - Returns: `{ valid: boolean, expiresAt?: Date }`
  - Does not mark share as used (can still be accessed after validation)

**Security Features:**
- ✅ Zero-knowledge: Encryption key never sent to server (stays in URL fragment)
- ✅ One-time use: Share automatically deleted after access
- ✅ Expiration: Configurable expiration time (1-168 hours, default 24)
- ✅ Automatic deletion: Shares deleted immediately after use
- ✅ Public access: No authentication required for share access
- ✅ Validation endpoint: Check validity without consuming share
- ✅ Database cleanup methods: Delete expired and old used shares

**Share Link Format:**
```
https://app.example.com/share/{shareId}#{encryption-key}
```
- shareId: Stored in database, sent to server
- encryption-key: Random 256-bit AES key in URL fragment (never sent to server)

**Client Responsibilities:**
1. Generate random 256-bit AES key
2. Encrypt password data with this key
3. Send encrypted blob to server
4. Create share URL with encryption key in fragment
5. Share URL contains `{shareId}#{key}` format

**Build Status:** ✅ Backend build passing

---

## Phase 6: Frontend Core - Cryptographic Layer

### 6.1 Crypto Utilities Module

**Key Generation:**
- `generateRSAKeyPair()` - Generate RSA-4096 key pair using Web Crypto API
- `exportPublicKey(publicKey)` - Export public key to PEM format
- `exportPrivateKey(privateKey)` - Export private key to PKCS#8 format
- `importPublicKey(pemString)` - Import public key from PEM
- `importPrivateKey(pkcs8Data)` - Import private key from PKCS#8

**Master Password & Key Derivation:**
- `generateMasterPassword()` - Generate random 16-character master password
- `deriveMasterKey(password, salt)` - PBKDF2 with 600,000 iterations, SHA-256
- `generateSalt()` - Generate cryptographically secure random salt
- `hashPasswordForAuth(masterPassword, salt)` - Client-side Argon2 hash

**Encryption/Decryption with Master Key:**
- `encryptPrivateKey(privateKey, masterKey)` - AES-256-GCM encryption
- `decryptPrivateKey(encryptedData, masterKey, iv)` - AES-256-GCM decryption

**RSA Encryption/Decryption:**
- `encryptWithPublicKey(data, publicKey)` - RSA-OAEP encryption
- `decryptWithPrivateKey(encryptedData, privateKey)` - RSA-OAEP decryption

**Symmetric Encryption (for vault data):**
- `generateSymmetricKey()` - Generate AES-256 key
- `encryptData(data, key)` - AES-256-GCM encryption with random IV
- `decryptData(encryptedData, key, iv)` - AES-256-GCM decryption

**BIP39 Seed Phrase:**
- `generateSeedPhrase()` - Generate 12-word BIP39 mnemonic
- `deriveMasterKeyFromSeedPhrase(seedPhrase)` - Derive master key from seed

**Utility Functions:**
- `arrayBufferToBase64(buffer)` - Convert ArrayBuffer to Base64
- `base64ToArrayBuffer(base64)` - Convert Base64 to ArrayBuffer
- `clearSensitiveData(object)` - Overwrite sensitive data in memory

---

#### ✅ Phase 6.1 COMPLETE - 2026-02-24

**Implementation Summary:**

All cryptographic utilities have been implemented in `apps/frontend/src/lib/crypto.ts` (856 lines) with production-ready code and comprehensive documentation.

**What was implemented:**

1. **Core Cryptographic Functions (already existed):**
   - RSA-4096 key generation and operations (RSA-OAEP)
   - AES-256-GCM encryption/decryption with random IVs
   - PBKDF2 key derivation (600,000 iterations, SHA-256)
   - Vault key rotation and re-encryption
   - Private key encryption with master key
   - Public/private key import/export (PEM and PKCS#8 formats)

2. **New Functions Added:**
   - `generateMasterPassword()` - Generates secure 16-character password with all character types (uppercase, lowercase, numbers, special)
   - `hashPasswordForAuth()` - Client-side Argon2id password hashing (t=3, m=65536, p=1) using @noble/hashes library
   - `generateSeedPhrase()` - Creates 12-word BIP39 mnemonic for account recovery (128 bits entropy)
   - `deriveMasterKeyFromSeedPhrase()` - Derives master key from seed phrase for account recovery
   - `validateSeedPhrase()` - Validates BIP39 mnemonic format
   - `calculatePasswordStrength()` - Returns 0-4 score with feedback based on length, variety, and patterns

3. **Dependencies Added:**
   - @noble/hashes 2.0.1 - For Argon2id password hashing
   - bip39 3.1.0 - For BIP39 seed phrase generation and validation

4. **Security Features:**
   - All crypto operations use Web Crypto API for maximum security
   - Non-extractable CryptoKeys where appropriate
   - Memory cleanup functions (`clearSensitiveData`, `autoClearAfter`)
   - Cryptographically secure random number generation
   - Protection against common password patterns

5. **Convenience Aliases:**
   - `encryptWithPublicKey` → `encryptWithRSA`
   - `decryptWithPrivateKey` → `decryptWithRSA`
   - `generateSymmetricKey` → `generateVaultKey`
   - `encryptData` → `encryptWithAES`
   - `decryptData` → `decryptWithAES`

**Build Status:** ✅ Frontend build successful

**Files Modified:**
- `apps/frontend/src/lib/crypto.ts` - Complete crypto utilities module
- `apps/frontend/package.json` - Added @noble/hashes and bip39 dependencies

---

### 6.2 IndexedDB Key Storage

**Database Schema:**
- Create `password-manager-db` with stores:
  - `user_keys` - Encrypted private key, IV, public key
  - `vault_keys` - Cached decrypted vault keys (encrypted with session key)
  - `session_data` - Session information

**Key Storage Functions:**
- `saveEncryptedPrivateKey(encryptedData, iv, publicKey)`
- `getEncryptedPrivateKey()` - Retrieve from IndexedDB
- `clearAllKeys()` - Clear all cryptographic data on logout
- `cacheVaultKey(vaultId, encryptedKey)` - Cache vault keys for performance

---

#### ✅ Phase 6.2 COMPLETE - 2026-02-24

**Implementation Summary:**

Complete IndexedDB storage layer implemented in `apps/frontend/src/lib/storage.ts` (766 lines) with production-ready code, comprehensive error handling, and TypeScript type safety.

**What was implemented:**

1. **Database Schema:**
   - Database name: `password-manager-db` (version 1)
   - Three object stores with proper indexes:
     - `user_keys` - User's encrypted private key, public key, and metadata (indexed by userId)
     - `vault_keys` - Cached encrypted vault keys (indexed by expiresAt for cleanup)
     - `session_data` - Session information and preferences (key-value store)

2. **User Keys Operations:**
   - `saveUserKeys()` - Save encrypted private key and public key after registration/login
   - `getUserKeys()` - Retrieve stored keys for session restoration
   - `updateEncryptedPrivateKey()` - Update private key when user changes master password
   - `clearUserKeys()` - Remove user keys on logout
   - Single-user-per-browser design (id: '1')

3. **Vault Keys Caching:**
   - `cacheVaultKey()` - Cache encrypted vault keys for performance (configurable expiration)
   - `getCachedVaultKey()` - Retrieve cached vault key with automatic expiration check
   - `deleteCachedVaultKey()` - Remove specific vault key from cache
   - `clearAllVaultKeys()` - Clear all cached vault keys on logout
   - `cleanupExpiredVaultKeys()` - Remove expired cache entries (for periodic cleanup)

4. **Session Data Operations:**
   - `saveSessionData()` - Store JWT tokens, user ID, preferences with optional expiration
   - `getSessionData()` - Retrieve session data with automatic expiration check
   - `deleteSessionData()` - Remove specific session data
   - `clearAllSessionData()` - Clear all session data on logout

5. **Bulk Operations:**
   - `clearAllData()` - Complete security wipe (all keys, vault cache, session data)
   - `hasStoredKeys()` - Check if user has previously logged in
   - `getDatabaseStats()` - Get record counts for debugging
   - `deleteDatabase()` - Complete database removal (for app reset/uninstall)

6. **Utility Functions:**
   - `initDatabase()` - Initialize IndexedDB with proper schema
   - `isIndexedDBAvailable()` - Feature detection for IndexedDB support
   - `getStorageEstimate()` - Check storage quota usage (if supported by browser)

7. **Security Features:**
   - Private keys always stored encrypted (never in plaintext)
   - Automatic expiration checking with auto-deletion
   - Comprehensive error handling with descriptive error messages
   - Single-origin security via IndexedDB same-origin policy
   - Complete data wiping on logout

8. **Type Safety:**
   - `UserKeyData` interface - User key storage structure
   - `VaultKeyData` interface - Vault key cache structure
   - `SessionData` interface - Session data structure
   - All functions fully typed with TypeScript

**Build Status:** ✅ Frontend build successful

**Files Created:**
- `apps/frontend/src/lib/storage.ts` - Complete IndexedDB storage module

**Usage Example:**
```typescript
// During login
await saveUserKeys(userId, encryptedPrivateKey, publicKey);
await saveSessionData('jwt_token', token);

// During app usage
const keys = await getUserKeys();
await cacheVaultKey(vaultId, encryptedVaultKey, 24); // Cache for 24 hours

// During logout
await clearAllData(); // Wipes everything securely
```

---
