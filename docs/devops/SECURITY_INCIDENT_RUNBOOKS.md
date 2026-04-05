# Security Incident Runbooks

Last updated: 2026-04-05
Owner: Security Operations
Scope: First-response playbooks for launch-critical security events

## Runbook A: SCIM provisioning interruption

Use this runbook when SCIM diagnostics report recent failures or provisioning
traffic stops unexpectedly.

1. Confirm whether failures are isolated to one token, one provider tenant, or
   the entire organization.
2. Review recent SCIM diagnostics for the last success, last failure, and
   affected resource ids.
3. If token misuse is possible, revoke the token and issue a replacement before
   retrying provisioning.
4. Re-test with a controlled user or group update.
5. Export matching audit events and attach them to the incident record.

## Runbook B: Policy drift or unauthorized admin change

Use this runbook when MFA, session, sharing, or related organization policy
controls change unexpectedly.

1. Filter audit events to policy-related actions and identify the actor.
2. Compare the active settings with the expected launch baseline.
3. Restore the approved policy values if the change was not planned.
4. Review nearby identity or token changes for signs of broader misuse.
5. Capture the change timeline, actor, and remediation evidence in the incident
   record.

## Runbook C: SSO verification or login outage

Use this runbook when enterprise users cannot log in through SSO or a verified
domain is missing.

1. Confirm the affected domain, tenant id, redirect URI, and whether the domain
   is still marked verified.
2. Review the latest SSO configuration update in the audit trail.
3. Re-run domain verification if drift is confirmed.
4. If login remains impaired, communicate temporary fallback guidance to tenant
   admins while identity settings are corrected.
5. Record the impact window, affected domains, and final fix.

## Runbook D: Suspicious admin activity review

Use this runbook when audit activity spikes or a high-risk action pattern looks
inconsistent with expected operational changes.

1. Filter the audit stream by actor, action family, and time range.
2. Correlate the activity with planned release windows, incident response, or
   approved migrations.
3. Revoke exposed tokens or pause provisioning if compromise is plausible.
4. Preserve filtered audit exports and note every containment action.
5. Hand off to formal incident review if unauthorized access cannot be ruled out.

## Completion criteria

An incident is considered contained when:
- the triggering signal stops or returns to baseline
- the root operational change is identified
- evidence exports are attached to the incident record
- an owner signs off on follow-up actions
