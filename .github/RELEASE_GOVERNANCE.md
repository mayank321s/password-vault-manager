# Release Governance

Last updated: 2026-04-04

## Branching strategy

- `dev` is the protected integration branch for launch execution.
- `main` remains the release branch and must not receive direct feature PRs during task execution.
- All changes must be merged through pull requests.
- Direct pushes to `dev` or `main` are disallowed.
- Branch naming convention:
  - `feature/<scope>`
  - `fix/<scope>`
  - `docs/<scope>`
  - `codex/<scope>` for agent execution branches

## Pull request quality gates

The following checks are required before merge to `dev`:
- `Quality Checks`
- `Security Sensitive Review`
- `Validation Suite`
- `Migration Smoke Test`
- `Health Probe Smoke Test`

These checks are defined by `.github/workflows/pr-quality-gates.yml` and `.github/workflows/release-readiness.yml`.

## Security review gate

If a PR changes sensitive areas (`auth`, `crypto`, or extension code), PR description must include:

`Security-Review: approved`

This indicates that security/privacy implications were reviewed before merge.

## Repository settings to enforce

Configure branch protection on `dev` with:
- Require a pull request before merging
- Require status checks to pass before merging:
  - `Quality Checks`
  - `Security Sensitive Review`
  - `Validation Suite`
  - `Migration Smoke Test`
  - `Health Probe Smoke Test`
- Require branches to be up to date before merging
- Require linear history
- Include administrators in enforcement

## Merge policy

- Squash merge is default for feature and docs branches.
- Merge commit is allowed only when preserving commit history is required.
- No force-push to `dev` or `main`.
