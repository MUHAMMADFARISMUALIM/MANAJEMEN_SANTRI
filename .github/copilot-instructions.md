# Copilot instructions for this repository

## Project shape
- This is a full-stack app with a Node.js/Express API and a vanilla HTML/CSS/JS frontend; there is no React/Vue build step.
- `server.js` is the entry point: it mounts `/api/*` routes and serves static files from `public/` plus uploaded files from `uploads/`.
- Backend logic lives in `routes/*.js`; each route does direct MySQL queries and returns `{ success, data, message }` JSON.
- Frontend logic lives in `public/js/*.js`; pages are plain static HTML and the app uses `fetch()` to the API via `public/js/config.js`.

## Key patterns to follow
- Use `verifyToken` and optional `checkRole(...)` from `middleware/auth.js` on protected endpoints.
- Follow the existing route style in `routes/auth.js`, `routes/santri.js`, and `routes/users.js`: validate input, query MySQL, log to `activity_log`, then return a standard JSON response.
- Keep DB access centralized in `database/connection.js`; it sets `dateStrings: true` to preserve `YYYY-MM-DD` strings and avoid timezone/date-shift bugs.
- Keep date display logic in `public/js/utils.js`; this repo intentionally converts DB dates to `DD/MM/YYYY` for UI and back to `YYYY-MM-DD` for `<input type="date">`.
- Role-based access is real and important: `admin`, `pengasuh`, `ustadz`, `ustadzah` are the canonical values used throughout the app.

## Data flow / architecture
- Login happens via `POST /api/auth/login`; JWT payload includes `id`, `username`, `role`, and `nama_lengkap`.
- The browser stores the token and user in `localStorage` using helpers in `public/js/config.js` and redirects based on role in `public/js/auth.js`.
- CRUD for santri/perizinan/pelanggaran/pembinaan is split by feature under `routes/` and corresponding pages under `public/` (for example `santri.html` + `public/js/santri.js`).
- Uploaded files are handled with `middleware/upload.js` and saved under `uploads/`; valid extensions include image types and PDF.

## Local dev workflow
- Install deps: `npm install`
- Start server: `npm start`
- Dev server: `npm run dev` (nodemon)
- Default runtime is `http://localhost:3000`; the app expects a MySQL database named `manajemen_asrama` via `.env`.
- Copy `.env.example` to `.env` and set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`.

## Project-specific conventions
- Prefer Indonesian status/field names (for example `status`, `nama_kamar`, `tanggal_lahir`, `tanggal_masuk`) and keep API responses in Indonesian messages.
- Do not introduce a framework or a new build system; this repo is intentionally plain HTML/CSS/JS.
- Maintain consistent success/error payloads: `success: true|false`, `message`, and `data` when relevant.
- Use direct SQL with parameterized queries; avoid string interpolation for user inputs.
- Maintenance scripts in `scripts/` are part of the workflow (`seed-data.js`, `fix-asrama.js`, `fix-kamar-nohp.js`, `fix-password.js`).

## Examples to mirror
- `routes/auth.js` for JWT login/profile/logout flow
- `routes/santri.js` for multipart upload + role-gated CRUD
- `public/js/utils.js` for date formatting and shared UI helpers
- `database/connection.js` for DB config and date handling
- `docs/INSTALASI.md` and `QUICK_START.md` for environment and recovery steps
