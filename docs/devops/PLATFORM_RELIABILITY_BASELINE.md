# Platform Reliability Baseline

Last updated: 2026-04-05
Owner: DevOps + Engineering
Scope: Release operations baseline for launch readiness

## Objective

This baseline defines the minimum operational controls required for release
quality, staging parity, migration safety, backup handling, secret rotation, and
service-level alerting at launch.

## CI and release gates

The `Release Readiness` workflow is the integration gate for `dev` and must
validate:

- backend unit tests
- extension package tests
- backend build
- frontend typecheck and build
- migration smoke against a real PostgreSQL service
- liveness and readiness probe smoke after migrations

Related workflow:
- `.github/workflows/release-readiness.yml`

## Staging parity requirements

Staging must mirror production for:

- API + frontend deploy topology
- PostgreSQL major version
- migration sequence and startup ordering
- secret injection path and environment variable names
- health probe configuration and alert routing

Any production-only exception must be documented before release approval.

## Migration safety baseline

- Every schema change must ship with an idempotent migration file
- `migrate:up` and `migrate:check` must pass in CI against a clean PostgreSQL instance
- Application readiness checks must only pass when the database is reachable
- Production rollouts require rollback notes for destructive or high-risk schema changes

## Backup and restore baseline

- PostgreSQL backups must run on an environment-scoped cadence with retention owned by DevOps
- Restore verification must be performed on a non-production target before launch and then on a recurring cadence
- Backup evidence should include:
  - backup timestamp
  - restore verification timestamp
  - owner
  - outcome

## Secret rotation baseline

- Rotate standard secrets every 90 days
- Rotate high-risk production admin or API secrets every 30 days
- Rotate immediately after suspected exposure, offboarding, or security incidents
- Record each rotation with owner, timestamp, affected environment, and verification result

## SLO and alerting baseline

Minimum launch alerts:

- readiness probe failures on API instances
- sustained database connectivity failures
- migration smoke failure in CI
- security alerts defined in `SECURITY_ALERT_BASELINES.md`

Minimum service indicators:

- API liveness success rate
- API readiness success rate
- deployment success/failure rate for `dev` and `staging`
- restore verification pass/fail result

## Release approval checklist

Release operations are considered launch-ready when:

- `Release Readiness` passes on `dev`
- staging matches the documented parity baseline
- the latest backup and restore verification are recorded
- secret rotation owners are assigned
- liveness and readiness probes are enabled in deployment infrastructure
