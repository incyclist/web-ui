# Contributing to incyclist web-ui

Thank you for your interest in contributing! This repo is MIT-licensed and open to everyone —
anyone can clone it and push a branch directly, no fork required. This document covers
everything you need to get started.

## Development Environment Setup

**Prerequisites:** Node.js (see `.github/workflows/PR.yml` for the versions CI tests against)
and npm.

```bash
git clone https://github.com/incyclist/web-ui.git
cd web-ui
npm install
```

This installs `incyclist-services` and `incyclist-devices` from npm, which is enough for most
contributions. You only need a local sibling checkout of those repos (see the "Available
Scripts" section in [README.md](./README.md)) if your change actually requires modifying code
in `services` or `devices` alongside web-ui.

To verify your setup:

```bash
npm run dev
```

and open [http://localhost:3000](http://localhost:3000). Note that the browser has limited
support for app-only features (local file access, BLE, ANT+, ...).

## Before You Start

For anything beyond a trivial fix (typo, small copy change, obvious one-line bug), please open
an issue first — or comment on an existing one — describing what you want to change and why,
before writing code. This avoids spending effort on a PR that doesn't end up being the right
direction. Small, obvious fixes can go straight to a PR without this step.

## Code Conventions

**Read [docs/CODEBASE_GUIDE.md](./docs/CODEBASE_GUIDE.md) before writing any code, and follow
it.** It covers the folder layout, the atoms/molecules/modules component layering, the
smart/view split, state management, styling conventions, and testing conventions this codebase
relies on. This isn't optional reading — PRs that don't follow it, especially the **logging
conventions** (log every user interaction, never log personal data), will be rejected and asked
to be reworked rather than merged with exceptions.

There's no ESLint or Prettier config in this repo, and no TypeScript — it's plain JS/JSX. Match
the style of the file you're editing.

## Testing

This repo uses **Vitest** + `@testing-library/react`. Tests are colocated with the file they
test, suffixed `*.unit.test.jsx` (or `.js`) — not placed in a `__tests__` folder.

```bash
npm run test          # runs vitest (unit tests + Storybook interaction tests)
npm run storybook     # visually inspect components at http://localhost:6006
```

If you add or change a UI component, add or update its `*.unit.test.jsx` and, for a pure view
component, its `*.stories.jsx`. All tests must pass before a pull request can be merged — CI
runs `npm run build` and `npm run test` on every PR.

## Branch Naming and Commits

Use a short, descriptive branch name prefixed with the type of change, e.g.:

```
fix/route-tile-click-logging
feat/workout-graph-dual-axis
docs/update-contributing-guide
```

Commit messages follow a loose [Conventional Commits](https://www.conventionalcommits.org)
style — `<type>: <short summary>`, where `<type>` is one of `feat`, `fix`, `refactor`, `test`,
`chore`, `docs`:

```
fix: resolve crash when route has no coordinates
feat: add dual-axis overlay to workout graph
```

There's no issue-number requirement in the commit message itself — just reference the issue in
the PR description if one exists.

## Submitting a Pull Request

1. Clone the repository and create a branch from `main` following the naming convention above —
   everyone has write access, so there's no need to fork.
2. Implement your change, following [docs/CODEBASE_GUIDE.md](./docs/CODEBASE_GUIDE.md).
3. Run `npm run test` and fix any failures.
4. Push your branch and open a pull request against `main` — regular (not draft) is fine.
5. In the description, summarise what changed and why, and link the related issue if there is
   one (e.g. `Closes #42`).

Pull requests are reviewed by maintainers. Please be responsive to feedback and update your
branch as requested.
