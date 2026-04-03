This repo is for a password manager app. The main focus is on security and zero-knowledge architecture. The app will be built using React (SPA) for frontend and Node.js(Nestjs) for backend. The database will be Postgres.

A few libraries that will be used:
- `argon2` for hashing user passwords (for login)
- `crypto` (Node.js) and Web Crypto API (browser) for encryption/decryption
- `jsonwebtoken` for JWT-based authentication
- `throttle` for rate limiting API endpoints
- `helmet` for setting secure HTTP headers
- `cors` for handling cross-origin requests securely
- `winston` for logging (with sensitive data redacted)
- `dotenv` for managing environment variables
- `zod` for input validation, dtos, validation pipes
- `sequelize` for database ORM
- `vitest` for unit testing
- `supertest` for integration testing


# Features
- User should be able to create a vault. every user will have personal vault. non shareable
- User should be able to add a note or password to a vault
- User can permit other users to add/view/edit vault, note/password
- There are 4 types of users 
	- owner - creator of vault
	- manager - add/remove members in a vault, edit password in vault
	- team members - add password to vault / view password in vault
	- password owner - create edit it's password. 
- Password can be created in a vault only. when wanting to give access to someone outside vault, add the person to password as a viewer. 
- if person doesn't have account, share a one time usable link to password. Anyone with the link can view it once. 

#  Questions:
1. How to share password in vault to others using public key encryption.
	  - every vault has a encryption_key.
	  - other users who join this vault will have the vault key encrypted by their public key and stored.
	  - when a user wants to create a password, it asks for vault_encryted_key which he decrypts on his end using his private key and then encrypts the password and send it to server. other users can only use their vault_encrypted_key, decrypt it, and use it again to decrypt password in vault.
2. How to keep user encryption keys same between multiple devices? Where to save the user's private key?
	- Generate RSA-4096 key pair randomly (fast ~50ms generation)
	- Generate RSA-PSS-4096 signing key pair for account recovery verification
	- Generate 12-word BIP39 seed phrase for account recovery
	- Derive wrapping key from seed phrase using PBKDF2 (2048 iterations)
	- Encrypt both private keys with wrapping key → store encrypted_private_key and encrypted_signing_private_key in DB
	- User sets master password for daily login
	- Use PBKDF2 to derive master key from password + salt (600k iterations)
	- Encrypt seed phrase with master key → store encrypted_seed_phrase in DB
	- Login: decrypt seed phrase → derive wrapping key → decrypt private keys
	- Recovery: seed phrase → derive wrapping key → decrypt signing private key → sign recovery payload → set new password
3. The whole point of a salt is to ensure that two users with the same password (e.g., 123456) end up with completely different encryption keys. If you use the same salt for everyone, then two users with the same password will have the same master key, which is a security risk. Always generate a unique salt for each user and store it in the database.
4. How to make one time share link secure for users outside of system?
	- when user clicks on share one time link, the password on local is encrypted using random secret 256 symmetric key.
	- the encryption blob is sent to server, server gives the link_id.
	- create a url `https://yourtool.com/share/link_id#decrypt_key`
	- `#` is important so that the key doesn't goes to server
	- server gives the blob, and deletes it from db.
	- decrypt it using the key. then forget the key.
5. What if user forgets the master password?
	- User recovers using 12-word BIP39 seed phrase
	- Client fetches encrypted keys from public /auth/recovery-data endpoint
	- Derive wrapping key from seed phrase → decrypt signing private key
	- User sets new password and generates new salt
	- Create recovery payload with new credentials (passwordHash, encryptedSeedPhrase, encryptedPrivateKey, encryptedSigningPrivateKey, encryptionSalt)
	- Sign payload with RSA-PSS signing private key (proves possession of seed phrase)
	- Send signed payload to server
	- Server verifies signature with user's signing public key stored in database
	- If signature is valid, update user credentials atomically
	- Invalidate all existing sessions
	- User logs in with new password
	- SECURITY: Digital signatures prove ownership without transmitting seed phrase
6. Storing user password for login (double hashing)
	- The user password is hashed using argon2. it uses unique salt for every unique string automatically.
	- this argon hash is sent to server, server hash this hash again with a preconfigured server salt and stores it.
	- this way server never sees original master password.
# Tables
- vault   :  id, name, encryption_key, is_personal_vault, owner_user_id
- vault_members : vault_id, user_id, user_role, vault_encrypted_key,
- user : user_id, username, password_hash, public_key, signing_public_key, encrypted_private_key, encrypted_signing_private_key, encrypted_seed_phrase, encryption_salt
- passwords : vault_id, encrypted_data, is_read_only

## Account Recovery Security Architecture

The account recovery flow uses **RSA-PSS digital signatures** to cryptographically prove possession of the seed phrase without transmitting it:

### Registration Flow:
1. Generate 2 RSA-4096 key pairs:
   - **Encryption Key Pair** (RSA-OAEP): Used for vault key encryption
   - **Signing Key Pair** (RSA-PSS): Used for account recovery verification
2. Derive wrapping key from seed phrase (PBKDF2, 2048 iterations)
3. Wrap both private keys with wrapping key (AES-256-GCM)
4. Encrypt seed phrase with password-derived master key (PBKDF2, 600k iterations)
5. Store: `public_key`, `signing_public_key`, `encrypted_private_key`, `encrypted_signing_private_key`, `encrypted_seed_phrase`

### Login Flow:
1. User enters password
2. Derive master key from password + salt (PBKDF2, 600k iterations)
3. Decrypt seed phrase with master key
4. Derive wrapping key from seed phrase (PBKDF2, 2048 iterations)
5. Unwrap both private keys with wrapping key
6. User can now decrypt vault keys and access passwords

### Recovery Flow (Forgot Password):
1. User enters seed phrase
2. Fetch encrypted keys from `/auth/recovery-data` (public endpoint)
3. Derive wrapping key from seed phrase
4. Unwrap signing private key
5. User sets new password
6. Create recovery payload with new credentials:
   ```json
   {
     "passwordHash": "...",
     "encryptedSeedPhrase": "...",
     "encryptedPrivateKey": "...",
     "encryptedSigningPrivateKey": "...",
     "encryptionSalt": "..."
   }
   ```
7. **Sign payload with RSA-PSS signing private key** (proves possession of seed phrase)
8. Send `{ payload, signature }` to server
9. Server verifies signature with user's `signing_public_key` from database
10. If signature is valid, update credentials atomically
11. Invalidate all existing sessions
12. User logs in with new password

### Security Guarantees:
- **No Seed Phrase Transmission**: Seed phrase never leaves client
- **Cryptographic Proof**: RSA-PSS signatures prove possession without revealing private key
- **Unforgeable**: Only client with valid seed phrase can generate valid signatures
- **Zero-Knowledge**: Server never sees plaintext passwords, private keys, or seed phrases
- **Atomic Updates**: All credential changes happen in single database transaction
- **Session Invalidation**: All existing sessions revoked after recovery
- **Rate Limiting**: Recovery endpoint limited to 5 requests/hour per IP


---
# Security

## 1. Frontend & Client-Side Security

The frontend is the most vulnerable point because it handles the plaintext master password and the decrypted private keys.

- **Content Security Policy (CSP):** Implement a strict CSP header to prevent **Cross-Site Scripting (XSS)**. Disable `eval()`, and only allow scripts from trusted domains. This prevents a hacker from injecting a script to "scrape" the password fields.
    
- **Subresource Integrity (SRI):** If you load libraries (like your crypto library) from a CDN, use SRI tags. This ensures that if the CDN is hacked and the library is swapped with a malicious one, the browser will refuse to execute it.
    
- **Memory Hygiene:** Ensure that sensitive variables (like the raw Master Password) are cleared or overwritten as soon as the key derivation is finished.
    
- **Secure Cookies:** Use `HttpOnly`, `Secure`, and `SameSite=Strict` flags for session cookies to prevent **Cross-Site Request Forgery (CSRF)** and token theft.
    
- **Sanitization:** Use libraries like `DOMPurify` for any user-generated content to prevent HTML injection.
    

---

## 2. Backend & Infrastructure Security

Since you are building "Zero-Knowledge," the backend's job is to be a secure, blind vault.

- **Rate Limiting & Brute Force Protection:** Implement aggressive rate limiting on the `/login` and `/derive-salt` endpoints. Use a "leaky bucket" algorithm to slow down automated attacks.
    
- **Database Encryption at Rest:** Even though the _vault_ is encrypted by the client, the database itself (RDS, Postgres, etc.) should be encrypted at the disk level.
    
- **No Logging of PII:** Ensure your logging middleware (like Winston or Morgan) is configured to **never** log request bodies or headers that might contain Auth Hashes or email addresses.
    
- **Input Validation:** Use a schema validator (like `Joi` or `Zod`) for every API endpoint. Pentests often try "SQL Injection" or "NoSQL Injection" by sending malformed JSON objects.
    
- **Secure Headers:** Use the `Helmet` middleware (for Node.js) to set headers like `X-Frame-Options: DENY` (to prevent Clickjacking) and `Strict-Transport-Security` (HSTS).
    

---

## 3. Cryptographic Standards (The "Audit" Focus)

A pen tester will look specifically at how you implemented the math.

- **Avoid "Roll Your Own Crypto":** Never write your own encryption algorithms. Use the **Web Crypto API** (Frontend) and **Libsodium** or **Node Crypto** (Backend).
    
- **High Iteration Counts:** For your KDF (PBKDF2/Argon2), use iteration counts that meet current OWASP recommendations (e.g., at least 600,000 for PBKDF2-HMAC-SHA256).
    
- **Cryptographically Secure Randomness:** Always use `window.crypto.getRandomValues` or `crypto.randomBytes`. Never use `Math.random()`.
    

---

## 4. Authentication & Session Management

- **MFA (Multi-Factor Authentication):** Standard password managers _must_ support TOTP (Google Authenticator) or WebAuthn (Yubikeys).
    
- **Session Revocation:** If a user loses a device, they must have a way to "Revoke all other sessions" from the backend, which should immediately invalidate all active JWTs or session IDs.
    
- **Versioned Encryption:** Include a "version" tag on your encrypted blobs. If you upgrade from AES-GCM to a newer standard in 3 years, your app needs to know how to handle both.
