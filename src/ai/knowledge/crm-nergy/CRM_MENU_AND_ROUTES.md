# CRM nErgy Menu Structure & Frontend Routes

Complete inventory of all sidebar navigation menus, submenus, breadcrumbs, and frontend routing paths.

---

## 1. CRM SIDEBAR NAVIGATION MATRIX (`crmNavigation`)

| Section | Menu Item Label | Unique ID | Route Path | Associated Icon | Access Roles |
|---|---|---|---|---|---|
| **Core CRM** | Dashboard | `dashboard` | `/crm/dashboard` | `LayoutDashboard` | All Roles |
| **Core CRM** | Contacts | `contacts` | `/crm/contacts` | `Users` | All Roles |
| **Core CRM** | Leads Directory | `leads` | `/crm/leads` | `Target` | All except Customer |
| **Core CRM** | Sales Pipeline | `pipeline` | `/crm/pipeline` | `Kanban` | All except Customer |
| **Core CRM** | Tasks & Reminders | `tasks` | `/crm/tasks` | `CheckSquare` | All Roles |
| **Core CRM** | Communication Hub | `communication` | `/crm/communication` | `MessageSquare` | All Roles |
| **Core CRM** | Territory Management | `territory` | `/crm/territory` | `MapPin` | Owners, Admins, CRM Pro |
| **Enterprise ERP** | ERP & Operations | `erp` | `/crm/erp` | `Boxes` | Owners, Operations Admin |
| **AI SuperHouse** | Zunme AI Agent | `bestie` | `/crm/bestie` | `Bot` | All Roles |
| **AI SuperHouse** | AI Voice Agent | `ai-voice` | `/crm/ai-voice` | `Mic` | All Roles |
| **AI SuperHouse** | AI Content Studio | `ai` | `/crm/ai-studio` | `Sparkles` | Content Creators, Builders, Marketers |
| **AI SuperHouse** | AI Video Agent | `ai-video` | `/crm/ai-video` | `Video` | Creators, Marketing Pro |
| **AI SuperHouse** | AI Marketing Hub | `marketing` | `/crm/marketing` | `Megaphone` | Content Builders, Marketing Pro |
| **Business Solutions**| HR & Recruiting | `hr` | `/crm/hr` | `UserCheck` | Owners, HR Director |
| **Business Solutions**| Customer Support | `support` | `/crm/support` | `LifeBuoy` | All Roles |
| **Business Solutions**| Knowledge Base | `knowledge-base` | `/crm/knowledge-base` | `BookOpen` | All Roles |
| **Business Solutions**| My Fav Apps | `my-apps` | `/crm/my-apps` | `Grid` | All Roles |
| **Governance & Data** | Internal AI Search | `search` | `/crm/search` | `Search` | All Roles |
| **Governance & Data** | Reports Hub | `reports` | `/crm/reports` | `FileText` | Owners, Admins, Finance |
| **Governance & Data** | Administration | `admin` | `/crm/admin` | `ShieldCheck` | Super Admin, Business Owner |
| **Governance & Data** | Secured zBox (SEA) | `ebox` | `/crm/ebox` | `Lock` | Super Admin, Business Owner |
| **Governance & Data** | Settings | `settings` | `/crm/settings` | `Settings` | All Roles |

---

## 2. DETAILED ERP SUBMODULE ROUTES

| Module Name | Route Path | Key Subviews |
|---|---|---|
| ERP Dashboard | `/crm/erp` | Operations Overview, KPI Summary |
| Projects Hub | `/crm/erp/projects` | Project List, Gantt Timeline |
| Project Detail View | `/crm/erp/projects/:id` | Milestones, Budget, Task Breakdown |
| Procurement & POs | `/crm/erp/procurement` | Purchase Order List, Vendor Approvals |
| Sales Orders | `/crm/erp/sales-orders` | Commercial Orders, Fulfilment Dispatch |
| Warehouse Inventory | `/crm/erp/inventory` | SKU Stock Table, Reorder Thresholds |
| Supply Chain Hub | `/crm/erp/supply-chain` | Vendor Performance, Transit Status |
| Manufacturing Runs | `/crm/erp/manufacturing` | Production Runs, Bill of Materials |
| Financial Reports | `/crm/erp/finance` | P&L Summary, Accounts Overview |

---

## 3. DETAILED HR & RECRUITING SUBMODULE ROUTES

| Submodule | Route Path | Purpose |
|---|---|---|
| HR Dashboard | `/crm/hr` | Headcount, Attendance, Open Requisitions |
| Employee Directory | `/crm/hr/employees` | Master Employee List, Department Filters |
| Employee Profile View | `/crm/hr/employees/:id` | Compensation, Emergency Contact, Documents |
| Candidate ATS Pipeline | `/crm/hr/candidates` | Kanban Hiring Stages (Applied -> Hired) |
| Interview Manager | `/crm/hr/interviews` | Calendar Schedule, Panel Feedback |
| Job Requisitions | `/crm/hr/jobs` | Job Postings, Status Toggle |
| HR Analytics Reports | `/crm/hr/reports` | Turnover Rate, Time to Hire |

---

## 4. DETAILED CUSTOMER SUPPORT SUBMODULE ROUTES

| Submodule | Route Path | Purpose |
|---|---|---|
| Support Dashboard | `/crm/support` | Ticket Volume, SLA Breach Alerts, CSAT Score |
| Ticket Queue | `/crm/support/tickets` | Open/Resolved Tickets, Priority Filters |
| Ticket Detail View | `/crm/support/tickets/:id` | Customer Thread, Internal Notes, Status Actions |
| Live Agent Chat | `/crm/support/chat` | Real-time Customer Inquiries Dispatch |
| Knowledge Base Admin | `/crm/support/kb` | Article Editor, Category Taxonomy |

---

## 5. AUTHENTICATION & ONBOARDING ROUTES

| Screen Name | Route Path | Purpose |
|---|---|---|
| Unified Login Portal | `/login`, `/crm/login` | Multi-persona email/password + SSO entry |
| User Registration | `/crm/signup` | New tenant / account creation |
| Password Recovery | `/crm/forgot-password` | Self-service reset token dispatch |
| Email / Phone Verification | `/crm/verify` | 6-digit OTP verification |
| MFA Authenticator Setup | `/crm/mfa-setup` | QR code TOTP configuration |
| Company Profile Setup | `/crm/onboarding/company` | Tenant organization name, logo, industry |
| Master Admin Setup | `/crm/onboarding/admin` | Primary executive user registration |
| Employee Invite Wizard | `/crm/onboarding/invite` | Team member email dispatch with pre-assigned roles |
| Roles & Permissions Config | `/crm/onboarding/roles` | Tenant-wide permission toggles |
| Onboarding Completion | `/crm/onboarding/complete` | Welcome walkthrough and launch to Dashboard |

---

## 6. OAL & OMP CONNECTED NETWORK ROUTES

| Network Section | Route Path | Purpose |
|---|---|---|
| OAL Landing Page | `/oal` | On-demand Asset Lending Portal |
| Borrower Dashboard | `/oal/borrower/dashboard` | Active loan requests, collateral status |
| KYC Identity Vault | `/oal/borrower/kyc` | Encrypted identity documents upload |
| Loan Application | `/oal/borrower/application` | Multi-step loan requisition wizard |
| Lender Offers | `/oal/borrower/offers` | Received term sheets comparison |
| AI Risk Rating | `/oal/borrower/score` | Machine learning credit evaluation |
| Lender Dashboard | `/oal/lender/dashboard` | Capital deployment and loan portfolio overview |
| Underwriting Desk | `/oal/lender/applications` | Active loan underwriting and terms generator |
| OMP Deals Flow | `/omp/verification` | Dealer verification workflow and photo genius |
