# Environment and Git — multi-device checklist

Use this when cloning **`Mobile-Development-2026`** on a new machine. Your copied **`.env`** files are per-app; match them to the sections below.

## Git (mobile)

- **Remote:** `https://github.com/RootRecord/Mobile-Development-2026.git` — branch `main`.
- From repo root: `pnpm install` (workspace).
- **Identity:** `git config user.name` / `user.email` (or `--global`) before committing.

## Cloudflare / Workers (sibling **Web** repo)

Worker source lives in **`Web-Development-2026`** (separate clone), not inside `Mobile/`.

- **Primary API:** `Web/cloudflare/rootrecord-primary` — `npm ci`, `npm run dev`, deploy via `deploy.ps1`.
- **Licence Worker:** `Web/cloudflare/rootrecord-license` — same pattern.
- **Deploy credentials file:** copy `Web/credentials.env.example` → **`credentials.env`** in either:
  - the **Web** repo root (same folder as `cloudflare/`), or
  - any **parent** folder of `cloudflare/rootrecord-primary` (e.g. your overall dev folder if you keep `Web` inside it).

Both `deploy.ps1` scripts **walk up directories** until they find `credentials.env`.

- **Wrangler login:** `npx wrangler login` once per machine (`cd` into the Worker folder first).
- **Local Worker dev:** `Web/cloudflare/rootrecord-primary/.dev.vars.example` → `.dev.vars` in that folder.

## Mobile app env files (copy your `.env` into these paths)

| Area | Path | Template |
|------|------|----------|
| Weather — CRA | `rr-weather-manager-mobile/frontend/.env.local` | `frontend/.env.local.example` |
| Weather — production build | `rr-weather-manager-mobile/frontend/.env.production` | `frontend/.env.production.example` |
| Weather — Python API | `rr-weather-manager-mobile/backend/.env` | `backend/.env.example` |
| Business — CRA | `rootrecord-business-manager-app/frontend/.env.local` | `frontend/.env.example` |
| Business — Python API | `rootrecord-business-manager-app/backend/.env` | `backend/.env.example` |

Production mobile builds default **`https://api.rootrecord.info`**; only set `REACT_APP_BACKEND_URL` when you intentionally point at another host.

## Android (not in Git)

Per app under `frontend/android/`: **`local.properties`**, release **keystore** + **`keystore/keystore.properties`** (Weather). Copy from your old machine if you ship signed builds.

## Optional

- **`Web/solana/solanasite/.env.example`** — Next/Vercel and server keys for the Solana site.
- **`Web/solana/HELE/.env`** — local only; gitignored.
