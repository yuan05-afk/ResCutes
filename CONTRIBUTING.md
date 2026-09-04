# Contributing to ResCutes

This guide is for the ResCutes team: branch workflow, commits, pull requests, and what never goes into Git.

---

## Branch strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, demo-ready releases |
| `develop` | Shared integration branch |
| `feature/*` | Individual development branches |

Do **not** commit directly to `main` or `develop` during normal feature work.

---

## Starting work

```powershell
git checkout develop
git pull
git checkout -b feature/descriptive-feature-name
```

Use a short, descriptive branch name (for example `feature/veterinary-workflow`, `feature/shelter-handoff-intake`).

---

## Before you commit

Run checks and review your changes:

```powershell
npm run lint
npm test
git status
```

Fix lint and test failures before committing. Review `git status` so only intended files are staged.

---

## Commit workflow

```powershell
git add .
git status
git commit -m "type: concise description"
```

### Commit prefixes

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature or user-visible capability |
| `fix:` | Bug fix |
| `refactor:` | Code change without new behavior |
| `test:` | Tests only |
| `docs:` | Documentation only |
| `chore:` | Tooling, config, housekeeping |

### ResCutes examples

```text
feat: complete rescue workflow through shelter intake
feat: add veterinary examination and medical clearance workflow
fix: persist demo store across server action requests
refactor: align animal detail layout with dashboard PageShell
test: add handoff and intake integration tests
docs: add team onboarding README and CONTRIBUTING
chore: update eslint config for Next.js 15
```

Write the subject in imperative mood, keep it concise, and focus on **why** the change matters when helpful.

---

## Push

**First push** on a new branch:

```powershell
git push -u origin feature/descriptive-feature-name
```

**Later pushes** on the same branch:

```powershell
git push
```

---

## Pull requests

1. Open a **Pull Request from your `feature/*` branch into `develop`**.
2. Do **not** merge feature work directly into `main`.
3. Do **not** merge into `main` until changes are stable and demo-ready on `develop`.

### Review checklist

- Changed files match the PR description
- `npm test` passes
- `npm run lint` passes
- No secrets in the diff (`.env`, keys, passwords)
- No regressions in rescue, shelter, or veterinary workflows

### After approval

```text
feature/* → develop
```

`main` should only receive stable, demo-ready changes from `develop` (release or demo cut).

---

## Staying updated

If `develop` moved while you were working:

```powershell
git checkout develop
git pull
git checkout feature/my-feature
git merge develop
```

Resolve merge conflicts carefully, then run `npm run lint` and `npm test` before pushing.

---

## Never commit

| Item | Notes |
|------|--------|
| `.env` | Local secrets |
| `.env.local` | Local secrets (copy of `.env.example`) |
| `node_modules/` | Install with `npm install` |
| `.next/` | Next.js build output |
| Credentials | API keys, database passwords, tokens |

`.gitignore` excludes many of these, but **always run `git status` before every commit**. If something sensitive was staged, unstage it and do not push.

---

## Team rules

1. **One feature or task = one feature branch.**
2. Avoid multiple people editing the same feature branch unless that is planned.
3. Keep PRs focused; large milestones can still be one branch if the team agrees, but prefer reviewable chunks when possible.
4. Do not run `npm run build` while `npm run dev` is running (see README). Stop dev, build, delete `.next`, then restart dev if you need a production build check.

---

## Questions

If workflow or setup is unclear, ask in the team channel before merging to `develop`. For product scope, refer to `ResCutes_PRD.md` and `ResCutes_starter_prompt.md` in the repository.
