# Resources API

A production-ready REST API for managing **Resources**, built with Express.js and TypeScript. It provides full CRUD with pagination, filtering, soft delete, Redis caching, and OpenAPI documentation.

---

## Overview

This service exposes a versioned API (`/api/v1/resources`) with:

- **CRUD** — Create, read, update, and soft-delete resources
- **List** — Pagination (`page`, `limit`), filter by `status`, search by `name` (ILIKE), sort by `createdAt`
- **Validation** — Request validation via DTOs (class-validator) with clear error responses
- **Caching** — Optional Redis caching for list endpoint; cache invalidated on writes
- **Documentation** — Interactive Swagger UI at `/api-docs`
- **Observability** — Winston logging (requests, errors, duration), structured error handling

All responses use a consistent envelope: `{ success, data, message? }` for success, and `{ success: false, message }` for errors.

---

## Tech Stack

| Layer        | Technology |
|-------------|------------|
| **Runtime** | Node.js 20 |
| **Language**| TypeScript (strict) |
| **Framework** | Express.js |
| **ORM**     | TypeORM |
| **Database**| PostgreSQL |
| **Cache**   | Redis (ioredis), optional |
| **Validation** | class-validator, class-transformer |
| **API Docs**| OpenAPI 3, Swagger UI |
| **Logging** | Winston |
| **Testing** | Jest, Supertest |

---

## Architecture

### Layered structure

The codebase follows a **clean architecture** style with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│  HTTP (Express)                                             │
│  routes → controllers → middlewares (validation, error)     │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Application (services)                                     │
│  ResourceService: orchestration, cache invalidation, errors│
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Data (repositories, cache)                                  │
│  IResourceRepository → ResourceRepository (TypeORM)          │
│  IResourceListCache → ResourceListCache (Redis, optional)   │
└─────────────────────────────────────────────────────────────┘
```

- **Controllers** — Handle HTTP (parse query/body, call service, send response). No business logic.
- **Services** — Business rules, throw domain errors (e.g. `NotFoundError`), delegate to repository and cache.
- **Repositories** — Data access only. TypeORM `Repository<Resource>` with QueryBuilder; soft delete via `@DeleteDateColumn` and `softDelete()`.
- **Cache** — List results keyed by query; invalidate on create/update/delete.

### Project structure

```
src/
├── config/           # env, TypeORM DataSource, Redis client, logger, Swagger spec
├── entities/         # TypeORM entities (Resource)
├── dtos/             # Request/response DTOs + class-validator
├── repositories/     # IResourceRepository + ResourceRepository (TypeORM)
├── cache/            # IResourceListCache + ResourceListCache (Redis)
├── services/         # ResourceService
├── controllers/      # ResourceController
├── routes/           # Route registration, resource routes
├── middlewares/      # validation, error handler, not-found, request logger
├── errors/           # AppError, NotFoundError, ValidationError
├── utils/            # response helpers, asyncHandler
├── app.ts            # Express app factory (composition root)
├── server.ts         # Bootstrap: load env, init DB, start server
└── __tests__/        # Unit (service + mocks), integration (API + fake repo)
```

### Request flow

1. **Request** → helmet, cors, request logger, morgan, `express.json()`
2. **Route** → `validateBody(Dto)` (if applicable) → controller method
3. **Controller** → map query/body → `resourceService.*` → format response
4. **Service** → cache (for list), repository, domain errors
5. **Errors** → Global error handler maps to `{ success: false, message }` and status code

---

## Setup Guide

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 16+ (or use Docker)
- **Redis** 7+ (optional; omit `REDIS_URL` to disable caching)

### 1. Clone and install

```bash
cd problem-5
npm install
```

### 2. Environment

Copy the example env and set your values:

```bash
cp .env.example .env
```

| Variable     | Default     | Description |
|-------------|-------------|-------------|
| `NODE_ENV`  | development | `development` \| `production` |
| `PORT`      | 3000        | Server port |
| `LOG_LEVEL` | dev         | Morgan format: `dev` \| `combined` |
| `DB_HOST`   | localhost   | PostgreSQL host |
| `DB_PORT`   | 5432        | PostgreSQL port |
| `DB_USERNAME` | postgres | Database user |
| `DB_PASSWORD` | postgres | Database password |
| `DB_NAME`   | app_db      | Database name |
| `REDIS_URL` | (empty)     | e.g. `redis://localhost:6379` — leave empty to disable cache |

Ensure the database exists (e.g. `createdb app_db`).

### 3. Run locally

**Development (watch):**

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

- API: **http://localhost:3000**
- Swagger: **http://localhost:3000/api-docs**
- Health: **http://localhost:3000/health**

### 4. Docker Compose

Run app, PostgreSQL, and Redis together (TypeORM connects to the `postgres` service):

```bash
docker compose up --build
```

- **app** — http://localhost:3000 (env set in `docker-compose.yml`: `DB_HOST=postgres`, `REDIS_URL=redis://redis:6379`)
- **postgres** — localhost:5432 (user `postgres`, password `postgres`, db `app_db`)
- **redis** — localhost:6379

The app starts only after Postgres and Redis report healthy.

### 5. Tests

```bash
npm test
```

- **Unit** — `ResourceService` with mocked repository and cache (Jest).
- **Integration** — Full HTTP API via Supertest; app created with `FakeResourceRepository` and no Redis, so no real DB/cache required.

---

## API Documentation

### Base URL

- Local: `http://localhost:3000`
- API prefix: `/api/v1`

### Interactive docs

Open **http://localhost:3000/api-docs** for Swagger UI (request/response examples, try-it-out).

### Endpoints summary

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Health check. Returns `{ status: "ok" }`. |
| `GET`  | `/api/v1/resources` | List resources (paginated, filterable, sortable). |
| `POST` | `/api/v1/resources` | Create a resource. Body: `name` (required), `description?`, `status?`. |
| `GET`  | `/api/v1/resources/:id` | Get one resource by ID. |
| `PUT`  | `/api/v1/resources/:id` | Update a resource (partial). |
| `DELETE` | `/api/v1/resources/:id` | Soft-delete a resource. |

### List query parameters

| Param   | Type   | Default | Description |
|---------|--------|---------|-------------|
| `page`  | number | 1       | Page number. |
| `limit` | number | 20      | Page size (max 100). |
| `status`| string | —       | `active` \| `inactive`. |
| `search`| string | —       | Filter by name (ILIKE). |
| `sort`  | string | `desc`  | Sort by `createdAt`: `asc` \| `desc`. |

### Response shapes

**Success (create / get one / update):**

```json
{
  "success": true,
  "data": { "id": "...", "name": "...", "description": "...", "status": "active", "created_at": "...", "updated_at": "...", "deleted_at": null },
  "message": "Resource created"
}
```

**List:**

```json
{
  "data": [ { "id": "...", "name": "...", ... } ],
  "meta": { "total": 42, "page": 1, "limit": 20 }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Resource with id 'x' not found"
}
```

Validation errors return `400` with `message` describing the first failing constraints.

---

## Design Decisions

### Clean architecture and testability

- **`IResourceRepository`** — Service depends on an interface, not the TypeORM implementation. Unit tests use a mock; integration tests use `FakeResourceRepository` (in-memory) so no database is required.
- **`createApp(options?)`** — Accepts optional `repository` and `cache`. Production uses real implementations; tests inject fakes so the same app is exercised end-to-end without DB/Redis.

### Validation and errors

- **DTOs + class-validator** — Request bodies are validated via `CreateResourceDto` / `UpdateResourceDto`. Invalid payloads are turned into `ValidationError` and handled by the global error middleware.
- **Custom errors** — `AppError` (with `statusCode`), `NotFoundError` (404), `ValidationError` (400). The error handler maps them to a single JSON shape `{ success: false, message }` and logs appropriately.

### Persistence and soft delete

- **TypeORM** — Single `Resource` entity; PostgreSQL with synchronize in development only. Production should use migrations.
- **Soft delete** — `@DeleteDateColumn("deleted_at")`; list and get-by-id exclude deleted rows. Delete operation uses TypeORM `softDelete()`. Use `withDeleted()` only when you need to see or restore deleted rows.

### Caching

- **Redis** — Optional. When `REDIS_URL` is set, list results are cached per query (key from pagination + filters + sort). TTL 60s. Create/update/delete invalidate all list cache keys so the next list is fresh.
- **Graceful degradation** — If Redis is missing or down, the app skips cache and still works.

### Logging and security

- **Winston** — Request (method, url, ip), completion (status, duration), and errors. Level and format depend on `NODE_ENV`.
- **Helmet** — Security headers. CORS enabled. No auth in this repo; add middleware as needed.

### API design

- **Versioned prefix** — `/api/v1` to allow future breaking changes under a new version.
- **Consistent envelope** — Success and error responses share the same structure so clients can handle them uniformly.
- **OpenAPI** — Spec and examples live in `src/config/swagger.ts`; Swagger UI serves them at `/api-docs`.
