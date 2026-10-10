---
name: write-changelog
description: Write a new CHANGELOG.md entry covering commits since the last release tag. Use when the user says "Write a changelog", "update the changelog", or asks for release notes for the next version.
---

# Write a changelog

Add a new release section to `CHANGELOG.md` covering every change since the last release.

## 1. Find the range

- Last release: `git describe --tags --abbrev=0` (tags look like `v0.9.1`). If the user names a version, use that tag instead.
- Commits: `git log --oneline <tag>..HEAD`.
- Changed files: `git diff <tag>..HEAD --stat`.
- If there are no commits since the tag, stop and tell the user.

## 2. Pick the version

- If the user gives a version, use it.
- Otherwise propose one from Semantic Versioning, based on the commit types:
  - any `feat` → bump the minor (0.9.1 → 0.10.0)
  - only `fix`, `chore`, `docs`, deps → bump the patch (0.9.1 → 0.9.2)
  - a `!` or `BREAKING CHANGE` → bump the minor while the major is 0, else the major
- Date is today, as `YYYY-MM-DD`.
- Do **not** bump `version` in `package.json` or create a git tag unless the user asks.

## 3. Understand the changes

- Read each `feat`/`fix` commit body and, if needed, its diff (`git show <sha>`), so entries describe what the user sees, not the commit title.
- Group related commits into one entry. Skip pure refactors, formatting, CI noise and changelog/version commits.
- Dependency bumps: take versions from `yarn.lock`, not the Dependabot commit titles (titles can be stale after rebases). Compare with:

  ```bash
  git show <tag>:yarn.lock | grep -A1 '^"\?<pkg>@' | grep '^  version'
  grep -A1 '^"\?<pkg>@' yarn.lock | grep '^  version'
  ```

  Skip a package whose resolved version did not actually change. If a package resolves to several versions, report the one that moved.

- Flag major-version dependency jumps (e.g. react-router 6 → 7) to the user.

## 4. Write the entry

Follow the existing format in `CHANGELOG.md` ([Keep a Changelog](https://keepachangelog.com/en/1.1.0/)):

```markdown
## [0.10.0] - 2026-10-10

### Added

- Short, user-facing sentence, no trailing period
  - Sub-bullets for details

### Changed

- ...
- Bump GitHub Actions:
  - actions/checkout: 6 → 7
- Upgrade dependencies:
  - package: old → new

### Fixed

- ...
```

- Insert the section directly below the intro paragraph, above the previous release.
- Only include headings that have entries, in the order Added, Changed, Deprecated, Removed, Fixed, Security.
- List app dependencies (in `package.json` `dependencies`) before dev/transitive ones.
- Link PRs as `([#24](https://github.com/chatreejs/bill-please/pull/24))` when the commit references one.
- Add the compare link at the top of the link list at the bottom of the file:

  ```markdown
  [0.10.0]: https://github.com/chatreejs/bill-please/compare/v0.9.1...v0.10.0
  ```

## 5. Check and report

- Run `npx prettier --check CHANGELOG.md` (fix with `--write` if needed).
- Do not commit unless asked.
- Tell the user the version chosen, a one-line summary per section, and anything that needs their decision (e.g. major dependency jumps, mismatches with older entries).
