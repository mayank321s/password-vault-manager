# Environment Strategy: Dev, Staging, Production Isolation

Last updated: 2026-04-04
Owner: DevOps
Scope: Runtime environment topology, data isolation, and secret scopes for launch readiness

## 1. Environment topology

Three primary environments are required and must remain isolated:
- `dev`: engineer-controlled environment for day-to-day development and feature validation.
- `staging`: release candidate and pre-production validation environment.
- `prod`: customer-facing production environment.

Each environment must have its own:
- compute workloads (API, frontend hosting, workers)
- database instance and backups
- cache/session infrastructure
- object storage buckets
- observability namespaces and alert routing
- secret store namespace

## 2. Isolation model

### Network isolation
- Separate VPC/project/account boundaries per environment where possible.
- No direct inbound access from `dev` to `staging`/`prod` data stores.
- Production administration only through audited bastion/VPN paths.

### Data isolation
- Distinct databases per environment with no shared schemas.
- Production data must never be copied to `dev`.
- Any staging refresh from production requires irreversible anonymization and approval.
- Backups are environment-scoped and restored only into matching environment tier.

### Identity and access isolation
- Least-privilege IAM roles are defined per environment.
- Human access policy:
  - `dev`: engineering team access for rapid iteration.
  - `staging`: limited engineering + QA + release managers.
  - `prod`: restricted on-call/SRE + designated incident commanders.
- All production access events must be logged and reviewable.

## 3. Secret scopes and rotation policy

### Secret scoping
Each environment gets independent secret values and keys for:
- JWT signing secrets
- encryption key material references (KMS/KEK aliases)
- database credentials
- third-party API tokens (billing, email, analytics)
- SCIM/SSO integration credentials

Cross-environment reuse is prohibited for all sensitive credentials.

### Rotation requirements
- Standard credentials: rotate at least every 90 days.
- High-risk credentials (prod admin/API keys): rotate every 30 days.
- Immediate rotation required after suspected exposure, incident, or team offboarding.
- Rotation events recorded in change log with owner and verification evidence.

## 4. Deployment and promotion flow

- Branch flow: feature -> main -> staged release -> production release.
- Promotion direction is one-way: `dev` -> `staging` -> `prod`.
- Required checks before promotion to staging/prod:
  - build and test pipeline pass
  - security checks complete for impacted components
  - migration compatibility reviewed
  - rollback steps documented

Hotfixes are allowed only through documented emergency release process with retrospective follow-up.

## 5. Observability and incident handling

Environment-specific monitoring and alerting are required:
- `dev`: warning-level telemetry for debugging and early regressions.
- `staging`: release quality gating alerts.
- `prod`: customer-impacting SLO, security, and reliability alerts with on-call escalation.

Incident runbooks must include:
- severity definitions
- communication channel ownership
- rollback decision criteria
- post-incident review requirements

## 6. Compliance and retention controls

- Production logs retain security/audit events according to policy.
- Development logs must avoid storing sensitive plaintext data.
- PII handling policy applies in all environments; staging data must be masked if sourced from production.

## 7. Decision checklist

This strategy is considered accepted when:
- Environment topology is provisioned and separated.
- Access controls and secret scoping are enforced.
- Rotation schedule is automated or operationalized.
- Promotion gates and rollback playbooks are documented and tested.
