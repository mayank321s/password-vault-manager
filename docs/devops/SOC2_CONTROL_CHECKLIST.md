# SOC 2 Control Checklist

Last updated: 2026-04-05
Owner: Security + Engineering
Scope: Launch-ready control mapping for Enterprise + Family launch

## Objective

This checklist maps the product and operational controls currently implemented in
the repository to a practical SOC 2 baseline for launch readiness. It is not a
formal audit opinion. It is the working control inventory used to prepare for
trust reviews, customer questionnaires, and future audit evidence collection.

## Control status legend

- `Implemented`: control exists and is supported by product or operational docs
- `Partial`: baseline exists, but operational evidence or automation still needs follow-through
- `Planned`: required for a later release or formal certification phase

## Control checklist

| Trust Area | Control Objective | Current Baseline | Evidence / Source | Status |
| --- | --- | --- | --- | --- |
| Security | Tenant isolation between personal, family, and business organizations | Organization, membership, and policy data model with org-scoped authorization boundaries | `docs/backend/ORGANIZATION_MEMBERSHIP_DATA_MODEL.md` | Implemented |
| Security | Role-based authorization on sensitive admin actions | Admin-only audit, policy, SSO, and SCIM access controls | `apps/backend/src/api/v1/audit/audit.controller.ts`, org settings admin flows | Implemented |
| Security | Strong authentication controls | MFA policy controls, session timeout, and device limits for business orgs | org policy APIs and UI, Sequence 27 deliverables | Implemented |
| Security | Credential secrecy and encryption | Zero-knowledge architecture with client-side encryption and protected vault key handling | `README.md`, import and vault encryption flows | Implemented |
| Security | Sensitive event traceability | Append-only audit event service with export pipeline | `apps/backend/src/api/v1/audit/audit.service.ts`, `apps/backend/src/common/services/audit.service.ts` | Implemented |
| Security | Provisioning and identity governance | SSO configuration, domain verification, SCIM token lifecycle, diagnostics, and revoke flows | SSO and SCIM admin services, Security Ops dashboard | Implemented |
| Security | Extension trust and anti-phishing protection | Browser pairing, trusted-origin evaluation, and autofill blocking for unsafe origins | `packages/extension-core/src/trust.ts` | Implemented |
| Confidentiality | Log redaction for credentials, keys, and auth payloads | Recursive redaction and auth endpoint body suppression in logger formatting | `apps/backend/src/common/logger/redact-format.ts` | Implemented |
| Confidentiality | Environment and secret separation | Distinct dev/staging/prod boundaries and environment-scoped secret rotation policy | `docs/devops/ENVIRONMENT_STRATEGY.md` | Implemented |
| Confidentiality | Export governance for security evidence | Audit exports restricted to business org admins/owners | `apps/backend/src/api/v1/audit/audit.controller.ts` | Implemented |
| Availability | Operational alerting and incident response baseline | Security alert baselines and incident runbooks documented | `docs/devops/SECURITY_ALERT_BASELINES.md`, `docs/devops/SECURITY_INCIDENT_RUNBOOKS.md` | Implemented |
| Availability | Release governance and change approval | PR quality gates and branch protection baseline documented | `.github/RELEASE_GOVERNANCE.md` | Implemented |
| Availability | Backup, rollback, and promotion boundaries | Environment strategy defines promotion gates and rollback expectations | `docs/devops/ENVIRONMENT_STRATEGY.md` | Partial |
| Processing Integrity | Import validation and remediation before write paths | Provider-aware import parsing, duplicate detection, malformed-row blocking, review-required states | Sequences 35-37 implementation | Implemented |
| Processing Integrity | Controlled lifecycle for billing and seat entitlements | Subscription lifecycle, entitlements, and seat enforcement shipped | billing docs and service layer | Implemented |
| Privacy / Confidentiality | Public disclosure and incident communication path | Coordinated disclosure workflow documented for external reports | `docs/devops/SECURITY_DISCLOSURE_WORKFLOW.md` | Implemented |
| Governance | Threat model maintained as product scope expands | Launch threat model updated for identity, extension, audit, and import surfaces | `docs/devops/THREAT_MODEL.md` | Implemented |

## Pre-launch evidence checklist

Before using this control set in customer trust reviews, confirm:

- branch protections and required checks are configured in the hosting platform
- production secret rotation owners are assigned
- on-call owners accept the security alert baselines
- incident runbook links are available to launch responders
- audit export access is validated in a live business workspace

## Known follow-up items

- add formal evidence collection cadence for rotation logs, backup restore checks, and access reviews
- add post-launch SIEM/export controls if the enterprise connector pack is expanded
- convert this checklist into a tracked evidence register if SOC 2 certification becomes active
