# CRM nErgy Roles, Personas & RBAC Matrix

Full documentation of the 12 verified business personas and permission boundaries implemented in `frontend/src/utils/rbac.js` and Prisma enum `Role`.

---

## 1. THE 12 BUSINESS PERSONAS

| # | Role Key (`rbac.js`) | Prisma Enum (`Role`) | Persona Title | Default Landing Route | Access Level & Description |
|---|---|---|---|---|---|
| **1** | `business_owner` | `BUSINESS_OWNER` | Business Owner / Executive | `/crm/dashboard` | **Executive Command:** Full administrative command across all 22 CRM, ERP, HR, Financial, and AI modules. |
| **2** | `customer` | `CUSTOMER` | Client & Customer Portal | `/crm/dashboard` | **Customer Self-Service:** Restricted view. Can only view assigned tickets, knowledge base articles, their own order status, and messages. |
| **3** | `content_creator` | `CONTENT_CREATOR` | AI Media & Video Creator | `/crm/ai-video` | **Creative Studio:** AI Video Agent, AI Muzik Studio, Image TalkR, Photo Life, Logo Generator, and brand media assets. |
| **4** | `content_builder` | `CONTENT_BUILDER` | Campaign & Content Builder | `/crm/marketing` | **Campaign Builder:** AI Marketing Hub, email sequencing, social media post scheduler, and automated ad copywriting. |
| **5** | `influencer` | `INFLUENCER` | Brand Ambassador & Influencer | `/solutions/influencers` | **Outreach & ROI:** Campaign deliverable tracking, sponsored lead capture, and brand outreach monetization. |
| **6** | `affiliate_partner` | `AFFILIATE_PARTNER` | Affiliate Deal Partner | `/crm/pipeline` | **Deal Referral:** Partner referral pipelines, deal commissions, co-marketing leads, and partner payouts. |
| **7** | `ai_marketing_pro` | `AI_MARKETING_PRO` | AI Marketing Specialist | `/crm/marketing` | **Growth Marketing:** Autonomous campaign optimization, conversion funnel analytics, lead scoring, and A/B ad creative. |
| **8** | `hr` | `HR` | Human Resources Director | `/crm/hr` | **Talent Command:** Employee directory, ATS candidate recruiting, interview schedules, payroll processing, and HR compliance. |
| **9** | `operations_sales_admin` | `OPERATIONS_SALES_ADMIN`| Operations & Sales Admin | `/crm/erp` | **Operations Lead:** ERP projects, procurement purchase orders, sales orders, warehouse inventory, and manufacturing orders. |
| **10**| `finance_compliance_admin`| `FINANCE_COMPLIANCE_ADMIN`| Finance & Compliance Admin | `/features/analytic-accounting`| **Financial Governance:** Invoicing, general ledger accounts, tax/discount compliance, audit activities, and financial reconciliation. |
| **11**| `crm_pro` | `CRM_PRO` | CRM & Pipeline Specialist | `/crm/leads` | **Sales Rep:** Lead management, contact communication, deal stages, daily tasks, and meeting follow-ups. |
| **12**| `super_admin` | `SUPER_ADMIN` | Master Super Administrator | `/crm/admin` | **Root System Admin:** Multi-tenant organization setup, eBox hotline to Kiaan Tech, system logs, role permissions, and tenant provisioning. |

---

## 2. DETAILED RBAC PERMISSIONS MATRIX

| Module / Route | `super_admin` | `business_owner` | `crm_pro` | `operations_sales_admin` | `finance_compliance_admin` | `hr` | `customer` | `content_creator` |
|---|---|---|---|---|---|---|---|---|
| **Dashboard** (`/crm/dashboard`) | View/Edit | View/Edit | View/Edit | View/Edit | View/Edit | View/Edit | Restricted | Restricted |
| **Contacts** (`/crm/contacts`) | Full | Full | Full | View Only | View Only | View Only | Own Account | View Only |
| **Leads** (`/crm/leads`) | Full | Full | Full | View Only | None | None | None | None |
| **Pipeline** (`/crm/pipeline`) | Full | Full | Full | View Only | None | None | None | None |
| **Tasks** (`/crm/tasks`) | Full | Full | Assigned | Assigned | Assigned | Assigned | Own Tickets | Assigned |
| **ERP Projects** (`/crm/erp`) | Full | Full | View Only | Full | View Only | None | None | None |
| **Procurement** (`/crm/erp/procurement`)| Full | Full | None | Full | View/Approve | None | None | None |
| **Inventory** (`/crm/erp/inventory`) | Full | Full | View Only | Full | View Only | None | None | None |
| **Invoicing** (`/features/analytic-accounting`)| Full | Full | None | View Only | Full | None | Own Invoices | None |
| **HR Employees** (`/crm/hr`) | Full | Full | None | None | None | Full | None | None |
| **ATS Candidates** (`/crm/hr/candidates`)| Full | Full | None | None | None | Full | None | None |
| **Support Tickets** (`/crm/support`)| Full | Full | Full | Full | Full | Full | Create/View Own | Full |
| **AI Bestie** (`/crm/bestie`) | Full | Full | Full | Full | Full | Full | Read-Only | Full |
| **AI Video Studio** (`/crm/ai-video`)| Full | Full | View | View | View | None | None | Full |
| **Admin & eBox** (`/crm/admin`, `/crm/ebox`)| Full | Full | None | None | None | None | None | None |

---

## 3. MULTI-TENANT ISOLATION RULES

1. Every database query executed in backend services must enforce a tenant boundary check:
   ```javascript
   where: { tenantId: req.user.tenantId }
   ```
2. Users cannot read, write, or list data belonging to other tenant organizations.
3. System Admin (`super_admin`) users can switch active tenant contexts via tenant switcher headers or administrative route endpoints.
