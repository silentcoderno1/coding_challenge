# Resources API

REST API quản lý **Resources** (Express + TypeORM + **SQLite**). CRUD, phân trang, lọc, soft delete, cache Redis (tùy chọn), Swagger. **Không cần cài PostgreSQL** — chỉ cần Node.js là chạy được.

---

## Overview

- **API:** `/api/v1/resources` (CRUD + list có `page`, `limit`, `status`, `search`, `sort`)
- **Database:** **SQLite** (file `data/app.sqlite` mặc định) — tự tạo file và thư mục khi chạy
- **Cache:** Redis tùy chọn (`REDIS_URL` rỗng = tắt cache)
- **Docs:** Swagger UI tại `/api-docs`

Response: `{ success, data, message? }` hoặc lỗi `{ success: false, message }`.

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

Luồng: **HTTP** → controllers → services → **SQLite** (repository) + Redis (cache list, optional).

```
routes → controllers → middlewares → ResourceService → ResourceRepository (TypeORM + SQLite)
```

---

## Setup nhanh (local)

### Yêu cầu

- **Node.js 20+**  
- **Redis:** chỉ khi bật cache (có thể bỏ qua)

### 1. Cài đặt

```bash
cd problem-5
npm install
cp .env.example .env
```

### 2. Biến môi trường (`.env`)

| Variable | Mặc định | Mô tả |
|----------|----------|--------|
| `NODE_ENV` | development | `development` → TypeORM `synchronize: true` (tạo bảng tự động) |
| `PORT` | 3000 | Cổng server |
| `LOG_LEVEL` | dev | Morgan: `dev` \| `combined` |
| **`SQLITE_DATABASE`** | `data/app.sqlite` | Đường dẫn file SQLite (tương đối project root hoặc absolute) |
| `REDIS_URL` | (rỗng) | Ví dụ `redis://localhost:6379` — để trống = không cache list |

**Không cần tạo database trước:** thư mục `data/` và file `.sqlite` được tạo khi start server (dev).

### 3. Chạy

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

Với `NODE_ENV=production`, TypeORM **không** synchronize — cần migrations để tạo schema (hoặc tạo DB một lần bằng dev rồi copy file SQLite).

---

## Docker Compose

Chạy app + Redis; SQLite lưu trong volume `sqlite_data` (persist tại `/app/data` trong container).

```bash
docker compose up --build
```

- App: http://localhost:3000  
- Redis: localhost:6379  
- **Không còn service PostgreSQL** — chỉ SQLite + Redis.

Image Alpine cần build native cho `better-sqlite3` (Dockerfile đã cài `python3`, `make`, `g++`).

---

## Tests

```bash
npm test
```

Integration test dùng `FakeResourceRepository` — **không** cần SQLite/Redis khi chạy test.

---

## API (tóm tắt)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/health` | Health check |
| GET | `/api/v1/resources` | List (pagination, `status`, `search` case-insensitive, `sort`) |
| POST | `/api/v1/resources` | Tạo |
| GET | `/api/v1/resources/:id` | Chi tiết |
| PUT | `/api/v1/resources/:id` | Cập nhật |
| DELETE | `/api/v1/resources/:id` | Soft delete |

Chi tiết và ví dụ: **Swagger UI** (`/api-docs`).

---

## Design Decisions

### SQLite thay PostgreSQL

- **Chạy tiện:** không cài server DB; một file `.sqlite` cho dev/local.
- **TypeORM:** `better-sqlite3` driver; entity dùng `simple-enum` cho `status` (tương thích SQLite).
- **Search:** `LOWER(name) LIKE LOWER(:pattern)` thay cho `ILIKE` (PostgreSQL-only).

### Redis

- Vẫn tùy chọn: list GET cache + invalidate khi ghi. Không set `REDIS_URL` vẫn chạy đầy đủ CRUD.

### Soft delete & testability

- Giữ nguyên: `@DeleteDateColumn`, `IResourceRepository`, `createApp({ repository, cache })` cho test.

---

## Lưu ý

- **Backup:** copy file `SQLITE_DATABASE` (ví dụ `data/app.sqlite`).
- **Concurrent writes:** SQLite phù hợp dev/small traffic; traffic lớn nên cân nhắc PostgreSQL/MySQL.
- **`.gitignore`:** thư mục `data/` và `*.sqlite` để không commit DB local (tùy team có thể bỏ ignore nếu cần).
