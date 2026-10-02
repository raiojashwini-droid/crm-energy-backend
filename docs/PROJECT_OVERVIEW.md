# CRM nErgy — Project Overview

## 🎯 Purpose of CRM nErgy Backend

**CRM nErgy** is an enterprise-grade Customer Relationship Management platform powered by intelligent automation. The backend engine provides a robust, multi-tenant REST API infrastructure that handles business data, pipeline workflows, customer records, activities, and role-based access control.

---

## 🏢 Core Business Domains

### 1. Companies & Tenants
- Multi-tenant architecture where each subscriber company operates in isolated data context.
- Tenant configuration, subscription tracking, and organization-level preferences.

### 2. Users & Team Management
- User profile management across organizations.
- Association of users to specific tenants, departments, and managerial hierarchies.

### 3. Authentication & Access Control (RBAC)
- Secure, token-based authentication mechanism.
- Role-based permissions controlling visibility and CRUD actions for each CRM entity.

### 4. Lead Management
- Capture, enrichment, and tracking of prospective customers.
- Lead status workflow (New, Contacted, Qualified, Disqualified, Converted).
- Lead assignment to team members and conversion to Deals/Contacts.

### 5. Contact & Account Management
- Comprehensive address book of business and individual contacts.
- Company associations, communication channels, job titles, and engagement histories.

### 6. Deal & Pipeline Management
- Multi-stage sales pipeline tracking (Discovery, Proposal, Negotiation, Won, Lost).
- Deal valuations, projected close dates, win probabilities, and currency support.

### 7. Task & Activity Management
- Task scheduling, due dates, priorities, assignment, and status completion.
- Chronological timeline logging calls, meetings, emails, and follow-ups.

### 8. Notes & Collaborative Context
- Rich text and context notes attached to Leads, Contacts, and Deals.
- Author attribution and timestamp tracking.

---

## 📊 Implementation Status Matrix

| Domain / Feature | Status | Details |
| :--- | :--- | :--- |
| **Node + Express Server** | ✅ **COMPLETED** | Express app initialized with CORS, JSON parser, and error handling |
| **Environment Config** | ✅ **COMPLETED** | `.env` and `.env.example` configured with dynamic variables |
| **Server Health Endpoint** | ✅ **COMPLETED** | `GET /api/health` returning 200 OK |
| **Prisma ORM Setup** | ✅ **COMPLETED** | Prisma CLI `6.4.1` installed and validated with MySQL provider |
| **Database Connection Test** | ✅ **COMPLETED** | Port 3306 verified; placeholder credentials configured |
| **Database Modeling** | ✅ **COMPLETED** | Defined 8 relational models & 6 enums; generated @prisma/client |
| **Database Migrations** | ✅ **COMPLETED** | Initial migration applied; 8 MySQL tables + migration table created |
| **Database Seeding** | ✅ **COMPLETED** | `prisma/seed.js` seeded demo tenant and records |
| **Authentication (JWT)** | ✅ **COMPLETED** | Registration, login, password hashing, and token verification |
| **Role-Based Access (RBAC)**| ✅ **COMPLETED** | Role authorization middleware and 12-role mapper |
| **Multi-Tenancy Isolation** | ✅ **COMPLETED** | Tenant context injected into all business queries |
| **Leads API** | ✅ **COMPLETED** | CRUD & lead-to-contact conversion endpoints |
| **Contacts API** | ✅ **COMPLETED** | CRUD & bulk delete endpoints |
| **Deals & Pipeline API** | ✅ **COMPLETED** | Pipeline stage movement, valuation, and CRUD |
| **Tasks & Activities API** | ✅ **COMPLETED** | Task assignments, status toggling, and activity logging |
| **Notes API** | ✅ **COMPLETED** | Contextual note creation and retrieval |
| **Users / Team API** | ✅ **COMPLETED** | Tenant-scoped team member directory |
| **Frontend API Integration** | ✅ **COMPLETED** | React frontend connected to live backend APIs |
| **AI Integration Layer** | 🚫 **NOT IMPLEMENTED** | External LLM and predictive scoring hooks (future phase) |
| **Email & Webhook Triggers**| 🚫 **NOT IMPLEMENTED** | SMTP / Resend integration and inbound webhooks (future phase) |

---

## 🔍 Detailed Domain Breakdown

### ✅ COMPLETED
- **Foundation Layer**: Clean Express application initialized inside `backend/src/app.js` and started via `backend/src/server.js`.
- **Global Error Handling**: Centralized 404 route catcher and unified JSON error handling middleware.
- **ORM Configuration**: Prisma ORM `6.4.1` installed with `@prisma/client`, `schema.prisma` configured for MySQL datasource.
- **Health Verification**: Real-time health check endpoint live at `/api/health`.
- **Data Modeling (Step 3)**: Relational schema defined for `Tenant`, `User`, `Role`, `Lead`, `Contact`, `Deal`, `Task`, `Note`, and `Activity`. Validated and `@prisma/client` code generated.

### ⏳ PLANNED (Upcoming Phases)
- **Database Migrations**: Running initial baseline migration to provision MySQL database tables in `crm-db`.
- **Authentication Service**: Implementing bcrypt password hashing and JSON Web Token (JWT) issuance.
- **Authorization Layer**: Enforcing RBAC rules (Super Admin, Tenant Admin, Manager, Sales Rep).
- **Core CRUD Services**: Implementing business services and controllers for all core CRM entities.

### 🚫 NOT IMPLEMENTED
- No business models have been written to the database yet.
- No user authentication or session management is currently executing.
- No API routes outside `/api/health` are active.
- No frontend connections have been made.
