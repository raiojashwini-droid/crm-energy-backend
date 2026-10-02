# CRM nErgy — Security Architecture & Guidelines

## 🛡️ Security Principles

Security in CRM nErgy is built on defense-in-depth across the transport, application, and persistence layers.

---

## 🔒 Implemented & Planned Protections

| Layer | Threat | Mitigation Strategy | Status |
| :--- | :--- | :--- | :--- |
| **Secrets Management** | Credential Exposure | Secrets isolated in `.env`; `.env` strictly gitignored; template in `.env.example` | ✅ Implemented |
| **Transport Layer** | Cross-Origin Attacks | Strict CORS policy using dynamic `CORS_ORIGIN` | ✅ Implemented |
| **Error Handling** | Information Disclosure | Stack traces stripped in `production` environment | ✅ Implemented |
| **Database Queries** | SQL Injection | Prisma ORM utilizes parameterized prepared statements | ✅ Implemented |
| **Input Validation** | Injection & Malformed Payloads | Schema-based validation using Joi / Zod on all endpoints | ⏳ Planned |
| **Brute Force** | Credential Stuffing / DoS | `express-rate-limit` on login and sensitive endpoints | ⏳ Planned |
| **HTTP Headers** | Clickjacking / XSS / Sniffing | `helmet` middleware setting secure HTTP headers | ⏳ Planned |
| **Authentication** | Session Hijacking | Short-lived signed JWTs with constant-time signature checks | ⏳ Planned |

---

## 🔍 Detailed Policy Guidelines

### 1. Environment Secrets Management
- Under no circumstances should real production or local credentials, database passwords, or JWT secrets be committed to version control.
- All configuration variables must have fallback behavior or fail fast during server startup with descriptive error logging.

### 2. CORS (Cross-Origin Resource Sharing)
Currently configured in `src/app.js`:
```javascript
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
```
In production, `CORS_ORIGIN` should be locked to the exact frontend domain (e.g. `https://crm.nergy.ai`).

### 3. SQL Injection Prevention
Direct string interpolation into SQL queries is prohibited. Prisma ORM translates object-based query builders into parameterized SQL statements automatically. Any rare raw SQL executions must strictly use `prisma.$queryRaw` with template tag parameters, never string concatenation.

### 4. Production Error Masking
Implemented in `src/middleware/errorHandler.js`:
```javascript
res.status(statusCode).json({
  success: false,
  message: err.message || 'Internal Server Error',
  ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
});
```
Internal stack traces and database error codes are hidden from external clients in production.
