<!--
Project: employee-management-portal (HR)
Purpose: Provide concise, actionable guidance for AI coding agents working in this repository.
-->

# Copilot / AI Agent Instructions (concise)

Work summary
- This repo is a Vite + React frontend (TypeScript/TSX under `components/`) and a small Express.js backend (`server.js`) that exposes a simple PostgreSQL-backed API. Frontend calls the backend at `/api/*` using `services/api.ts`.

Key files & dirs
- `server.js`: single-file Express server; exposes generic CRUD endpoints under `/api/:table`, a `/api/search` helper, and `/api/health` health-check. Uses `pg` Pool with `DATABASE_URL` or `PG*` env vars.
- `services/api.ts`: frontend HTTP helper; most frontend code uses `api.get('employees')`, `api.create(...)`, etc. `getApiUrl()` expects backend on port `3001` by default.
- `components/`: React views (TSX) — `EmployeeList.tsx`, `AddEmployee.tsx`, etc. Use these as examples for UI patterns and API usage.
- `src/config/database.config.ts`: central place for DB and runtime config used by other modules.
- `database_schema_postgresql.sql`, `SETUP_LOCAL_DATABASE.md`, `README_DATABASE.md`: authoritative DB schema and local setup steps.
- `types.ts`: shared TypeScript types used throughout the frontend.
- `package.json`: scripts — `npm run dev` (frontend), `npm run build`, `npm run preview`, `npm run server` (start Express backend).

Architecture notes (what matters)
- The backend is minimal and intentionally generic: routes like `/api/:table` dynamically construct SQL queries. When modifying or adding endpoints, be mindful of SQL injection risk and reuse the `pg` parameterized queries pattern seen in `server.js`.
- Frontend ↔ Backend: The frontend expects a JSON REST interface (list endpoints, single record by id, create, update, delete). Search uses `/api/search?query=...` and returns per-table arrays.
- Environment-driven configuration: runtime behaviour relies on env vars: `DATABASE_URL` (preferred), `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `VITE_API_URL`, `VITE_APP_NAME`, and `GEMINI_API_KEY` (per README). Set these in your local `.env` or Windows environment when running.

Developer workflows (quick commands)
- Install: `npm install`
- Run frontend (dev): `npm run dev` (Vite; default port 5173)
- Run backend: `npm run server` (starts `server.js` on `PORT` or `3001`)
- Build frontend for production: `npm run build` then `npm run preview` to serve the built app.
- Local development typically requires two terminals: one for the frontend and one for the backend. The frontend `services/api.ts` defaults to `http://localhost:3001/api`.

Patterns & conventions (project-specific)
- Generic table endpoints: use table names (e.g., `employees`, `departments`) directly in the path. Frontend code uses strings like `api.get('employees')` and `api.create('employees', data)`.
- Health checks: prefer calling `/api/health` for quick availability checks (`services/api.ts` includes `checkConnection`).
- DB-first changes: when adding or changing data models, update `database_schema_postgresql.sql` and the `SETUP_LOCAL_DATABASE.md` instructions. There is no ORM — SQL schema and raw queries are authoritative.
- Mixed JS/TS: frontend is TypeScript; backend is plain ESM JavaScript (`server.js`). Be careful when importing or moving backend code to TypeScript — update `package.json` and build process if converting.

What to watch for (gotchas)
- Dynamic SQL in `server.js` interpolates table names directly. If adding endpoints that accept table identifiers, follow existing patterns and prefer explicit queries or validation to avoid SQL injection.
- Environment variables control both frontend and backend. The frontend reads `VITE_*` variables at build time; to change `VITE_API_URL` for dev, set it before `npm run dev`.
- No automated tests detected — run manual checks after changes. Use `server.js` logs (development mode prints requests) and `/api/health`.

Examples (copy/paste style)
- Call employees from frontend: `const employees = await api.getEmployees();` or `await api.get('employees')`.
- Start backend separately: `npm run server` (then visit `http://localhost:3001/api/health`).
- Add a new table-CRUD consumer: update `database_schema_postgresql.sql`, run the DB migration, then use `api.get('<new_table>')` in components.

If unsure, inspect these files first: `server.js`, `services/api.ts`, `database_schema_postgresql.sql`, `SETUP_LOCAL_DATABASE.md`, `components/EmployeeList.tsx`, `types.ts`.

If you have questions about missing runtime details, ask for:
- the repo owner's intended database seeding steps, or
- local `.env` example with `DATABASE_URL` and `VITE_API_URL` values.

End of file.
