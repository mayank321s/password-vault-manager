# Security Redaction Policy

Last updated: 2026-04-05
Owner: Security + Backend
Scope: Logging, debugging, and evidence-handling rules for sensitive data

## Objective

This policy defines what must be redacted from logs, incident notes, exported
evidence, and debugging artifacts before they are retained or shared.

## Redaction principles

- Never log secrets, credentials, encryption material, or recovery artifacts in plaintext
- Prefer structured metadata over raw payload capture
- Redact at the earliest boundary possible
- Treat screenshots, support attachments, and copied JSON as evidence that also requires redaction

## Repository-backed implementation baseline

Current logger redaction behavior includes:

- recursive redaction across nested objects and arrays
- key-based redaction for passwords, tokens, keys, encrypted blobs, salts, IVs, nonces, and recovery artifacts
- full request-body redaction on auth endpoints

Implementation reference:
- `apps/backend/src/common/logger/redact-format.ts`

## Always redact

The following categories must never appear in retained logs, screenshots, docs, or tickets:

- passwords, password hashes, password reset material
- JWTs, API keys, bearer tokens, session tokens, SCIM tokens
- encrypted private keys, vault encrypted keys, shared keys, recovery codes
- seed phrases, mnemonics, backup codes
- raw credential field values imported from third-party managers
- payment instruments, SSNs, PINs, CVVs, or equivalent regulated identifiers

## Allowed metadata

The following may be retained when operationally necessary:

- timestamps
- actor user ids or emails for authorized admin activity
- organization ids
- endpoint names and action names
- token prefixes only, never full tokens
- domain names when needed for trust or phishing investigation
- hashed or anonymized identifiers when exact values are not required

## Evidence handling rules

- Audit exports may be retained for incident review, but must be shared only with authorized admins, security owners, or auditors
- If exported metadata includes freeform fields, review for accidental secret leakage before distribution
- Support or incident tickets must replace sensitive values with `[REDACTED]`
- Demo or launch screenshots should avoid showing live vault contents or imported credential rows

## Exceptions

Any exception to this policy requires:

- explicit security owner approval
- a written reason for temporary exposure
- shortest-possible retention window
- documented cleanup after the task completes

## Review cadence

This policy should be reviewed whenever:

- new auth, billing, import, or recovery flows are added
- logging formats change
- new incident evidence workflows are introduced
