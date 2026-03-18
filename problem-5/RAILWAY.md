# Deploy problem-5 on Railway

This guide deploys the **Resources API** (Express + TypeORM + SQLite) to [Railway](https://railway.app).

---

## 1. Prerequisites

- GitHub repo with this project (or GitLab / connect repo to Railway).
- Railway account.

---

## 2. Create the service

1. In Railway: **New Project** → **Deploy from GitHub repo** (or empty project → **GitHub Repo**).
2. Select your repository.
3. **Important — Root Directory:** open the service **Settings** → set **Root Directory** to:

   ```text
   problem-5
   ```

   (If the repo root is only `problem-5`, leave root empty.)

4. Railway will detect Node and run **`npm install`** and **`npm run build`** (from `package.json`), then start with **`node dist/server.js`** (see `railway.toml`).

---

## 3. Environment variables

Add these in the service **Variables** tab:

| Variable | Value | Notes |
|----------|--------|--------|
| `NODE_ENV` | `production` | Normal for deploy |
| `PORT` | *(leave unset)* | Railway injects `PORT` automatically |
| `DB_SYNCHRONIZE` | `true` | **Required** for SQLite on Railway until you add migrations. Creates tables on startup. |
| `SQLITE_DATABASE` | `/app/data/app.sqlite` | Stable path inside the container |
| `LOG_LEVEL` | `combined` | Optional; nicer logs in prod |
| `REDIS_URL` | *(optional)* | Add [Railway Redis](https://docs.railway.app/databases/redis) plugin and paste its `REDIS_URL` for list caching |

**Do not** set `PORT` manually unless you know what you’re doing — Railway assigns it and exposes your app on the public URL.

---

## 4. Persist SQLite (recommended)

Without a volume, the SQLite file lives on ephemeral disk and **data is lost on redeploy**.

1. Service → **Volumes** → **Add volume**.
2. **Mount path:** `/app/data`
3. Keep `SQLITE_DATABASE=/app/data/app.sqlite`.

After redeploys, data persists on the volume.

---

## 5. Generate domain

1. **Settings** → **Networking** → **Generate Domain**.
2. Open `https://<your-app>.up.railway.app/health` — expect `{"status":"ok"}`.
3. Swagger: `https://<your-app>.up.railway.app/api-docs`

---

## 6. Optional: Redis

1. In the project: **New** → **Database** → **Redis**.
2. Copy the **Redis URL** (internal) into your app service as `REDIS_URL`.
3. Redeploy the app service so it picks up the variable.

---

## 7. Troubleshooting

| Issue | Fix |
|-------|-----|
| App crashes on start, DB errors | Set `DB_SYNCHRONIZE=true` for first run with SQLite. |
| Empty DB after deploy | Add volume on `/app/data` and `SQLITE_DATABASE=/app/data/app.sqlite`. |
| Build fails (native module) | Nixpacks usually builds `better-sqlite3` on Linux. If it fails, try **Dockerfile** deploy (see below). |
| 404 on root | API is at `/health`, `/api-docs`, `/api/v1/resources` — no route on `/`. |

---

## 8. Deploy with Dockerfile (alternative)

If Nixpacks fails to compile `better-sqlite3`:

1. Settings → switch builder to **Dockerfile** (path `Dockerfile` inside `problem-5`).
2. Ensure volume `/app/data` + env as above.
3. Dockerfile already uses Node 20 Alpine with build tools for SQLite.

---

## Security note

`DB_SYNCHRONIZE=true` in production is convenient for demos but **not ideal** for serious production (schema drift risk). Long term: add TypeORM migrations and set `DB_SYNCHRONIZE=false`.
