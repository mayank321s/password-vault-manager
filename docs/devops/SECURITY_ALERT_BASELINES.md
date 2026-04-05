# Security Alert Baselines

Last updated: 2026-04-05
Owner: Security Operations
Scope: Minimum alerting baseline for the Enterprise + Family launch

## Objective

These alert baselines define the minimum security-response signals that must be
monitored during launch operations. They map directly to product capabilities
already implemented in the application: organization policies, SSO, SCIM, audit
events, and extension trust controls.

## Alert catalog

### 1. SCIM provisioning failures

- Severity: Critical
- Signal source: SCIM diagnostics and recent provisioning event failures
- Trigger baseline: one or more SCIM failures in a 30 minute window, or any
  failure impacting admin or owner accounts
- Action owner: Identity on-call
- Immediate action:
  - identify the failing token and resource ids
  - confirm whether the issue is provider-side, token drift, or configuration drift
  - rotate the token if compromise is suspected
- Evidence to retain:
  - failing resource ids
  - recent failure timestamps
  - token prefix involved

### 2. MFA enforcement drift

- Severity: High
- Signal source: organization policy posture
- Trigger baseline: `requireMfa` disabled for a business organization
- Action owner: Security owner
- Immediate action:
  - confirm whether the change was planned
  - restore the expected policy if not approved
  - review related audit events for identity or admin changes
- Evidence to retain:
  - policy version
  - actor identity
  - change timestamp

### 3. SSO verification posture gap

- Severity: High
- Signal source: SSO configuration and verified domains
- Trigger baseline: SSO configured with no verified primary domain, or users
  reporting login failure after a configuration change
- Action owner: Identity admin
- Immediate action:
  - validate domain verification token and redirect URI
  - confirm the active tenant id and client id
  - re-run verification if configuration drift is confirmed
- Evidence to retain:
  - affected domain
  - last configuration change timestamp
  - impacted user reports

### 4. Suspicious admin activity spike

- Severity: Medium
- Signal source: append-only audit event stream
- Trigger baseline: abnormal increase in policy, SSO, SCIM, or audit export
  actions versus the normal weekly operating window
- Action owner: Security operations
- Immediate action:
  - filter the audit trail to the affected actor/action family
  - determine whether the activity aligns with a planned rollout
  - escalate if the volume or timing appears inconsistent
- Evidence to retain:
  - filtered event export
  - actor ids
  - target ids and timestamps

## Routing baseline

- Critical: page the identity/security on-call immediately
- High: notify security owner and workspace admin within 15 minutes
- Medium: open an incident queue item and review within the same business day

## Launch readiness checklist

The baseline is considered operational when:
- dashboard owners know where each signal is surfaced
- on-call ownership is assigned for each alert
- evidence export paths are confirmed
- the linked incident runbooks are reviewed by launch owners
