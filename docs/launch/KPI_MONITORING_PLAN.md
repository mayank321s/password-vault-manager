# KPI Monitoring Plan

Last updated: 2026-04-05
Owner: Growth

## Source Of Truth

Primary KPI definitions live in `docs/growth/KPI_INSTRUMENTATION_BASELINE.md`.

This launch monitoring plan defines who watches those signals, how often they review them, and what changes require escalation.

## Launch Watch Metrics

### Activation

- Signup completion rate
- 24-hour activation rate
- Time-to-first-password

Escalate if:
- Signup completion drops sharply from the pre-launch baseline
- Time-to-first-password rises meaningfully for new users

### Autofill and extension reliability

- Autofill success rate
- Browser-level success rate
- Top autofill failure reasons

Escalate if:
- One supported browser drops materially below the launch baseline
- Trust or domain-matching issues appear in support or telemetry

### Conversion and billing

- Checkout completion rate
- Trial-to-paid conversion
- Payment failure rate

Escalate if:
- Checkout completion falls materially from launch baseline
- Payment failures rise in a way that blocks onboarding

### Enterprise adoption

- SSO setup starts and completions
- SCIM token creation and provisioning activity
- Audit and policy admin page usage

Escalate if:
- Business admins repeatedly fail setup at the same step
- Provisioning failures cluster around one setup path

## Review Cadence

### Launch day

- Growth and product review KPIs every 2 hours
- Engineering joins any review with a P0/P1 signal change

### First 72 hours

- Review twice daily
- Publish a short written summary with:
  - key metric shifts
  - anomalies
  - recommended follow-up actions

## Reporting Template

1. Metric movement
1. Suspected cause
1. Customer impact
1. Immediate action owner
1. Next check-in time
