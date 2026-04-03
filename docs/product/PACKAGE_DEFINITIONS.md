# Product Package Definitions

Last updated: 2026-04-04
Owner: Product
Scope: Family plan, Business plan, and Enterprise add-ons

## 1. Package boundaries

### Family
- Audience: households and small family groups.
- Intended size: up to 6 members in one family organization.
- Included capabilities:
  - Personal vault per member.
  - Shared family vaults.
  - Member invitation and role assignment (`owner`, `adult`, `child`).
  - Emergency access flows for trusted contacts.
  - Multi-device sync and account recovery.
- Exclusions:
  - No SSO/SCIM.
  - No enterprise audit export integrations.
  - No advanced admin policy engine.

### Business
- Audience: teams and companies needing seat-based collaboration.
- Intended size: 1 to 250 managed seats (self-serve tier).
- Included capabilities:
  - Organization-scoped vault management.
  - Role-based access (`owner`, `admin`, `manager`, `member`).
  - Central billing and seat management.
  - Shared vault controls and policy templates.
  - Basic audit event visibility.
- Exclusions:
  - SAML SSO and SCIM are not included by default.
  - SIEM export is not included by default.

### Enterprise add-ons
- Audience: larger organizations with procurement and compliance requirements.
- Add-on modules available on top of Business:
  - `SSO Pack`: SAML/OIDC with domain verification and setup wizard.
  - `SCIM Pack`: automated provisioning, deprovisioning, and group-role sync.
  - `Audit & Export Pack`: immutable audit export API (CSV/JSON) and retention controls.
  - `SIEM Connector Pack` (post-launch target): outbound security event integrations.
- Notes:
  - Enterprise uses the Business core as baseline and layers add-ons per contract.

## 2. Seat assumptions

### Family seat assumptions
- Default included members: 6.
- Owner can invite and remove members.
- Soft warning at 5/6 seats used.
- Hard limit at 6/6 unless an additional family-seat extension is enabled (future option).

### Business seat assumptions
- Billing unit: per active seat.
- Minimum billable seats: 1.
- Seat states:
  - `active` (assigned to a member)
  - `unassigned` (paid but currently unused)
  - `pending-invite` (reserved during invitation window)
- Overages:
  - New assignments are blocked when no unassigned seats remain.
  - Upgrade prompt appears with one-click seat increase path.

### Enterprise seat assumptions
- Contracted seat pool with negotiated annual commitment.
- SCIM-provisioned users consume seats on activation.
- Admins can reclaim seats through deprovisioning or assignment changes.

## 3. Upgrade paths

### Consumer and family upgrade path
- `Personal` -> `Family`
  - User creates or converts to a family organization.
  - Existing personal vault remains available and can be shared into family vaults.

### Team and business upgrade path
- `Family` -> `Business`
  - Organization type migration supported by admin flow.
  - Roles map from family roles to business roles with explicit confirmation.

### Business and enterprise upgrade path
- `Business` -> `Business + Enterprise Add-ons`
  - Add-ons are independently purchasable based on procurement needs.
  - No data migration required; capabilities unlock by entitlement.

### Downgrade policy (guardrails)
- Add-on removal preserves historical data where required, but disables new admin actions tied to that add-on.
- Seat downgrades cannot reduce below currently active assigned users.

## 4. Approval checklist

This document is considered approved when the following are all confirmed by Product, Engineering, and GTM owners:
- Package boundary definitions accepted.
- Seat assumptions validated against billing model.
- Upgrade and downgrade paths validated against entitlement rules.
- Messaging aligned with pricing and onboarding surfaces.
