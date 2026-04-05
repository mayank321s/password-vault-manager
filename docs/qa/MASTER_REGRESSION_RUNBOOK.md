# QA Master Regression Runbook

## Purpose

This runbook defines the launch-blocking regression program for Password Vault Manager. It separates executable repository checks from manual launch certification so release decisions stay honest and repeatable.

## Scope

The launch regression program covers:

- Auth and account access
- Vault creation, unlock, and password CRUD surfaces
- Billing and entitlement-admin experiences
- Tenant boundary enforcement across personal, family, and business org contexts
- Enterprise SSO and SCIM admin surfaces
- Browser extension credential and trust flows
- Accessibility spot checks on launch-critical routes
- Performance spot checks on frontend production output and critical route load behavior

## Automated Regression Command

Run the master regression bundle from the repository root:

```powershell
pnpm qa:master
```

This command:

- Executes the current backend test suite
- Executes extension package tests
- Verifies backend production build
- Verifies frontend type safety
- Verifies frontend production build
- Writes a timestamped evidence report to `docs/qa/MASTER_REGRESSION_EVIDENCE_<date>.md`

## Manual Certification Checklist

The following launch checks still require an explicit release-owner sign-off:

1. Auth smoke
   Validate register, login, unlock, recovery, and logout behavior in the production-like environment.
1. Vault smoke
   Validate vault creation, password create/edit/delete, sharing entry points, and import completion flow.
1. Billing and entitlement smoke
   Validate pricing, upgrade prompts, billing settings, invoices, and seat/admin warnings.
1. Tenant boundary smoke
   Validate workspace switching, business-only admin panels, and family-role restrictions.
1. SSO and SCIM smoke
   Validate SSO admin configuration visibility, domain-routing UX, SCIM token lifecycle, and diagnostics visibility.
1. Extension smoke
   Validate onboarding prompt, credential lookup planning, trust enforcement, and browser-target messaging.
1. Accessibility spot checks
   Validate keyboard navigation order, headings, button labels, and focus visibility on login, import, org settings, and extension onboarding.
1. Performance spot checks
   Validate production build success, inspect generated asset sizes, and confirm no obvious regressions on critical entry routes.

## Evidence Handling

- Keep the generated evidence report in version control for launch review.
- Add a short release summary to the active task in Notion with links to the PR and the evidence document.
- If a manual item fails, open a follow-up blocker before launch approval and keep the task out of `Verified`.
