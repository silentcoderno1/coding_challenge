# Resources API

REST API for **Resources** (Express + TypeORM + **SQLite**). CRUD, pagination, filtering, soft delete, optional Redis caching, Swagger. **No PostgreSQL required** — Node.js is enough to run locally.

---

## Overview

- **API:** `/api/v1/resources` (CRUD + list with `page`, `limit`, `status`, `search`, `sort`)
- **Database:** **SQLite** (default file `data/app.sqlite`) — file and parent directory are created on startup
- **Cache:** Optional Redis (`REDIS_URL` empty = caching disabled)
- **Docs:** Swagger UI at `/api-docs`

Responses: `{ success, data, message? }` on success, or `{ success: false, message }` on error.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20 |
| Framework | Express.js |
| ORM | TypeORM |
| **Database** | **SQLite** (`better-sqlite3`) |
| Cache | Redis (ioredis), optional |
| Validation | class-validator, class-transformer |
| Docs | OpenAPI 3, Swagger UI |
| Logging | Winston |
| Tests | Jest, Supertest |

---

## Architecture

Flow: **HTTP** → controllers → services → **SQLite** (repository) + Redis (optional list cache).

```
routes → controllers → middlewares → ResourceService → ResourceRepository (TypeORM + SQLite)
```

---

## Quick setup (local)

### Prerequisites

- **Node.js 20+**
- **Redis:** only if you enable caching (can be skipped)

### 1. Install

```bash
cd problem-5
npm install
cp .env.example .env
```

### 2. Environment (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | In `development`, TypeORM uses `synchronize: true` (auto schema) |
| `PORT` | 3000 | Server port |
| `LOG_LEVEL` | dev | Morgan: `dev` \| `combined` |
| **`SQLITE_DATABASE`** | `data/app.sqlite` | SQLite file path (relative to project root or absolute) |
| `REDIS_URL` | (empty) | e.g. `redis://localhost:6379` — leave empty to disable list cache |

**No manual DB creation:** the `data/` folder and `.sqlite` file are created when you start the server (dev).

### 3. Run

```bash
npm run dev
```

- API: http://localhost:3000  
- Swagger: http://localhost:3000/api-docs  
- Health: http://localhost:3000/health  

**Production build:**

```bash
npm run build
npm start
```

With `NODE_ENV=production`, TypeORM **does not** synchronize — use migrations for schema (or bootstrap once in dev and copy the SQLite file).

---

## Docker Compose

Runs app + Redis; SQLite is stored in volume `sqlite_data` (persisted at `/app/data` in the container).

```bash
docker compose up --build
```

- App: http://localhost:3000  
- Redis: localhost:6379  
- **No PostgreSQL service** — SQLite + Redis only.

The Alpine image builds native `better-sqlite3` (Dockerfile installs `python3`, `make`, `g++`).

---

## Tests

```bash
npm test
```

Integration tests use `FakeResourceRepository` — **no** SQLite or Redis required to run tests.

---

## API (summary)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/resources` | List (pagination, `status`, case-insensitive `search`, `sort`) |
| POST | `/api/v1/resources` | Create |
| GET | `/api/v1/resources/:id` | Get one |
| PUT | `/api/v1/resources/:id` | Update |
| DELETE | `/api/v1/resources/:id` | Soft delete |

Details and examples: **Swagger UI** (`/api-docs`).

---

## Design decisions

### SQLite instead of PostgreSQL

- **Convenience:** no separate DB server; one `.sqlite` file for dev/local.
- **TypeORM:** `better-sqlite3` driver; entity uses `simple-enum` for `status` (SQLite-friendly).
- **Search:** `LOWER(name) LIKE LOWER(:pattern)` instead of PostgreSQL-only `ILIKE`.

### Redis

- Still optional: caches list GET responses and invalidates on writes. Full CRUD works without `REDIS_URL`.

### Soft delete & testability

- Unchanged: `@DeleteDateColumn`, `IResourceRepository`, `createApp({ repository, cache })` for tests.

---

## Notes

- **Backup:** copy the `SQLITE_DATABASE` file (e.g. `data/app.sqlite`).
- **Concurrent writes:** SQLite suits dev/small traffic; for heavy load consider PostgreSQL/MySQL.
- **`.gitignore`:** `data/` and `*.sqlite` exclude local DB from commits (adjust per team policy).
