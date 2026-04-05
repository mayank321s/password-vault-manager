# Threat Model

Last updated: 2026-04-05
Owner: Security + Engineering
Scope: Launch threat model for core password manager, business identity controls, extension trust, and import flows

## Objective

This threat model summarizes the main assets, trust boundaries, threats, and
mitigations for the launch scope currently represented in the repository.

## System boundaries

Primary components:

- web frontend handling vault access, billing, org settings, imports, and extension onboarding
- backend API handling auth, organization policy, SSO, SCIM, audit, billing, and vault persistence
- browser extension shared platform handling credential access, autofill planning, and trust evaluation
- operational docs and governance controls covering alerts, incident response, and release protections

## High-value assets

- vault keys and encrypted vault contents
- authentication tokens and session state
- SSO configuration and verified domains
- SCIM tokens and provisioning control plane
- append-only audit event history
- imported credential exports before encryption into destination vaults

## Trust boundaries

- client-side encrypted data versus backend-visible metadata
- organization boundary between personal, family, and business workspaces
- admin-only control surfaces for policy, SSO, SCIM, and audit export
- browser pairing and origin trust boundary inside extension autofill flows
- environment isolation between dev, staging, and production

## Threat inventory

| Threat | Impact | Current mitigation |
| --- | --- | --- |
| Tenant boundary bypass | Cross-organization data exposure or admin action abuse | Org-scoped models, membership enforcement, business-only admin endpoints |
| Admin control misuse | Policy, SSO, or SCIM configuration changed by unauthorized actors | Role-guarded admin APIs and append-only audit events |
| Token leakage in logs or support evidence | Session or provisioning compromise | Logger redaction policy, auth-body suppression, token prefix-only diagnostics |
| SCIM token abuse | Unauthorized provisioning or deprovisioning | Token lifecycle controls, revoke path, diagnostics, audit logging |
| SSO misconfiguration or verification drift | Enterprise login outages or routing failures | Domain verification, identity settings visibility, security ops dashboards |
| Browser spoofing or unsafe autofill | Credential exposure to malicious sites or unpaired browsers | Browser pairing, trusted-origin checks, blocked autofill on unsafe origins |
| Malformed or duplicate imports | Bad data writes or unsafe credential migration | Provider-aware parsing, remediation pipeline, review-required rows, client-side encryption before upload |
| Audit tampering or missing evidence | Weak incident investigation and compliance posture | Append-only audit event store and export pipeline |
| Weak operational response | Slow containment during security incidents | Alert baselines, incident runbooks, disclosure workflow |

## Residual risks

- Formal evidence collection for backups, access reviews, and secret rotation is still operational rather than automated
- Public security contact channel and external disclosure page are process-defined here but may still require launch-site publication
- SIEM/export connectors are not part of the current launch baseline

## Review triggers

Update this threat model when:

- new auth or recovery flows are introduced
- new extension capabilities can write or read credentials
- new enterprise integrations add external trust boundaries
- production evidence handling or disclosure processes materially change
