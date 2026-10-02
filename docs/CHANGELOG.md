# CRM nErgy — Backend Changelog

All notable technical updates to the CRM nErgy backend service will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-09-30

### Added
- Implemented complete JWT authentication engine with `bcryptjs` password hashing and token expiration.
- Implemented `authenticateToken` and `authorizeRoles` middlewares with tenant isolation and 12-role RBAC hierarchy.
- Built and mounted REST API suites:
  - `/api/auth` (`register`, `login`, `me`, `logout`)
  - `/api/leads` (CRUD + conversion)
  - `/api/contacts` (CRUD + bulk delete)
  - `/api/deals` (CRUD + pipeline stages)
  - `/api/tasks` (CRUD + status toggles)
  - `/api/notes` (contextual notes)
  - `/api/activities` (audit timeline)
  - `/api/users` (team directory)
- Created database seed script `prisma/seed.js` with demo tenant and records.
- Built frontend API client (`apiClient.js`), `authService.js`, and `crmService.js`.
- Integrated frontend `AuthContext.jsx`, `CrmContext.jsx`, `CrmLogin.jsx`, and `CrmSignup.jsx` with live backend endpoints.

---

## [0.3.0] - 2026-09-30

### Added
- Executed initial baseline migration `20260930053733_init_crm_schema`.
- Provisioned 8 relational MySQL tables and 1 migration tracker table in `crm-db`:
  - `tenants`, `users`, `leads`, `contacts`, `deals`, `tasks`, `notes`, `activities`, `_prisma_migrations`.
- Generated type-safe `@prisma/client` v6.4.1 runtime bindings.
- Verified relational foreign keys, cascade triggers, and compound indexes.

---

## [0.2.1] - 2026-09-29

### Added
- Created comprehensive engineering documentation suite inside `backend/docs/`:
  - `README.md`: Central documentation hub and guidelines
  - `PROJECT_OVERVIEW.md`: High-level business goals, core domains, and status matrix
  - `ARCHITECTURE.md`: Layering responsibilities, directory roles, and sequence diagrams
  - `DATABASE.md`: MySQL persistence rules, planned models, and migration policies
  - `API_DOCUMENTATION.md`: Active and planned endpoint contracts and response envelopes
  - `AUTHENTICATION.md`: JWT token lifecycle, password hashing, and middleware guards
  - `RBAC.md`: Role hierarchy, permissions matrix, and role authorization design
  - `MULTI_TENANCY.md`: Shared schema isolation strategy, context injection, and indexing
  - `SECURITY.md`: Defense-in-depth security policies, CORS rules, and error masking
  - `DEVELOPMENT_SETUP.md`: Step-by-step developer onboarding and troubleshooting guide
  - `TESTING.md`: Unit, integration, and E2E testing strategies and blueprints
  - `DEPLOYMENT.md`: Production checklist, PM2 clustering, and Nginx reverse proxy configs
  - `BACKEND_PROGRESS.md`: Step-by-step progress tracking across all 7 roadmap milestones
  - `CHANGELOG.md`: Detailed release log of backend modifications
- Created project root `backend/README.md` with quickstart instructions and doc index.

---

## [0.2.0] - 2026-09-29

### Added
- Installed Prisma ORM `6.4.1` as development dependency.
- Installed `@prisma/client` `6.4.1` as production runtime dependency.
- Initialized `prisma/schema.prisma` configured with:
  - Generator: `prisma-client-js`
  - Datasource: `mysql` referencing `DATABASE_URL` from `.env`.
- Added Prisma scripts to `package.json`:
  - `"prisma:generate": "prisma generate"`
  - `"prisma:validate": "prisma validate"`
  - `"prisma:studio": "prisma studio"`
- Configured safe `DATABASE_URL` placeholder in `.env` and `.env.example`.
- Verified TCP connectivity to local MySQL service on port `3306`.
- Confirmed `npx prisma validate` runs and validates schema successfully.

### Security
- Verified `.env` is ignored by `.gitignore`.
- Confirmed zero destructive database commands executed (no migrations run yet).

---

## [0.1.0] - 2026-09-29

### Added
- Initialized Node.js backend environment with `package.json`.
- Installed dependencies: `express` (`^5.2.1`), `cors` (`^2.8.6`), `dotenv` (`^18.0.4`).
- Installed developer dependency: `nodemon` (`^3.1.14`).
- Created modular folder layout:
  - `src/config/`
  - `src/controllers/`
  - `src/middleware/`
  - `src/routes/`
  - `src/services/`
  - `src/validators/`
  - `src/utils/`
- Implemented `src/app.js` with JSON body parser, URL-encoded parser, and CORS middleware.
- Created `GET /api/health` returning `{ "success": true, "message": "CRM nErgy API is running" }`.
- Implemented centralized error handler and 404 route handler in `src/middleware/errorHandler.js`.
- Implemented `src/server.js` listening on configurable `PORT` (default 5000) with error event handling.
- Configured npm scripts:
  - `"dev": "nodemon src/server.js"`
  - `"start": "node src/server.js"`
- Verified HTTP 200 response on health check endpoint.
