# Security Disclosure Workflow

Last updated: 2026-04-05
Owner: Security Operations
Scope: Intake and coordinated handling of external security reports

## Objective

This workflow defines how security issues reported by customers, researchers, or
partners are received, triaged, remediated, and communicated.

## Intake channels

Accept reports through:

- designated security/support email address
- trusted customer success or enterprise support channels
- internal escalation from engineering, support, or launch operations

Reports should include, when available:

- affected area or feature
- reproduction steps
- impacted account type or organization type
- screenshots or evidence with sensitive values redacted

## Triage SLA

- `Critical`: acknowledge within 4 hours
- `High`: acknowledge within 1 business day
- `Medium` / `Low`: acknowledge within 2 business days

## Severity guide

- `Critical`: active compromise, unauthorized account access, secret exposure, or broken tenant boundary
- `High`: meaningful auth bypass, provisioning takeover risk, audit tampering risk, or extension trust bypass
- `Medium`: security weakness with mitigations or limited exploitability
- `Low`: best-practice gaps, low-impact metadata exposure, or hardening requests

## Workflow

1. Receive and log the report in the incident/security tracker
2. Confirm severity, scope, and whether customer communication needs immediate action
3. Reproduce in a safe environment without using production secrets
4. Open a tracked engineering fix if the issue is valid
5. Prepare mitigations or temporary controls if a full fix is not immediate
6. Validate remediation through tests or explicit verification steps
7. Close the report with an internal summary and customer-facing response as appropriate

## Communication rules

- Do not promise timelines before engineering confirms scope
- Avoid sharing exploit details broadly before remediation is ready
- Share customer-facing updates only with redacted evidence and approved wording
- If the issue affects multiple tenants, coordinate status updates with incident ownership

## Disclosure readiness checklist

Before closing a report, confirm:

- the root cause is documented
- the fix or mitigation is deployed or explicitly scheduled
- affected docs, runbooks, or threat model sections are updated if needed
- the report record includes owner, severity, timeline, and final outcome
