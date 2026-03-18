# Backend Coding Challenge — Overview

This repository contains **three parts** (one folder per problem). Each folder has its own README with more detail.

---

## Problem 4 — `problem-4/`

| | |
|---|---|
| **Purpose** | Three TypeScript implementations of **`sum_to_n(n)`** (sum 1+2+…+n), with complexity notes (loop, recursion, Gauss formula). |
| **How to run** | TypeScript only — no server or database. |

```bash
npx ts-node --project problem-4/tsconfig.json problem-4/run_example.ts
# or: cd problem-4 && npx ts-node run_example.ts
```

Details: [`problem-4/README.md`](problem-4/README.md).

---

## Problem 5 — `problem-5/`

| | |
|---|---|
| **Purpose** | **REST API** (Express + TypeORM): CRUD **Resources**, pagination/filtering/search, soft delete, Swagger, Jest tests; **SQLite** for easy local runs; optional **Redis** for list caching. |
| **How to run** | Node.js app — install dependencies and start the server. |

```bash
cd problem-5
npm install
cp .env.example .env   # adjust SQLITE_DATABASE, REDIS_URL if needed
npm run dev            # http://localhost:3000 — Swagger: /api-docs
```

Build & test:

```bash
npm run build && npm test
```

Docker (app + Redis, SQLite in a volume):

```bash
docker compose up --build
```

Details: [`problem-5/README.md`](problem-5/README.md).

---

## Problem 6 — `problem-6/`

| | |
|---|---|
| **Purpose** | **Specification** for a **real-time leaderboard** backend module (top 10, `POST /scores`, SSE, JWT, Redis, etc.). Written for a team to implement — **no runnable code** in this folder. |
| **How to use** | Read the documentation; Mermaid diagrams are in the README. |

```bash
# No npm install required — open the Markdown file in your editor or viewer
```

Details: [`problem-6/README.md`](problem-6/README.md).

---

## Summary

| Folder | Type | Main stack |
|--------|------|------------|
| **problem-4** | Algorithms / TS | TypeScript |
| **problem-5** | Production-style API | Express, TypeORM, SQLite, Redis (optional) |
| **problem-6** | Architecture & spec | Markdown, Mermaid |

**Prerequisites:** Node.js 20+ for problem-4 (`ts-node`) and problem-5 (`npm`).

---

## Git hooks (Husky)

After cloning, run at the **repository root**:

```bash
npm install          # installs Husky (git hooks)
cd problem-5 && npm install && cd ..
```

On every **`git commit`**, tests in **`problem-5`** run. If they fail, the commit is **aborted**. Ensure `problem-5/node_modules` exists (second line above).

- Skip hook (not recommended): `git commit --no-verify` or `HUSKY=0 git commit ...`

---

## CI (GitHub Actions)

On **push** or **pull request** to `main`, [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs `npm ci`, `npm run build`, and `npm test` in `problem-5`.

To **block merging** until tests pass:

1. Repo **Settings** → **Branches** → **Add branch protection rule** for `main`.
2. Enable **Require status checks to pass before merging**.
3. Search and select the check named **`Test (problem-5)`** (or **`CI / test`** depending on GitHub UI).
4. (Recommended) **Require a pull request before merging** and disallow direct pushes to `main`.
