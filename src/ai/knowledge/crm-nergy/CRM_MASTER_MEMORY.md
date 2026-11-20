# CRM nErgy AI — Master Software Knowledge Memory

> **Software Identifier:** `crm-nergy`  
> **Official Name:** CRM nErgy AI (Unified Enterprise CRM, ERP, HR, AI SuperHouse & OAL/OMP Ecosystem)  
> **Version:** 2.0.0 (Enterprise Specification)  
> **Parent Organization:** Kiaan Tech Group / nErgy Logistics & Software Systems  
> **Official Slogan:** *"Make AI Your Bestie — Your Autonomous 24/7 Operating Partner"*  
> **Scope:** Master Central Reference & Permanent Memory File for Personal AI.

---

## 1. CRM nErgy SOFTWARE IDENTITY
- **Platform Name:** CRM nErgy AI.
- **Brand Lineage:** Developed under the Kiaan Tech Group software ecosystem.
- **Nature of Software:** A next-generation, multi-tenant enterprise operating system converging CRM, ERP, HR, Multi-Channel Communications, and Autonomous AI Agents into one platform.
- **Autonomous Partner Identity:** **Zunme AI** (also called **Bestie AI**), an embedded autonomous co-pilot executing workflows, screening candidates, analyzing pipeline risks, and triggering transactional actions.

---

## 2. SOFTWARE PURPOSE
1. **Unify Fragmented Operations:** Eliminate siloes between sales pipelines, warehouse inventory, manufacturing runs, customer invoicing, and employee recruitment.
2. **Empower Multi-Tenant Organizations:** Provide isolated workspaces where businesses, franchises, and branches can operate securely under a single parent deployment.
3. **Autonomous Execution:** Enable conversational action execution—turning natural language commands into verified business records (leads, deals, tasks, purchase orders).
4. **Omnichannel Communication & Voice:** Provide real-time staff WebRTC calling, AI voice agent conversational streaming, and direct encrypted support hotlines (Secured eBox via SWMTP).

---

## 3. SOFTWARE ARCHITECTURE
- **Frontend Architecture:**
  - Single Page Application built on **React 18** and **Vite 6**.
  - Routing managed by **React Router v6** (`AppRoutes.jsx`, 58 registered routes).
  - Responsive layout system with mobile drawer (`CrmMobileAppDrawer.jsx`), top navigation (`Topbar.jsx`), and role-filtered sidebar (`Sidebar.jsx`).
  - Modular React Context Providers: `AuthContext`, `CrmContext`, `ErpContext`, `HrContext`, `SupportContext`, `CallContext`, `LanguageContext`, `CurrencyContext`, `ThemeContext`, `ToastContext`.
  - Iconography: `lucide-react`.
- **Backend Architecture:**
  - RESTful API service built on **Node.js** with **Express**.
  - 18 dedicated router modules (`backend/src/routes/*.js`) and 18 controllers (`backend/src/controllers/*.js`).
  - Database persistence layer managed by **Prisma ORM** connecting to **MySQL** (23 models, 5 enums).
  - Multi-tenant query boundary enforcement: All transactional operations enforce `where: { tenantId }`.
  - Encrypted communications protocol: **SWMTP** (Secured Web Message Transfer Protocol).

---

## 4. ALL CRM MODULES (22 PRIMARY MODULES)
1. **Dashboard (`/crm/dashboard`):** Executive overview of sales velocity, revenue metrics, win rate, and urgent task feeds.
2. **Contacts (`/crm/contacts`):** Complete directory and 360-degree timeline for customers, partners, leads, and vendors.
3. **Leads Directory (`/crm/leads`):** Inbound prospect ingestion, qualification score (0-100), and 1-click conversion to deal.
4. **Sales Pipeline (`/crm/pipeline`):** 8-stage drag-and-drop Kanban managing opportunity value, close probability, and closing dates.
5. **Tasks & Reminders (`/crm/tasks`):** Action planner with priority flags (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and assignment tracking.
6. **Communication Hub (`/crm/communication`):** Unified inbox for SMS, WhatsApp, Email, and internal staff audio calling.
7. **Territory Management (`/crm/territory`):** Regional sales territory zoning and rep quota allocations.
8. **ERP & Operations (`/crm/erp`):** Central dashboard for implementation projects, procurement, inventory, and supply chain.
9. **Projects Hub (`/crm/erp/projects`):** Gantt milestone scheduling, project budget tracking, and deliverable phases.
10. **Procurement & POs (`/crm/erp/procurement`):** Vendor purchase orders, requisition approvals, and shipment reception.
11. **Sales Orders (`/crm/erp/sales-orders`):** Commercial sales order fulfillment and dispatch tracking.
12. **Warehouse Inventory (`/crm/erp/inventory`):** SKU stock quantities, reorder thresholds, and bin locations.
13. **Manufacturing & Production (`/crm/erp/manufacturing`):** Work order scheduling, Bill of Materials (BOM), and shop-floor runs.
14. **Analytic Accounting & Invoices (`/features/analytic-accounting`):** Customer invoices, general ledger accounts, tax compliance, and payment tracking.
15. **HR & Talent Recruiting (`/crm/hr`):** Employee directory, departments, hire dates, and compensation records.
16. **Candidate ATS Pipeline (`/crm/hr/candidates`):** Hiring stages (`APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `HIRED`).
17. **Customer Support Desk (`/crm/support`):** Support tickets with SLA countdowns, priority levels, and agent threads.
18. **Knowledge Base (`/crm/knowledge-base`):** Categorized public and internal help articles with search indexing.
19. **Zunme AI / Bestie AI (`/crm/bestie`):** Autonomous 24/7 copilot with JSON transaction execution capabilities.
20. **AI Voice Agent (`/crm/ai-voice`):** Low-latency voice conversation with real-time waveform visualizer.
21. **AI Video Studio (`/crm/ai-video`):** AI Video Agent, Image TalkR, and generative marketing asset creator.
22. **Administration & Secured eBox (`/crm/admin`, `/crm/ebox`):** Multi-tenant organization setup, seat licenses, and encrypted hotline to Kiaan Tech.

---

## 5. NAVIGATION MENUS
Defined in `frontend/src/data/mockData.js` (`crmNavigation`), grouped into 5 semantic sections:
- **Core CRM:** Dashboard, Contacts, Leads Directory, Sales Pipeline, Tasks & Reminders, Communication Hub, Territory Management.
- **Enterprise ERP:** ERP & Operations.
- **AI SuperHouse:** Zunme AI Agent, AI Voice Agent, AI Content Studio, AI Video Agent, AI Marketing Hub.
- **Business Solutions:** HR & Recruiting, Customer Support, Knowledge Base, My Fav Apps.
- **Governance & Data:** Internal AI Search, Reports Hub, Administration, Secured zBox (SEA), Settings.

---

## 6. FRONTEND ROUTES (58 AUDITED ROUTES)
- **Public & Website:** `/`, `/solutions`, `/solutions/*`, `/industries`, `/industries/*`, `/features`, `/features/analytic-accounting`, `/features/customizable-dashboards`, `/faqs`, `/contact-ai`.
- **Auth & Onboarding:** `/login`, `/crm/login`, `/crm/signup`, `/crm/forgot-password`, `/crm/verify`, `/crm/mfa-setup`, `/crm/onboarding/company`, `/crm/onboarding/admin`, `/crm/onboarding/invite`, `/crm/onboarding/roles`, `/crm/onboarding/complete`.
- **CRM Workspaces:** `/crm/dashboard`, `/crm/contacts`, `/crm/contacts/:id`, `/crm/leads`, `/crm/pipeline`, `/crm/tasks`, `/crm/communication`, `/crm/territory`, `/crm/reports`, `/crm/admin`, `/crm/settings`, `/crm/ebox`.
- **ERP Sub-routes:** `/crm/erp`, `/crm/erp/projects`, `/crm/erp/projects/:id`, `/crm/erp/procurement`, `/crm/erp/sales-orders`, `/crm/erp/inventory`, `/crm/erp/supply-chain`, `/crm/erp/manufacturing`, `/crm/erp/finance`.
- **HR Sub-routes:** `/crm/hr`, `/crm/hr/employees`, `/crm/hr/employees/:id`, `/crm/hr/candidates`, `/crm/hr/interviews`, `/crm/hr/jobs`.
- **Support Sub-routes:** `/crm/support`, `/crm/support/tickets`, `/crm/support/tickets/:id`, `/crm/support/chat`, `/crm/support/kb`.
- **AI Studios:** `/crm/bestie`, `/crm/ai-voice`, `/crm/ai-studio`, `/crm/ai-video`, `/crm/marketing`, `/crm/search`, `/crm/my-apps`.
- **OAL Connected Portals:** `/oal`, `/oal/borrower/dashboard`, `/oal/borrower/kyc`, `/oal/borrower/application`, `/oal/borrower/offers`, `/oal/borrower/score`, `/oal/lender/dashboard`, `/oal/lender/applications`.

---

## 7. MODULE FEATURES
- **Multi-Tenant Scoping:** Automatic tenant context header injection on every API request.
- **Visual Kanban Pipelines:** Stage change triggers deal history audit events.
- **Real-Time Staff Audio:** In-browser WebRTC voice signaling.
- **Dynamic AI Prompt Generation:** Bestie AI parses context and crafts natural responses or transaction actions.
- **Live Voice Waveform Visualization:** 32-bar audio frequency analysis during AI voice calls.
- **Encrypted SWMTP Transmissions:** End-to-end payload envelope with checksum verification.

---

## 8. FORMS AND FIELDS
- **Contacts:** `firstName`*, `lastName`*, `email`*, `phone`, `jobTitle`, `company`, `type` (`CUSTOMER`, `LEAD`, `PARTNER`, `VENDOR`), `lifecycleStage`.
- **Leads:** `name`*, `email`, `phone`, `company`, `status`*, `source`, `estimatedValue`, `score` (0-100).
- **Deals:** `title`*, `value`*, `currency`, `stage`*, `probability` (0-100), `expectedCloseDate`, `contactId`, `leadId`.
- **Tasks:** `title`*, `description`, `dueDate`, `priority`* (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), `status`* (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), `assignedToId`.
- **Purchase Orders:** `orderNumber`*, `vendorName`*, `totalAmount`*, `items` (JSON array of SKU, qty, price), `deliveryDate`.
- **Inventory Items:** `sku`*, `name`*, `quantityOnHand`*, `reorderThreshold`*, `unitPrice`*, `location`.
- **HR Employees:** `fullName`*, `workEmail`*, `jobTitle`*, `department`*, `salary`, `hireDate`, `status`*.
- **Support Tickets:** `subject`*, `customerName`*, `priority`* (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `category`, `description`*.

---

## 9. BUTTONS AND ACTIONS
- **Global Actions:** "+ New Lead", "+ New Deal", "+ New Task", "Quick Call", "Export CSV", "Global Search (`Ctrl+K`)".
- **Pipeline Actions:** Drag card to stage, "Mark Won", "Mark Lost", "Filter by Rep", "Sort by Value".
- **Lead Actions:** "Convert to Deal", "Recalculate AI Score", "Assign Owner", "Delete Lead".
- **ERP Actions:** "Create Purchase Order", "Approve PO", "Receive Shipment", "Adjust Stock", "Schedule Production Run".
- **Support Actions:** "Create Ticket", "Assign to Agent", "Post Reply", "Resolve Ticket", "Close Ticket".
- **eBox Actions:** "Compose Encrypted Dispatch", "Send SWMTP Message", "Download Audit Record".

---

## 10. BUSINESS WORKFLOWS
1. **Lead-to-Cash Workflow:** Inbound Lead -> AI Score -> Rep Discovery -> 1-Click Convert -> Deal in Pipeline -> Deal Won -> ERP Sales Order -> Stock Reserved -> Invoice Dispatched -> Payment Reconciled.
2. **Requisition-to-Payment Workflow:** Stock Reaches Threshold -> Auto Draft PO -> Operations Review -> Finance Approval -> Vendor Dispatch -> Loading Dock Reception -> Stock Incremented.
3. **ATS Talent Recruiting Workflow:** Job Requisition -> Inbound Candidate Application -> AI Resume Parsing -> Interview Panel Scorecard -> Offer Letter -> 1-Click Hire to `HrEmployee`.
4. **Support Ticket & SLA Resolution:** Ticket Opened -> Priority SLA Timer (2h/8h/24h) -> Agent Response / KB Match -> Resolution Verified -> CSAT Survey.

---

## 11. DATABASE MODELS (23 PRISMA ENTITIES)
1. `Tenant` — Tenant organization root (`id`, `name`, `domain`, `subscription`, `status`, `parentId`, `settings`).
2. `User` — Staff identity (`id`, `tenantId`, `name`, `email`, `password`, `role`, `status`).
3. `Lead` — Prospects (`id`, `tenantId`, `name`, `email`, `phone`, `company`, `status`, `score`, `source`, `estimatedValue`).
4. `Contact` — Customer/partner record (`id`, `tenantId`, `firstName`, `lastName`, `email`, `phone`, `company`, `type`).
5. `Deal` — Sales opportunity (`id`, `tenantId`, `title`, `value`, `currency`, `stage`, `probability`, `expectedCloseDate`).
6. `Task` — To-do item (`id`, `tenantId`, `title`, `description`, `dueDate`, `priority`, `status`, `assignedToId`).
7. `Note` — Context notes (`id`, `tenantId`, `entityType`, `entityId`, `content`, `userId`).
8. `Activity` — Timeline audit feed (`id`, `tenantId`, `type`, `description`, `userId`, `createdAt`).
9. `ErpProject` — Implementation projects (`id`, `tenantId`, `name`, `clientName`, `budget`, `spent`, `status`, `progressPercentage`).
10. `SalesOrder` — Sales fulfillment contract (`id`, `tenantId`, `orderNumber`, `customerName`, `totalAmount`, `status`).
11. `PurchaseOrder` — Procurement order (`id`, `tenantId`, `orderNumber`, `vendorName`, `totalAmount`, `status`).
12. `InventoryItem` — Warehouse SKU (`id`, `tenantId`, `sku`, `name`, `quantityOnHand`, `reorderThreshold`, `unitPrice`).
13. `Invoice` — Customer bill (`id`, `tenantId`, `invoiceNumber`, `customerName`, `amount`, `dueDate`, `status`).
14. `Communication` — Message records for SMS/WhatsApp/Email (`id`, `tenantId`, `channel`, `recipient`, `content`, `status`).
15. `Territory` — Geographic sales zone (`id`, `tenantId`, `name`, `code`, `quota`, `assignedReps`).
16. `HrEmployee` — Staff employee record (`id`, `tenantId`, `fullName`, `email`, `jobTitle`, `department`, `salary`).
17. `HrCandidate` — ATS candidate (`id`, `tenantId`, `name`, `email`, `stage`, `score`, `resumeUrl`).
18. `SupportTicket` — Helpdesk ticket (`id`, `tenantId`, `ticketNumber`, `subject`, `priority`, `status`, `assignedAgentId`).
19. `KnowledgeArticle` — FAQ & guides (`id`, `tenantId`, `title`, `slug`, `category`, `content`, `isPublic`).
20. `LedgerAccount` — General ledger accounts (`id`, `tenantId`, `accountCode`, `name`, `type`, `balance`).
21. `ProductionOrder` — Manufacturing batch (`id`, `tenantId`, `orderNumber`, `productName`, `quantity`, `status`).
22. `EboxMessage` — Administrative dispatch to Kiaan Tech (`id`, `tenantId`, `subject`, `message`, `status`, `response`).
23. `StaffCallSession` — Staff WebRTC call logs (`id`, `tenantId`, `callerId`, `calleeId`, `durationSeconds`, `status`).

---

## 12. API ENDPOINTS (48 REST ROUTES)
- **Auth:** `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/auth/refresh`, `POST /api/auth/forgot-password`.
- **CRM:** `GET/POST /api/contacts`, `GET/PUT/DELETE /api/contacts/:id`, `GET/POST /api/leads`, `PUT/DELETE /api/leads/:id`, `POST /api/leads/:id/convert`, `GET/POST /api/deals`, `PUT/DELETE /api/deals/:id`, `PATCH /api/deals/:id/stage`, `GET/POST /api/tasks`, `PATCH /api/tasks/:id/status`, `GET /api/activities`, `POST /api/notes`.
- **ERP:** `GET/POST /api/erp/projects`, `GET/POST /api/erp/inventory`, `PATCH /api/erp/inventory/:id/stock`, `GET/POST /api/erp/purchase-orders`, `GET /api/erp/sales-orders`.
- **Manufacturing:** `GET/POST /api/manufacturing/orders`.
- **Finance:** `GET/POST /api/invoices`, `PATCH /api/invoices/:id/pay`.
- **HR:** `GET/POST /api/hr/employees`, `GET/POST /api/hr/candidates`, `PATCH /api/hr/candidates/:id/stage`.
- **Support:** `GET/POST /api/support/tickets`, `GET /api/support/tickets/:id`, `POST /api/support/tickets/:id/reply`, `GET /api/support/kb`.
- **Security & SWMTP:** `GET/POST /api/ebox/messages`, `POST /api/swmtp/send`, `GET /api/swmtp/inbox`.

---

## 13. ROLES AND PERMISSIONS (THE 12 BUSINESS PERSONAS)
1. `business_owner`: Full Executive Command across all 22 modules.
2. `customer`: Client portal; view assigned tickets, orders, knowledge base.
3. `content_creator`: AI Media & Video Creator; video studio, voice agent, marketing assets.
4. `content_builder`: Campaign & Content Builder; email marketing, social sequences.
5. `influencer`: Brand Ambassador & Influencer; sponsored leads and outreach ROI.
6. `affiliate_partner`: Affiliate Deal Partner; deal referrals, commissions.
7. `ai_marketing_pro`: AI Marketing Specialist; conversion funnel analytics, lead scoring.
8. `hr`: Human Resources Director; employee directory, ATS recruiting, payroll.
9. `operations_sales_admin`: Operations & Sales Administrator; ERP projects, purchase orders, inventory.
10. `finance_compliance_admin`: Finance & Compliance Administrator; invoices, ledger accounts, tax compliance.
11. `crm_pro`: CRM & Pipeline Specialist; leads, contacts, deals, tasks, follow-ups.
12. `super_admin`: Master Super Administrator; multi-tenant organization setup, eBox hotline to Kiaan Tech.

---

## 14. ERP OPERATIONS
- Projects with billable hours, target milestone dates, and client budget tracking.
- Automated low-stock purchase requisitions with multi-stage approval (Operations -> Finance).
- Warehouse bin location tracking with SKU-level reorder thresholds.
- Bill of Materials (BOM) creation and shop-floor manufacturing order status tracking (`SCHEDULED` -> `RUNNING` -> `COMPLETED`).

---

## 15. HR AND RECRUITING
- Master employee directory with compensation, department tags, and manager hierarchy.
- ATS Candidate Pipeline with 5 stages (`APPLIED`, `SCREENING`, `INTERVIEW`, `OFFER`, `HIRED`).
- AI resume extraction and candidate fit scoring against open job requisitions.
- Interview feedback scorecard submission with 1-click hire converting a candidate to an active employee.

---

## 16. CUSTOMER SUPPORT
- Omnichannel support ticketing with automated priority SLA countdown timers.
- Integrated customer messaging thread supporting internal staff notes.
- Self-service Knowledge Base with categorized public articles and search indexing.

---

## 17. AI SUPERHOUSE
An integrated suite of 15 generative and analytical AI engines:
1. AI Video Agent
2. Image TalkR
3. Photo Life
4. Logo Generator
5. Muzik Studio
6. Brand Copywriter
7. Email Sequencer
8. Funnel Optimizer
9. Social Scheduler
10. Ad Creator
11. Pitch Deck AI
12. Contract Analyzer
13. Voice Agent
14. Translation Studio
15. Code Assistant

---

## 18. AI AGENTS AND STUDIOS
- **Zunme AI / Bestie AI:** Autonomous copilot capable of generating transactional JSON action blocks (`CREATE_LEAD`, `UPDATE_DEAL_STAGE`, `SCHEDULE_TASK`, `CHECK_INVENTORY`).
- **AI Voice Agent:** Bi-directional real-time audio pipeline with 32-bar visualizer and live transcript cards.
- **AI Content Studio:** Generative graphics, talking avatars, and marketing collateral generation.

---

## 19. ZUNME AND eBOX
- **Zunme AI Execution Safety:** AI generates action proposals with parameter cards requiring user confirmation before database commit.
- **Secured eBox (SEA):** Direct administrative hotline to Kiaan Tech engineering team transmitting encrypted requests over the SWMTP protocol.

---

## 20. CRM BUSINESS RULES
1. **Strict Multi-Tenancy:** All queries and updates must be scoped by `tenantId`.
2. **Lead Conversion Rule:** When a lead converts, the lead is marked `WON`, a `Contact` is created, and an initial `Deal` is created in the pipeline.
3. **Pipeline Probability Weighting:** Deal stages have preset closing probabilities (`NEW_LEAD`: 10%, `QUALIFIED`: 40%, `PROPOSAL`: 75%, `WON`: 100%).
4. **Secret Protection:** System prompts and AI tools must never output database passwords, encryption keys, or tenant session tokens.

---

## 21. SOFTWARE TERMINOLOGY
- **Tenant:** A company or organization using CRM nErgy with isolated database records.
- **Bestie / Zunme:** The embedded AI operating partner.
- **SWMTP:** Secured Web Message Transfer Protocol for administrative eBox communications.
- **OMP:** Online Marketplace Platform / Dealership ecosystem.
- **OAL:** On-demand Asset Lending financial portal.
- **BANT:** Budget, Authority, Need, Timeline qualification framework.
- **BOM:** Bill of Materials used in manufacturing work orders.
- **SLA:** Service Level Agreement timer for customer support tickets.

---

## 22. COMMON USER QUESTIONS & DIRECT ANSWERS
- *Q: What are the 8 sales pipeline stages?*  
  **A:** `New Lead`, `Contacted`, `Qualified`, `Opportunity`, `Proposal`, `Negotiation`, `Closed Won`, and `Closed Lost`.
- *Q: How do I convert a lead?*  
  **A:** In the Leads Directory (`/crm/leads`), open the lead row and click **"Convert to Deal"**. This automatically creates a Contact, provisions a Deal, and marks the lead as Won.
- *Q: Who can approve a Purchase Order?*  
  **A:** `operations_sales_admin`, `finance_compliance_admin`, and `business_owner`.
- *Q: What does Secured eBox do?*  
  **A:** It connects enterprise administrators directly to the Kiaan Tech engineering team via encrypted SWMTP messages.

---

## 23. KNOWN LIMITATIONS
- Third-party cloud AI voice streaming (Deepgram, ElevenLabs, Cartesia) requires active cloud API credentials in `.env`.
- Live OAL lender term-sheet underwriting requires integration with external banking / underwriting APIs.
- OMP auto-dealer inventory feeds require DMS (Dealer Management System) sync adapters.

---

## 24. KNOWLEDGE GAPS & LIVE DATA DISTINCTION
- **Software Knowledge (Static Documentation):** Explains *how* CRM nErgy functions, its features, menus, routes, database tables, and roles. Available 100% inside this memory file.
- **Live CRM Data (Transactional Records):** Refers to actual dynamic records created by users (e.g. *"How many deals does Acme Corp have today?"*). Requires live database access or REST API execution bridges.

