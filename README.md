# Backend Coding Challenge — Overview

This repository contains **three parts** (one folder per problem). Each folder has its own README with more detail.

---

## Problem 4 — `problem-4/`

| | |
|---|---|
| **Purpose** | Three TypeScript implementations of **`sum_to_n(n)`** (sum 1+2+…+n), with complexity notes (loop, recursion, Gauss formula). |
| **How to run** | TypeScript only — no server or database. |

```bash
cd problem-4
npx ts-node run_example.ts
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

**Railway:** set service root to `problem-5`, then follow [`problem-5/RAILWAY.md`](problem-5/RAILWAY.md).

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
