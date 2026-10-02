# CRM nErgy — Backend Engine

> High-performance, scalable Node.js + Express + Prisma ORM RESTful API engine for the CRM nErgy platform.

---

## 📌 Project Status

**Current Status:** Under Active Development (Foundation Phase Completed)  
- **Step 1 — Node + Express Base:** ✅ Completed  
- **Step 2 — Prisma + MySQL Setup:** ✅ Completed  
- **Step 3 — CRM Data Modeling:** ⏳ Next Phase  
- **Step 4 — Migrations & Seeding:** ⏳ Pending  
- **Step 5 — Auth & RBAC:** ⏳ Pending  
- **Step 6 — Business APIs:** ⏳ Pending  

---

## 🛠 Technology Stack

| Layer | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | `>= 20.x` | JavaScript runtime environment |
| **Framework** | Express.js | `^5.2.1` | Minimalist web application framework |
| **ORM** | Prisma ORM | `^6.4.1` | Next-generation type-safe database toolkit |
| **Client** | `@prisma/client` | `^6.4.1` | Auto-generated query builder |
| **Database** | MySQL / MariaDB | `>= 8.0 / 10.4+` | Relational multi-tenant persistent datastore |
| **Configuration**| `dotenv` | `^18.0.4` | Environment variable management |
| **CORS** | `cors` | `^2.8.6` | Cross-Origin Resource Sharing middleware |
| **Dev Server** | `nodemon` | `^3.1.14` | Hot-reloading development server |

---

## 📁 Repository Structure

```text
backend/
├── prisma/
│   └── schema.prisma         # Prisma schema and datasource configuration
├── src/
│   ├── config/               # Environment & database client configurations
│   ├── controllers/          # HTTP request handlers & controller logic
│   ├── middleware/           # Error handlers, auth, validation, CORS
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic & database operations
│   ├── validators/           # Request input validation schemas
│   ├── utils/                # Helper utilities and shared functions
│   ├── app.js                # Express app initialization & middleware stack
│   └── server.js             # HTTP server entrypoint & lifecycle management
├── docs/                     # Comprehensive engineering documentation
├── .env                      # Local environment secrets (gitignored)
├── .env.example              # Template environment variables
├── .gitignore                # Source control ignore rules
├── package.json              # Project manifest and scripts
└── README.md                 # Project root README
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v20 or v24 installed
- **MySQL / MariaDB**: Server active on port `3306`
- **npm**: Package manager (bundled with Node.js)

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and configure your local credentials:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://root@localhost:3306/crm-db"
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 4. Validate Prisma Configuration
```bash
npm run prisma:validate
```

### 5. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

---

## 🩺 Health Check Endpoint

- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "success": true,
  "message": "CRM nErgy API is running"
}
```

---

## 📜 Available NPM Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `nodemon src/server.js` | Runs dev server with live auto-reloading |
| `npm start` | `node src/server.js` | Runs production server entrypoint |
| `npm run prisma:validate` | `prisma validate` | Validates `schema.prisma` syntax and rules |
| `npm run prisma:generate` | `prisma generate` | Generates type-safe Prisma client code |
| `npm run prisma:studio` | `prisma studio` | Opens Prisma GUI browser at `localhost:5555` |

---

## 📚 Documentation Index

All architectural and engineering specifications are located in the [docs/](file:///d:/Kiaan/crm/backend/docs) directory:

1. [docs/README.md](file:///d:/Kiaan/crm/backend/docs/README.md) — Documentation index & guidelines
2. [docs/PROJECT_OVERVIEW.md](file:///d:/Kiaan/crm/backend/docs/PROJECT_OVERVIEW.md) — Scope, domains, and feature completion status
3. [docs/ARCHITECTURE.md](file:///d:/Kiaan/crm/backend/docs/ARCHITECTURE.md) — System architecture, layering & request lifecycle
4. [docs/DATABASE.md](file:///d:/Kiaan/crm/backend/docs/DATABASE.md) — Database schema strategy, conventions & ORM rules
5. [docs/API_DOCUMENTATION.md](file:///d:/Kiaan/crm/backend/docs/API_DOCUMENTATION.md) — API endpoints, contracts, and error structures
6. [docs/AUTHENTICATION.md](file:///d:/Kiaan/crm/backend/docs/AUTHENTICATION.md) — JWT auth lifecycle, token handling & password hashing
7. [docs/RBAC.md](file:///d:/Kiaan/crm/backend/docs/RBAC.md) — Role-based access control and permissions matrix
8. [docs/MULTI_TENANCY.md](file:///d:/Kiaan/crm/backend/docs/MULTI_TENANCY.md) — Multi-tenant architecture and tenant isolation
9. [docs/SECURITY.md](file:///d:/Kiaan/crm/backend/docs/SECURITY.md) — Security policies, validation, sanitization & headers
10. [docs/DEVELOPMENT_SETUP.md](file:///d:/Kiaan/crm/backend/docs/DEVELOPMENT_SETUP.md) — Step-by-step developer onboarding
11. [docs/TESTING.md](file:///d:/Kiaan/crm/backend/docs/TESTING.md) — Testing strategy, unit & integration test framework
12. [docs/DEPLOYMENT.md](file:///d:/Kiaan/crm/backend/docs/DEPLOYMENT.md) — Production deployment guidelines and PM2/Docker config
13. [docs/BACKEND_PROGRESS.md](file:///d:/Kiaan/crm/backend/docs/BACKEND_PROGRESS.md) — Step-by-step milestone tracker
14. [docs/CHANGELOG.md](file:///d:/Kiaan/crm/backend/docs/CHANGELOG.md) — Chronological history of backend modifications

---

## ⚠️ Important Development Guidelines

- **Isolation Rule**: Work strictly inside the `backend` directory. Do not alter frontend files, UI components, themes, or mock data.
- **Database Safety**: Never run destructive database commands (`migrate reset`, `db push --force-reset`). Always use code-first migrations (`prisma migrate dev`).
- **Secret Protection**: Never commit real database passwords or JWT secrets to Git. Maintain sensitive values strictly in `.env`.
