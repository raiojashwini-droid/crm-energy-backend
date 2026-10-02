# CRM nErgy — Backend Documentation Hub

Welcome to the engineering documentation hub for the **CRM nErgy** backend service.

---

## 📖 Documentation Index

| File | Topic | Description |
| :--- | :--- | :--- |
| [PROJECT_OVERVIEW.md](file:///d:/Kiaan/crm/backend/docs/PROJECT_OVERVIEW.md) | Business Domain & Status | CRM purpose, core business areas, completed vs planned features |
| [ARCHITECTURE.md](file:///d:/Kiaan/crm/backend/docs/ARCHITECTURE.md) | System Architecture | Directory responsibilities, layering, and request-response lifecycle |
| [DATABASE.md](file:///d:/Kiaan/crm/backend/docs/DATABASE.md) | Data Layer & ORM | MySQL setup, Prisma configuration, schema design, and migration policy |
| [API_DOCUMENTATION.md](file:///d:/Kiaan/crm/backend/docs/API_DOCUMENTATION.md) | REST API Contracts | Existing & planned endpoints, payload contracts, and error responses |
| [AUTHENTICATION.md](file:///d:/Kiaan/crm/backend/docs/AUTHENTICATION.md) | Authentication System | JWT token generation, refresh lifecycle, and password hashing |
| [RBAC.md](file:///d:/Kiaan/crm/backend/docs/RBAC.md) | Access Control | Role definitions, permissions hierarchy, and route authorization |
| [MULTI_TENANCY.md](file:///d:/Kiaan/crm/backend/docs/MULTI_TENANCY.md) | Multi-Tenant Model | Tenant isolation patterns, tenant context injection, and indexing |
| [SECURITY.md](file:///d:/Kiaan/crm/backend/docs/SECURITY.md) | Security Best Practices | CORS policies, input validation, SQL injection prevention, rate limits |
| [DEVELOPMENT_SETUP.md](file:///d:/Kiaan/crm/backend/docs/DEVELOPMENT_SETUP.md) | Developer Setup | Prerequisites, local installation, environment configuration, and verification |
| [TESTING.md](file:///d:/Kiaan/crm/backend/docs/TESTING.md) | Testing Strategy | Unit testing, integration testing, mocking, and API validation guidelines |
| [DEPLOYMENT.md](file:///d:/Kiaan/crm/backend/docs/DEPLOYMENT.md) | Production Deployment | Build processes, environment variables, PM2, Docker, and Nginx |
| [BACKEND_PROGRESS.md](file:///d:/Kiaan/crm/backend/docs/BACKEND_PROGRESS.md) | Progress Tracking | Phase-by-phase delivery status, milestones, and upcoming steps |
| [CHANGELOG.md](file:///d:/Kiaan/crm/backend/docs/CHANGELOG.md) | Version History | Chronological log of backend architectural changes and releases |

---

## 🛡️ Critical Project Principles

1. **Strict Scope Isolation**: The backend engine is developed independently inside `backend/`. Frontend code, themes, and mock data remain unmodified until API endpoints are tested and ready for integration.
2. **Deterministic Data Integrity**: Zero destructive database operations. Every schema evolution must be managed via version-controlled Prisma migrations.
3. **Multi-Tenant First**: All data queries and business actions must enforce company/tenant segregation by design.
4. **Resilient Production Architecture**: Centralized error catching, strict schema validation, and health checks on all layers.
