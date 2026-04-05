# Support Runbook

Last updated: 2026-04-05
Owner: Support

## Objectives

- Give support a single launch-day triage path.
- Keep customer-visible issues routed quickly to the right owner.
- Prevent ambiguous escalation during the first launch window.

## Severity Model

### P0

- Login or unlock broadly unavailable
- Vault data inaccessible for multiple customers
- Tenant boundary or security/privacy regression
- Payment or provisioning issue blocking all new business customers

Action:
- Page engineering owner immediately
- Freeze rollout
- Start incident response runbook

### P1

- High-friction launch blocker for one critical flow
- SSO or SCIM onboarding failing for a launch customer
- Extension save/autofill broken on a supported browser cohort
- Import flow failing for a common provider format

Action:
- Escalate within 15 minutes
- Assign engineering owner and status lead
- Keep rollout paused for the affected cohort if needed

### P2

- Workaround exists
- Single-customer or small-cohort issue
- Documentation, UX, or non-blocking billing admin issue

Action:
- Respond within business-hours launch coverage
- Capture repro and add follow-up ticket

## First-Line Triage Checklist

1. Capture exact route, browser, org type, and timestamp.
1. Confirm whether the issue affects personal, family, or business workspaces.
1. Check whether the issue is auth, vault, billing, extension, import, SSO, or SCIM related.
1. Collect screenshots, error text, and whether the problem reproduces after re-login.
1. Link the customer report to the matching product surface in the launch tracker.

## Escalation Map

- Auth, unlock, recovery:
  - Backend owner
- Vault, sharing, import:
  - Frontend + backend product owner
- Billing and seat controls:
  - Billing owner
- SSO and SCIM:
  - Enterprise identity owner
- Extension and autofill trust:
  - Extension owner
- Platform outage or degraded availability:
  - DevOps owner

## Required Reference Docs

- `docs/qa/MASTER_REGRESSION_EVIDENCE_2026-04-05.md`
- `docs/devops/SECURITY_INCIDENT_RUNBOOKS.md`
- `docs/devops/SECURITY_ALERT_BASELINES.md`
- `docs/devops/PLATFORM_RELIABILITY_BASELINE.md`
- `docs/growth/KPI_INSTRUMENTATION_BASELINE.md`

## Customer Response Guidelines

- Acknowledge within the severity target.
- Avoid promising a fix time until engineering has confirmed scope.
- Use plain descriptions of impact and workaround status.
- For security-sensitive issues, do not include secrets, raw domains, or customer vault details in broad channels.
