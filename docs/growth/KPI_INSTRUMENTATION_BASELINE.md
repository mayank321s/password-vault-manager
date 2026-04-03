# KPI Instrumentation Baseline

Last updated: 2026-04-04
Owner: Growth (with Product + Engineering support)
Scope: Activation funnel, autofill reliability, and conversion metrics

## 1) Event catalog (baseline)

### A. Acquisition and signup
- `landing_viewed`
- `pricing_viewed`
- `signup_started`
- `signup_completed`

Required properties:
- `visitor_id`
- `session_id`
- `channel` (organic, paid, referral, direct)
- `campaign` (optional)
- `plan_intent` (`family`, `business`, `unknown`)

### B. Activation and setup
- `first_login_success`
- `vault_created`
- `first_password_saved`
- `first_share_invite_sent`
- `first_autofill_success`

Required properties:
- `user_id`
- `organization_id`
- `organization_type` (`personal`, `family`, `business`)
- `time_from_signup_seconds`

### C. Autofill reliability
- `autofill_prompt_shown`
- `autofill_attempted`
- `autofill_succeeded`
- `autofill_failed`

Required properties:
- `browser` (chrome, edge, firefox, safari)
- `platform` (desktop, mobile)
- `domain_hash` (hashed domain identifier)
- `failure_reason` (if failed)
- `extension_version`

### D. Subscription and conversion
- `trial_started`
- `checkout_started`
- `checkout_completed`
- `subscription_activated`
- `payment_failed`
- `subscription_canceled`

Required properties:
- `plan` (`family`, `business`)
- `billing_interval` (`monthly`, `yearly`)
- `currency`
- `trial_days`
- `seats_purchased` (business only)

## 2) Metric definitions

### Activation metrics
- Signup completion rate:
  - `signup_completed / signup_started`
- 24h activation rate:
  - users with `first_password_saved` within 24h / `signup_completed`
- Time-to-first-password (median):
  - median of `time_from_signup_seconds` for `first_password_saved`

### Autofill reliability metrics
- Autofill success rate:
  - `autofill_succeeded / autofill_attempted`
- Browser-level success rate:
  - success rate grouped by `browser`
- Top failure reasons:
  - count of `autofill_failed` grouped by `failure_reason`

### Conversion metrics
- Trial-to-paid conversion:
  - `subscription_activated / trial_started`
- Checkout completion rate:
  - `checkout_completed / checkout_started`
- Payment failure rate:
  - `payment_failed / checkout_completed`

## 3) Dashboard baseline

### Dashboard: Growth Core KPI Board
Refresh cadence: hourly for event data, daily for leadership rollups

Panels:
1. Funnel overview: landing -> signup -> activation -> paid
2. Activation trend (daily and weekly)
3. Autofill reliability by browser/platform
4. Trial-to-paid conversion by plan
5. Payment failures and cancelation trend

## 4) Ownership and operating cadence

### Primary owner
- Growth owner: Responsible for dashboard quality and weekly KPI reporting.

### Supporting owners
- Product owner: Validates metric semantics and target thresholds.
- Backend owner: Ensures event ingestion correctness and schema stability.
- Frontend/extension owner: Ensures client event emission and autofill diagnostics.

### Weekly ritual
- Review KPI deltas, anomaly flags, and top regressions.
- Create follow-up tasks for instrumentation gaps or broken events.

## 5) Data quality guardrails

- Required properties must be non-null for baseline events.
- Event schema changes must be versioned (`event_version`).
- PII safety:
  - Do not emit raw credentials or secrets.
  - Domain identifiers used for autofill analytics must be hashed.
- Sampling policy:
  - No sampling for conversion-critical events.
  - Sampling allowed only for high-volume diagnostic events if explicitly documented.

## 6) Exit criteria mapping

Acceptance criteria coverage:
- Event list: defined in Section 1
- Metric definitions: defined in Section 2
- Dashboard owner assigned: defined in Section 4 (Growth owner)
