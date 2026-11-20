# CRM nErgy AI — Master AI Training & Knowledge Base Memory File
> **Version:** 2.0.0 (Enterprise Production Specification)  
> **Target Audience:** Personal AI Models, Fine-Tuning Pipelines, RAG Vector Databases, System Prompts, and Autonomous Agent Memory Stores.  
> **Platform Name:** CRM nErgy AI (Unified Enterprise CRM, ERP, HR, AI SuperHouse & OAL/OMP Ecosystem)  
> **Parent Ecosystem:** Kiaan Tech Group / nErgy Logistics & Software Systems  
> **Official Slogan:** *"Make AI Your Bestie — Your Autonomous 24/7 Operating Partner"*

---

## 📌 TABLE OF CONTENTS
1. [Executive Identity & Platform Overview](#1-executive-identity--platform-overview)
2. [Technology Stack & System Architecture](#2-technology-stack--system-architecture)
3. [All 12 Business Personas & RBAC Matrix](#3-all-12-business-personas--rbac-matrix)
4. [Complete Database Schema (22 Prisma Models & Enums)](#4-complete-database-schema-22-prisma-models--enums)
5. [Core CRM Modules & Workflows](#5-core-crm-modules--workflows)
6. [Enterprise ERP & Operations Modules](#6-enterprise-erp--operations-modules)
7. [HR & Talent Recruiting Modules](#7-hr--talent-recruiting-modules)
8. [Customer Support & Knowledge Base Modules](#8-customer-support--knowledge-base-modules)
9. [AI SuperHouse & 15 Sub-Studios](#9-ai-superhouse--15-sub-studios)
10. [AI Voice Agent Streaming Pipeline](#10-ai-voice-agent-streaming-pipeline)
11. [Communication & Territory Management](#11-communication--territory-management)
12. [Secured eBox & SWMTP Protocol](#12-secured-ebox--swmtp-protocol)
13. [OMP Deals & OAL Network Ecosystem](#13-omp-deals--oal-network-ecosystem)
14. [Multi-Industry Vertical Solutions (26 Sectors)](#14-multi-industry-vertical-solutions-26-sectors)
15. [Complete REST API Endpoints Reference](#15-complete-rest-api-endpoints-reference)
16. [Autonomous AI JSON Action Execution Protocol](#16-autonomous-ai-json-action-execution-protocol)
17. [Master FAQ & Training Q&A Dataset (50+ Scenarios)](#17-master-faq--training-qa-dataset-50-scenarios)

---

## 1. EXECUTIVE IDENTITY & PLATFORM OVERVIEW

### 1.1 What is CRM nErgy AI?
**CRM nErgy AI** is a next-generation, multi-tenant enterprise operating system designed to merge traditional Customer Relationship Management (CRM), Enterprise Resource Planning (ERP), Human Resources (HR), Multi-Channel Communications, and Autonomous AI Agents into a single, cohesive software suite.

### 1.2 Core Capabilities
- **Multi-Tenant Architecture:** Every lead, contact, deal, project, and employee belongs to a strictly isolated `tenantId`.
- **Zunme AI / Bestie AI:** An autonomous executive operating partner that can analyze deals, detect closing risks, create leads, schedule tasks, check warehouse stock, and screen job candidates via natural language dialogue and executable JSON actions.
- **AI Voice Agent:** Real-time conversational voice assistant utilizing Speech-to-Text (Deepgram / Whisper), LLM reasoning (GPT-4o / Claude / Gemini), and Text-to-Speech (ElevenLabs / Cartesia / Web Speech) with live audio level visualization and transcript streaming.
- **Unified ERP & Manufacturing:** Bridges sales deals directly into delivery projects, inventory depletion, procurement purchase orders, and general ledger accounting.
- **Cross-Platform Staff Calling:** Real-time WebRTC/signaling audio communications between internal staff across enterprise tenants.
- **Secured eBox & SWMTP:** Military-grade encrypted administrative hotline transmitting encrypted requests directly to the Kiaan Tech engineering team.

---

## 2. TECHNOLOGY STACK & SYSTEM ARCHITECTURE

### 2.1 Frontend Architecture
- **Framework:** React 18 with Vite SPA (Single Page Application)
- **Routing:** React Router v6 (with v7 flags `v7_startTransition` and `v7_relativeSplatPath`)
- **State Management:** Modular React Context Providers:
  - `AuthContext`: Manages active user session, token storage (`crm_token`, `crm_user`), tenant context, and active persona.
  - `CrmContext`: Central store for leads, contacts, deals, tasks, notes, and activity timeline.
  - `ErpContext`: Store for projects, purchase orders, sales orders, and inventory items.
  - `HrContext`: Store for employee directory, candidate pipeline, and payroll status.
  - `SupportContext`: Store for support tickets, SLAs, and knowledge base articles.
  - `CallContext`: Manages incoming/outgoing staff audio calls and call session overlays.
  - `LanguageContext`: Multi-language support (English, Spanish, Hindi, etc.).
  - `CurrencyContext`: Dynamic multi-currency formatting (USD, EUR, GBP, INR, CAD).
  - `ThemeContext`: Dark/Light theme switching with CSS variable design tokens.
  - `ToastContext`: Global notification toast system.
- **Icons & UI:** Lucide React (`lucide-react`)
- **Styling:** Custom CSS design system with responsive mobile-first tokens (`variables.css`, `global.css`, `responsive.css`).

### 2.2 Backend Architecture
- **Runtime:** Node.js (v20+) with Express REST API
- **Database ORM:** Prisma ORM connected to MySQL Database
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Security:** Helmet, CORS, input validation, multi-tenant database middleware ensuring queries include `where: { tenantId }`.
- **Protocols:** REST API + SWMTP (Secured Web Message Transfer Protocol)

---

## 3. ALL 12 BUSINESS PERSONAS & RBAC MATRIX

CRM nErgy features a strict 12-Role RBAC engine defined in `frontend/src/utils/rbac.js` and Prisma enum `Role`:

| # | Role Key | Role Title | Default Landing Route | Key Capabilities & Access Level |
|---|---|---|---|---|
| 1 | `business_owner` | Business Owner / Executive | `/crm/dashboard` | **Full Executive Command:** Access to all 22 modules, financial analytics, revenue pipelines, admin settings, and executive briefings. |
| 2 | `customer` | Client & Customer Portal | `/crm/dashboard` | **Customer Self-Service:** View assigned contacts, support tickets, knowledge base, direct messaging, and order status. |
| 3 | `content_creator` | AI Media & Video Creator | `/crm/ai-video` | **Creative Studio:** AI Video Agent, AI Muzik Studio, Image TalkR, Photo Life, Logo Generator, and brand assets. |
| 4 | `content_builder` | Campaign & Content Builder | `/crm/marketing` | **Campaign Builder:** AI Marketing Hub, email sequencing, social media scheduling, and multi-channel asset creation. |
| 5 | `influencer` | Brand Ambassador & Influencer | `/solutions/influencers` | **Outreach & ROI:** Campaign performance tracking, influencer monetization, sponsored lead capture, and brand outreach. |
| 6 | `affiliate_partner` | Affiliate Deal Partner | `/crm/pipeline` | **Deal Referral:** Partner referral pipelines, deal commissions, co-marketing leads, and partner payouts. |
| 7 | `ai_marketing_pro` | AI Marketing Specialist | `/crm/marketing` | **Growth Marketing:** Autonomous campaign optimization, conversion funnel analytics, lead scoring, and A/B ad creative. |
| 8 | `hr` | Human Resources Director | `/crm/hr` | **Talent Command:** Employee directory, ATS candidate recruiting, interview schedules, payroll processing, and HR compliance. |
| 9 | `operations_sales_admin` | Operations & Sales Administrator | `/crm/erp` | **Operations Lead:** ERP projects, procurement purchase orders, sales orders, warehouse inventory, and manufacturing orders. |
| 10 | `finance_compliance_admin`| Finance & Compliance Administrator | `/features/analytic-accounting` | **Financial Governance:** Invoicing, general ledger accounts, tax/discount compliance, audit activities, and financial reconciliation. |
| 11 | `crm_pro` | CRM & Pipeline Specialist | `/crm/leads` | **Sales Rep:** Lead management, contact communication, deal stages, daily tasks, and meeting follow-ups. |
| 12 | `super_admin` | Master Super Administrator | `/crm/admin` | **Root System Admin:** Multi-tenant organization setup, eBox hotline to Kiaan Tech, system logs, role permissions, and tenant provisioning. |

---

## 4. COMPLETE DATABASE SCHEMA (22 PRISMA MODELS & ENUMS)

### 4.1 Prisma Enums
- **`Role`**: `BUSINESS_OWNER`, `CUSTOMER`, `CONTENT_CREATOR`, `CONTENT_BUILDER`, `INFLUENCER`, `AFFILIATE_PARTNER`, `AI_MARKETING_PRO`, `HR`, `OPERATIONS_SALES_ADMIN`, `FINANCE_COMPLIANCE_ADMIN`, `CRM_PRO`, `SUPER_ADMIN`.
- **`DealStage`**: `NEW_LEAD`, `CONTACTED`, `QUALIFIED`, `OPPORTUNITY`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST`.
- **`LeadStatus`**: `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `WON`, `LOST`.
- **`Priority`**: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
- **`TaskStatus`**: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
- **`ActivityType`**: `NOTE_ADDED`, `CALL_LOGGED`, `EMAIL_SENT`, `MEETING_HELD`, `STAGE_CHANGED`, `STATUS_CHANGED`, `LEAD_CONVERTED`, `TASK_CREATED`, `TASK_COMPLETED`.

### 4.2 Data Models Breakdown

#### 1. `Tenant` (`tenants`)
- `id` (String CUID, Primary Key)
- `name` (String, e.g. "nErgy Enterprise Logistics")
- `domain` (String nullable)
- `subscription` (String default "ACTIVE")
- `status` (String default "ACTIVE")
- `parentId` (String nullable, self-relation for sub-tenants/franchises)
- `settings` (JSON nullable)
- Relations: Has many `users`, `leads`, `contacts`, `deals`, `tasks`, `notes`, `activities`, `erpProjects`, `salesOrders`, `purchaseOrders`, `inventoryItems`, `invoices`, `communications`, `territories`, `hrEmployees`, `hrCandidates`, `supportTickets`, `knowledgeArticles`, `ledgerAccounts`, `productionOrders`, `eboxMessages`, `callSessions`.

#### 2. `User` (`users`)
- `id` (String CUID)
- `tenantId` (Foreign Key -> Tenant)
- `name` (String, e.g. "Alexander Wright")
- `email` (String, Unique per tenant)
- `passwordHash` (String, bcrypt)
- `role` (Role Enum, default `CRM_PRO`)
- `isActive` (Boolean default true)
- `avatar` (LongText nullable)

#### 3. `Lead` (`leads`)
- `id` (String CUID)
- `tenantId` (Foreign Key -> Tenant)
- `assignedUserId` (Foreign Key -> User nullable)
- `name` (String), `company` (String), `email` (String nullable), `phone` (String nullable)
- `source` (String nullable: "Website", "Inbound Call", "AI Ad", "Referral", "Cold Outreach")
- `territory` (String nullable)
- `status` (LeadStatus: NEW, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST)
- `score` (Int: 0 - 100, default 75)
- `estimatedValue` (Decimal(12, 2))
- `convertedToContactId` (Foreign Key -> Contact nullable, populated upon 1-click conversion)

#### 4. `Contact` (`contacts`)
- `id` (String CUID)
- `tenantId` (Foreign Key -> Tenant)
- `assignedUserId` (Foreign Key -> User nullable)
- `name` (String), `company` (String), `email` (String), `phone` (String)
- `type` (String default "Enterprise Client")
- `title` (String, e.g. "Chief Technology Officer")
- `status` (String default "Active")
- `totalValue` (Decimal(12, 2))
- `lastActivity` (DateTime nullable)

#### 5. `Deal` (`deals`)
- `id` (String CUID)
- `tenantId` (Foreign Key -> Tenant)
- `contactId` (Foreign Key -> Contact nullable)
- `leadId` (Foreign Key -> Lead nullable)
- `assignedUserId` (Foreign Key -> User nullable)
- `title` (String, e.g. "Apex Energy Solutions Renewal")
- `customer` (String)
- `value` (Decimal(12, 2))
- `stage` (DealStage Enum: 8 stages)
- `probability` (Int: 0 - 100)
- `expectedClose` (DateTime nullable)
- `description` (Text nullable)

#### 6. `Task` (`tasks`)
- `id` (String CUID)
- `tenantId` (Foreign Key -> Tenant)
- `assignedUserId` (Foreign Key -> User nullable)
- `leadId`, `contactId`, `dealId` (Polymorphic parent foreign keys)
- `title` (String), `description` (Text)
- `priority` (Priority: LOW, MEDIUM, HIGH, URGENT)
- `status` (TaskStatus: PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `dueDate` (DateTime nullable)
- `reminder` (String nullable)

#### 7. `Note` (`notes`)
- Attached to Lead, Contact, or Deal with author tracking and timestamp.

#### 8. `Activity` (`activities`)
- Immutable audit log tracking stage changes, conversions, calls, and emails.

#### 9. `ErpProject` (`erp_projects`)
- Linked to Won Deals or Client Contacts. Fields: `budget`, `spent`, `progress` (0-100%), `status` ("In Progress", "Delivered", "On Hold"), `manager`, `deadline`.

#### 10. `SalesOrder` (`sales_orders`)
- Linked to Project or Deal. Fields: `orderNumber`, `customer`, `items` (Text/JSON), `total`, `status` ("Processing", "Shipped", "Delivered").

#### 11. `PurchaseOrder` (`purchase_orders`)
- Procurement records. Fields: `poNumber`, `vendor`, `items`, `amount`, `status` ("Pending Approval", "Approved", "Received"), `eta`.

#### 12. `InventoryItem` (`inventory_items`)
- Warehouse SKU items. Fields: `sku`, `name`, `category`, `warehouse` (e.g. "Austin Central"), `quantity`, `minThreshold`, `unitCost`, `status` ("Optimal", "Low Stock", "Critical").

#### 13. `Invoice` (`invoices`)
- Commercial billing. Fields: `invoiceNumber`, `customerName`, `subtotal`, `tax`, `discount`, `amount`, `status` ("Sent", "Paid", "Overdue"), `dueDate`, `items` (JSON).

#### 14. `Communication` (`communications`)
- Tracks emails, SMS, and WhatsApp messages. Fields: `channel`, `direction` (INBOUND/OUTBOUND), `sender`, `recipient`, `subject`, `body`, `status` (SENT/DELIVERED/FAILED).

#### 15. `Territory` (`territories`)
- Sales geographic divisions. Fields: `code`, `name`, `region`, `states`, `managerId`, `targetQuota`, `status`.

#### 16. `HrEmployee` (`hr_employees`)
- Full employee record. Fields: `employeeId`, `name`, `email`, `department`, `designation`, `salary`, `joiningDate`, `status` ("Active", "On Leave"), `payrollStatus` ("Processed", "Pending").

#### 17. `HrCandidate` (`hr_candidates`)
- Job applicant tracking. Fields: `name`, `email`, `phone`, `role`, `stage` ("Applied", "Screening", "Interview", "Offered", "Hired"), `score` (0-100), `experience`, `resumeUrl`.

#### 18. `SupportTicket` (`support_tickets`)
- Customer helpdesk. Fields: `ticketNumber`, `title`, `description`, `category` ("Technical", "Billing", "General"), `priority`, `status` ("Open", "In Progress", "Resolved", "Closed"), `slaHours`, `assignedUserId`.

#### 19. `KnowledgeArticle` (`knowledge_articles`)
- Public or internal documentation. Fields: `title`, `category`, `content`, `views`, `isPublished`.

#### 20. `LedgerAccount` (`ledger_accounts`)
- Chart of accounts. Fields: `code`, `accountName`, `type` ("Asset", "Liability", "Equity", "Revenue", "Expense"), `balance`, `status`.

#### 21. `ProductionOrder` (`production_orders`)
- Manufacturing assembly. Fields: `orderNumber`, `productName`, `quantity`, `bomCode`, `status` ("Scheduled", "In Production", "Completed"), `startDate`, `completionDate`.

#### 22. `EboxMessage` (`ebox_messages`)
- Direct encrypted administrative hotline messages to the Kiaan Tech master team.

---

## 5. CORE CRM MODULES & WORKFLOWS

### 5.1 Leads Management (`/crm/leads`)
- **Lead Capture & Scoring:** Incoming leads are assigned an AI score (0-100). Scores above 80 are flagged "Hot Opportunity".
- **Status Lifecycle:** `New` → `Contacted` → `Qualified` → `Proposal` → `Won` / `Lost`.
- **1-Click Conversion:** When a lead is qualified, clicking "Convert to Contact" automatically generates an official Address Book Contact and creates a linked Sales Deal without duplicate entry.

### 5.2 Contacts Directory (`/crm/contacts`)
- **Central Customer Record:** Stores complete phone, email, company, deal history, linked support tickets, and direct communication history.
- **Lifetime Value Tracking:** Computes total closed revenue across all linked won deals.

### 5.3 Deals & Pipeline Kanban (`/crm/pipeline`)
- **8 Drag-and-Drop Stages:** Visual Kanban board moving deals from `New Lead` to `Closed Won`.
- **Probability & Weighted Forecast:** Each stage automatically calculates the expected cash flow:
  $$\text{Weighted Forecast} = \text{Deal Value} \times \text{Stage Probability (\%)} $$
- **Deal Risk Intervention:** AI automatically detects inactive deals nearing close deadlines and suggests follow-up actions.

### 5.4 Task Scheduler (`/crm/tasks`)
- Priorities: Urgent, High, Medium, Low.
- Linked to leads, deals, or contacts with automated daily agenda reminders.

---

## 6. ENTERPRISE ERP & OPERATIONS MODULES

### 6.1 Projects (`/crm/erp/projects`)
- Manages client deliverable execution with budget vs actual spent tracking and deadline milestones.

### 6.2 Sales Orders (`/crm/erp/sales-orders`)
- Converts signed customer proposals into fulfillment orders.

### 6.3 Procurement & Purchase Orders (`/crm/erp/procurement`)
- Reorders raw materials and parts from external vendors with approval workflows and arrival ETAs.

### 6.4 Inventory & Warehouse (`/crm/erp/inventory`)
- Real-time stock counts across warehouses (e.g. Austin Central). When item quantity drops below `minThreshold`, an automatic reorder notification is triggered.

### 6.5 Manufacturing & Production (`/crm/erp/manufacturing`)
- Manages Bill of Materials (BOM) and assembly production runs.

### 6.6 General Ledger & Invoicing (`/crm/erp/finance`)
- Double-entry accounting accounts and automated PDF invoice generation.

---

## 7. HR & TALENT RECRUITING MODULES

### 7.1 Employee Directory (`/crm/hr/employees`)
- Tracks designations, departments, compensation, and payroll status.

### 7.2 Applicant Tracking System (ATS) (`/crm/hr/candidates`)
- AI parses candidate experience, assigns a match score (e.g. 94%), and transitions candidates across hiring stages.

---

## 8. CUSTOMER SUPPORT & KNOWLEDGE BASE MODULES

### 8.1 Support Tickets (`/crm/support/tickets`)
- Tracks incoming customer issues with SLA timers (e.g. 24 hours), severity ratings, and agent ownership.

### 8.2 Knowledge Base (`/crm/knowledge-base`)
- Searchable library of self-service troubleshooting guides and software documentation.

---

## 9. AI SUPERHOUSE & 15 SUB-STUDIOS

The **AI SuperHouse** (`/crm/ai-studio`) is the creative and analytical powerhouse of CRM nErgy AI. It contains 15 specialized studios:

| Studio Key | Studio Name | Primary Function & Output |
|---|---|---|
| `bestie` | **Zunme AI / Bestie AI** | 24/7 Autonomous Operating Partner: Deal risk analysis, lead creation, inventory reorders, task dispatching. |
| `muzik` | **AAI Muzik Hit Studio** | Generates commercial soundtrack blueprints, BPM tempo, lyrics, and Dolby Atmos audio mix notes. |
| `realtalk` | **AAI Real Talk** | Multi-speaker ultra-realistic natural dialogue generation with tone inflections and speech pauses. |
| `audio-writer`| **AI Audio Writer** | Commercial voiceover scripts timed to 30s/60s intervals with hooks and call-to-actions. |
| `contalk` | **AI ConTalk** | Sales objection handling, counter-offers, deal desking, and psychological closing pitches. |
| `film-maker` | **AI Film Maker** | Multi-scene screenplay formatting with camera angles, lighting directives, and character dialogue. |
| `image-talkr` | **AI Image TalkR** | Virtual presenter scripts with synchronized lip-sync cues and facial gesture keyframes. |
| `logo-gen` | **AI Logo Generator** | Brand identity systems, hex color palettes, and raw valid `<svg>` vector code for emblems. |
| `photo-life` | **AI Photo Life** | Automotive & commercial studio photo staging, lens specifications (e.g. 85mm f/1.4), and Midjourney prompts. |
| `video-crew` | **AI Video Crew** | Multi-camera switching schedules, cue sheets, teleprompter feeds, and broadcast directives. |
| `visual-workflow`| **AI Visual Workflow** | No-code automation logic nodes connecting AI triggers to CRM & ERP webhook events. |
| `voicex-change`| **AI VoiceX Change** | Polyglot multi-language translation, phonetics, and regional cultural idiom localization. |
| `big-movies` | **AAI BIG Movies Lab** | 3-Act narrative dramatic treatments, rising conflict arcs, and investor pitch deck talking points. |
| `train-speak` | **Train AI to Speak** | Brand persona fine-tuning, vocabulary whitelists/blacklists, and emotional tone calibration. |
| `video-agent` | **AI Video Agent** | Signature 4-step rapid video production: "Say it, See it, Shape it, Ship it". |

---

## 10. AI VOICE AGENT STREAMING PIPELINE

Located at `/crm/ai-voice`, this module powers hands-free conversational voice command:
- **Speech-to-Text (STT):** Deepgram Nova-2 (82ms latency), OpenAI Whisper v3, or native Web Speech API.
- **Reasoning Model (LLM):** OpenAI GPT-4o Realtime, Claude 3.5 Sonnet, or Google Gemini 1.5 Flash.
- **Voice Synthesis (TTS):** ElevenLabs Flash v2.5, Cartesia Sonic (80ms), or native SpeechSynthesis.
- **Personas:** Sarah (US Executive), Marcus (Technical Specialist), Elena (Customer Concierge).
- **Features:** Live waveform equalizer bars, interactive speech transcript feed, speed rate adjustment (0.75x to 1.5x), audio mute toggle, and sample testing.

---

## 11. COMMUNICATION & TERRITORY MANAGEMENT

### 11.1 Communication Hub (`/crm/communication`)
- Logs outbound and inbound emails and SMS messages directly to customer timelines.

### 11.2 Territory Management (`/crm/territory`)
- Allocates geographic sales territories to designated managers and monitors revenue quota attainment.

---

## 12. SECURED EBOX & SWMTP PROTOCOL

Located at `/crm/admin/ebox`, the **Secured eBox** utilizes the **Secured Web Message Transfer Protocol (SWMTP)**:
- Provides a direct, encrypted administrative hotline to the **Kiaan Tech Team**.
- Allows enterprise business owners to request emergency bug fixes, architecture expansions, and data backups with automated tracking.

---

## 13. OMP DEALS & OAL NETWORK ECOSYSTEM

CRM nErgy is tightly integrated with the **OMP Enterprise Deals Suite** and **OAL Network**:
- **OMP Central Office:** Executive desking, verified dealer syndication, and high-margin automotive/asset deal desking.
- **OAL Network:** Borrower and lender marketplace with automated loan matching, KYC/AML verification, and FinCEN compliance.

---

## 14. MULTI-INDUSTRY VERTICAL SOLUTIONS (26 SECTORS)

CRM nErgy includes pre-built workflows for 26 distinct industry sectors (`/industries/:slug`):
1. **Automotive:** Inventory VIN tracking, test drive scheduling, dealer financing.
2. **Healthcare:** HIPAA-compliant patient intake, appointment scheduling, provider coordination.
3. **Construction:** Job site material tracking, subcontractor bids, milestone billing.
4. **Consulting:** Timesheet accounting, billing milestones, client project scoping.
5. **E-Commerce:** D2C order sync, inventory alerts, customer cart abandonment outreach.
6. **Education:** Student applicant tracking, tuition billing, course enrollment pipelines.
7. **Entertainment:** Talent booking, event scheduling, royalty tracking.
8. **Financial Services:** Wealth management, SEC/FINRA compliance, loan pipelines.
9. **Hospitality:** Guest reservations, concierge requests, loyalty management.
10. **Insurance:** Policy underwriting, claims management, renewal pipelines.
11. **Startups:** Lean cash runway tracking, venture investor pipeline, rapid user onboarding.
12. **Franchises:** Multi-unit royalty tracking, territory protection, brand compliance.
13. **Influencers:** Brand sponsorship deals, campaign deliverable tracking, rate card monetization.
*(And 13 additional professional industry vertical adapters)*.

---

## 15. COMPLETE REST API ENDPOINTS REFERENCE

All routes run under `/api` and require `Authorization: Bearer <token>` (except public auth routes):

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create new tenant and owner user.
- `POST /api/auth/login` — Authenticate user and receive JWT.
- `GET /api/auth/me` — Retrieve active profile, permissions, and tenant details.

### Leads (`/api/leads`)
- `GET /api/leads` — List all tenant leads (supports filtering by status, search).
- `POST /api/leads` — Create new sales lead.
- `GET /api/leads/:id` — Retrieve lead details with linked tasks and notes.
- `PUT /api/leads/:id` — Update lead status or estimated value.
- `POST /api/leads/:id/convert` — 1-click conversion to Contact and Deal.
- `DELETE /api/leads/:id` — Remove lead.

### Contacts (`/api/contacts`)
- `GET /api/contacts` — List all address book contacts.
- `POST /api/contacts` — Create new contact.
- `GET /api/contacts/:id` — Full customer timeline and deal history.
- `PUT /api/contacts/:id` — Update contact information.

### Deals (`/api/deals`)
- `GET /api/deals` — List all pipeline deals across all 8 stages.
- `POST /api/deals` — Create new deal.
- `PUT /api/deals/:id` — Update stage or deal value.

### Tasks (`/api/tasks`)
- `GET /api/tasks` — List tasks filtered by user, status, or date.
- `POST /api/tasks` — Create task with priority and reminder.
- `PUT /api/tasks/:id` — Update status (e.g. COMPLETED).

### ERP Operations (`/api/erp`)
- `GET /api/erp/projects` & `POST /api/erp/projects`
- `GET /api/erp/sales-orders` & `POST /api/erp/sales-orders`
- `GET /api/erp/purchase-orders` & `POST /api/erp/purchase-orders`
- `GET /api/erp/inventory` & `POST /api/erp/inventory`

### HR & Recruiting (`/api/hr`)
- `GET /api/hr/employees` & `POST /api/hr/employees`
- `GET /api/hr/candidates` & `POST /api/hr/candidates`

### Support & Helpdesk (`/api/support`)
- `GET /api/support/tickets` & `POST /api/support/tickets`
- `GET /api/support/articles` & `POST /api/support/articles`

### Administrative eBox (`/api/ebox`)
- `GET /api/ebox/messages` & `POST /api/ebox/messages`

---

## 16. AUTONOMOUS AI JSON ACTION EXECUTION PROTOCOL

When the user communicates with **Zunme AI / Bestie AI**, the AI outputs plain conversational text followed by a structured JSON action tag that the frontend intercepts and executes into the live database:

1. **Deal Risk Intervention Tag:**
   ```text
   [ACTION:DEAL_RISK:{"dealName":"Apex Logistics","value":"$140,000","stage":"Negotiation","riskLevel":"High","suggestedActions":[{"id":"call","label":"Schedule Call","due":"Tomorrow 10 AM"},{"id":"pipeline","label":"Open Deal","path":"/crm/pipeline"}]}]
   ```

2. **Lead Creation Tag:**
   ```text
   [ACTION:CREATE_LEAD:{"name":"Marcus Vance","company":"Vance Energy","phone":"+1-555-0192","email":"m.vance@vance.com","budget":"$85,000","notes":"Interested in solar microgrids."}]
   ```

3. **Warehouse Inventory Alert Tag:**
   ```text
   [ACTION:INVENTORY_ALERT:{"category":"Warehouse Logistics","items":[{"name":"ECU Sensors","stock":4,"min":30}],"reorderPo":"PO-2026-X"}]
   ```

4. **HR Candidate Screening Tag:**
   ```text
   [ACTION:HR_SCREENING:{"role":"Senior ERP Engineer","candidates":[{"name":"Sarah Jenkins","score":"95%","experience":"9 yrs"}],"interviewRole":"Technical Lead"}]
   ```

5. **Task Scheduling Tag:**
   ```text
   [ACTION:SCHEDULE_TASK:{"title":"Follow up with Jordan Reed","dueDate":"Tomorrow 10:00 AM","priority":"High","assignee":"Alexander Wright"}]
   ```

6. **Page Navigation Tag:**
   ```text
   [ACTION:NAVIGATE:{"path":"/crm/pipeline","label":"Open Pipeline Kanban"}]
   ```

---

## 17. MASTER FAQ & TRAINING Q&A DATASET (50+ SCENARIOS)

Use these golden question-and-answer pairs to test and train your AI model:

#### Q1: What is CRM nErgy AI?
**A:** CRM nErgy AI is an autonomous, multi-tenant enterprise platform that unifies CRM (leads, contacts, deals, tasks), ERP (projects, inventory, procurement, manufacturing), HR, Multi-channel Communication, and 15 AI creative/analytical sub-studios under one roof. Its official motto is "Make AI Your Bestie".

#### Q2: What are the 8 sales pipeline stages in CRM nErgy?
**A:** The 8 verified pipeline stages are:
1. `NEW_LEAD` (New Lead)
2. `CONTACTED` (Contacted)
3. `QUALIFIED` (Qualified)
4. `OPPORTUNITY` (Opportunity)
5. `PROPOSAL` (Proposal)
6. `NEGOTIATION` (Negotiation)
7. `WON` (Closed Won)
8. `LOST` (Closed Lost)

#### Q3: How do I convert a Lead into an Account/Contact?
**A:** In `/crm/leads`, open any qualified lead and click "Convert to Contact". The system automatically converts the lead into an Address Book Contact (`Contact` record), creates a linked deal in the Pipeline, preserves all interaction history, and sets the lead's `convertedToContactId`.

#### Q4: How does the AI Voice Agent work?
**A:** Located at `/crm/ai-voice`, it uses a streaming 3-part pipeline:
1. Speech-to-Text (STT) transcribes voice input (Deepgram Nova-2 / Whisper).
2. Large Language Model (LLM) reasons over CRM data (GPT-4o / Claude / Gemini).
3. Text-to-Speech (TTS) synthesizes audio output (ElevenLabs / Cartesia / Web Speech) in real-time with visual equalizer feedback.

#### Q5: What are the 12 user roles supported by the RBAC engine?
**A:** 
1. Business Owner / Executive (`business_owner`)
2. Client & Customer Portal (`customer`)
3. AI Media & Video Creator (`content_creator`)
4. Campaign & Content Builder (`content_builder`)
5. Brand Ambassador & Influencer (`influencer`)
6. Affiliate Deal Partner (`affiliate_partner`)
7. AI Marketing Specialist (`ai_marketing_pro`)
8. Human Resources Director (`hr`)
9. Operations & Sales Admin (`operations_sales_admin`)
10. Finance & Compliance Admin (`finance_compliance_admin`)
11. CRM & Pipeline Specialist (`crm_pro`)
12. Master Super Administrator (`super_admin`)

#### Q6: How does the Inventory threshold alert work in ERP?
**A:** Each item in `InventoryItem` has a `quantity` and `minThreshold` (e.g. 50 units). When an ERP project or sales order depletes stock below `minThreshold`, the system marks the status as "Low Stock" or "Critical" and Zunme AI can automatically generate an `[ACTION:INVENTORY_ALERT]` to initiate a Purchase Order (`PurchaseOrder`).

#### Q7: Where are administrative messages sent through eBox routed?
**A:** Messages submitted in `/crm/admin/ebox` are encrypted and routed via SWMTP (Secured Web Message Transfer Protocol) directly to the Kiaan Tech Master Team for priority engineering support.

#### Q8: What is the 4-step framework used by AI Video Agent?
**A:** "Say it, See it, Shape it, Ship it":
- Step 1 (Say it): Core message and hook.
- Step 2 (See it): 4-shot visual storyboard.
- Step 3 (Shape it): Viral social captions and hashtags.
- Step 4 (Ship it): Production distribution checklist and aspect ratio specs.

#### Q9: Can Zunme AI create a lead directly from chat?
**A:** Yes. When a user asks Zunme AI to save a new lead, it extracts the details and returns an `[ACTION:CREATE_LEAD:{...}]` tag which the CRM client executes immediately, inserting the lead into the database and updating the UI without manual form entry.

#### Q10: How is multi-tenancy enforced in the database?
**A:** Multi-tenancy is enforced at the database level using Prisma. Every data model (`Lead`, `Contact`, `Deal`, `Task`, `ErpProject`, `HrEmployee`, etc.) includes a non-nullable `tenantId` linked to the `Tenant` table, and all API queries scope results by `where: { tenantId }`.

---
*End of Knowledge Base Memory File — Created for CRM nErgy AI Systems.*

