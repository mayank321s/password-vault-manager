# Organization + Membership Data Model

Last updated: 2026-04-04
Owner: Backend
Scope: Phase 1 tenant foundation for family and business organizations

## 1) Model objective

Introduce tenant-aware entities that support:
- organization-level isolation
- organization membership and role management
- organization policy storage and enforcement inputs
- safe migration path from current vault-centric membership model

## 2) ERD (target)

```mermaid
erDiagram
    USERS ||--o{ ORGANIZATIONS : "creates"
    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : "has members"
    USERS ||--o{ ORGANIZATION_MEMBERS : "joins"
    ORGANIZATIONS ||--|| ORGANIZATION_POLICIES : "has policy set"
    ORGANIZATIONS ||--o{ VAULTS : "owns"

    USERS {
      uuid id PK
      string email UK
      string username
      bool is_active
      datetime created_at
      datetime updated_at
    }

    ORGANIZATIONS {
      uuid id PK
      string name
      enum organization_type "personal|family|business"
      uuid created_by_user_id FK
      datetime created_at
      datetime updated_at
    }

    ORGANIZATION_MEMBERS {
      uuid id PK
      uuid organization_id FK
      uuid user_id FK
      enum role
      enum status "active|invited|suspended"
      datetime joined_at
      datetime invited_at
      datetime removed_at
    }

    ORGANIZATION_POLICIES {
      uuid id PK
      uuid organization_id FK UK
      bool require_mfa
      bool restrict_external_sharing
      int session_timeout_minutes
      int max_devices_per_user
      json policy_version
      datetime updated_at
    }

    VAULTS {
      uuid id PK
      uuid organization_id FK
      string name
      bool is_personal_vault
      uuid owner_user_id FK
      datetime created_at
      datetime updated_at
    }
```

## 3) Core entities

### organizations
Represents a tenant boundary.

Columns:
- `id` (PK, UUID)
- `name` (required)
- `organization_type` (enum: `personal`, `family`, `business`)
- `created_by_user_id` (FK -> `users.id`)
- `created_at`, `updated_at`

Indexes and constraints:
- index on `organization_type`
- index on `created_by_user_id`
- optional uniqueness guard: `(created_by_user_id, organization_type)` for personal org creation workflows

### organization_members
Represents user membership and authorization role within an organization.

Columns:
- `id` (PK, UUID)
- `organization_id` (FK -> `organizations.id`)
- `user_id` (FK -> `users.id`)
- `role` (enum by organization type; see role model)
- `status` (enum: `active`, `invited`, `suspended`)
- `joined_at`, `invited_at`, `removed_at`

Indexes and constraints:
- unique composite index: `(organization_id, user_id)`
- index on `(user_id, status)` for membership and switcher queries
- FK cascade on organization delete
- FK restrict/cascade strategy on user delete based on retention rules

### organization_policies
Stores enforceable controls at organization scope.

Columns:
- `id` (PK, UUID)
- `organization_id` (FK -> `organizations.id`, unique)
- `require_mfa` (bool)
- `restrict_external_sharing` (bool)
- `session_timeout_minutes` (int)
- `max_devices_per_user` (int)
- `policy_version` (JSON or string)
- `updated_at`

Indexes and constraints:
- unique index on `organization_id` (one policy record per org)
- check constraints:
  - `session_timeout_minutes` in accepted range
  - `max_devices_per_user` >= 1

## 4) Role model

### Family roles
- `owner`
- `adult`
- `child`

### Business roles
- `owner`
- `admin`
- `manager`
- `member`

### Personal role
- `owner` only

Validation rules:
- role must be valid for the organization type
- at least one `owner` must exist per organization
- last owner cannot be removed without ownership transfer

## 5) Policy applicability by org type

- `personal`: minimal policy surface, mostly defaults
- `family`: family-safe restrictions and emergency access controls
- `business`: full admin controls (MFA, sharing restrictions, session controls)

## 6) Tenant boundary constraints

All tenant-aware entities must include `organization_id` and enforce it in:
- read queries
- write queries
- authorization checks

Critical guardrails:
- no cross-organization joins without explicit privileged path
- session/auth claims must include `organization_id`
- organization switch requires fresh authorization context

## 7) Migration strategy (design-level)

- create `organizations`, `organization_members`, `organization_policies`
- backfill each existing user into a default `personal` organization
- link existing vaults to corresponding `organization_id`
- maintain compatibility layer for current `vault_members` during transition
- phase out direct vault-only authorization once org-scope checks are active

## 8) Exit criteria mapping

Acceptance coverage:
- organizations: Section 3
- memberships: Section 3
- roles: Section 4
- policies: Section 3 and Section 5
- constraints: Sections 3, 4, and 6
