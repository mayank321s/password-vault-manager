# Release Governance

Last updated: 2026-04-04

## Branching strategy

- `main` is the protected release branch.
- All changes must be merged through pull requests.
- Direct pushes to `main` are disallowed.
- Branch naming convention:
  - `feature/<scope>`
  - `fix/<scope>`
  - `docs/<scope>`
  - `codex/<scope>` for agent execution branches

## Pull request quality gates

The following checks are required before merge to `main`:
- `Quality Checks`
- `Security Sensitive Review`

These checks are defined by `.github/workflows/pr-quality-gates.yml`.

## Security review gate

If a PR changes sensitive areas (`auth`, `crypto`, or extension code), PR description must include:

`Security-Review: approved`

This indicates that security/privacy implications were reviewed before merge.

## Repository settings to enforce

Configure branch protection on `main` with:
- Require a pull request before merging
- Require status checks to pass before merging:
  - `Quality Checks`
  - `Security Sensitive Review`
- Require branches to be up to date before merging
- Require linear history
- Include administrators in enforcement

## Merge policy

- Squash merge is default for feature and docs branches.
- Merge commit is allowed only when preserving commit history is required.
- No force-push to `main`.
