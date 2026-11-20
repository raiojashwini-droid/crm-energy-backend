# CRM nErgy Module Inventory

Comprehensive functional documentation of every module discovered in CRM nErgy source code and documentation.

---

## 1. CORE CRM MODULES

### 1.1 Dashboard (`/crm/dashboard`)
- **Purpose:** Central executive overview of sales velocity, revenue metrics, active pipeline, and high-priority tasks.
- **Features:** KPI metric cards (Total Revenue, Win Rate, Open Deals, Active Leads), revenue forecast chart, recent activity feed, quick action modal triggers.
- **Buttons & Actions:** "New Lead", "New Deal", "Schedule Task", "Quick Call", Date filter picker.
- **Related Modules:** Leads, Pipeline, Tasks, Activity Stream.
- **Backend APIs:** `GET /api/leads`, `GET /api/deals`, `GET /api/tasks`, `GET /api/activities`.

### 1.2 Contacts Directory (`/crm/contacts`)
- **Purpose:** Directory and 360-degree relationship record for individual people across client and partner accounts.
- **Fields:** `firstName`, `lastName`, `email`, `phone`, `jobTitle`, `company`, `type` (LEAD, CUSTOMER, PARTNER, VENDOR), `lifecycleStage`, `socialLinks`, `customFields`.
- **Buttons & Actions:** "Add Contact", "Import CSV", "Export", "Search", Filter by Type, View Detail (`/crm/contacts/:id`), Call Contact, Send Email.
- **Workflow:** Contact created manually or converted from Lead -> Associated with Deals & Communications -> Timeline records notes, calls, emails.
- **Backend APIs:** `GET /api/contacts`, `POST /api/contacts`, `GET /api/contacts/:id`, `PUT /api/contacts/:id`, `DELETE /api/contacts/:id`.
- **Database Model:** `Contact` (foreign key to `Tenant`, relation to `Deal`, `Activity`, `Communication`).

### 1.3 Leads Directory (`/crm/leads`)
- **Purpose:** Ingestion and qualification pipeline for prospective customers.
- **Fields:** `name`, `email`, `phone`, `company`, `status` (`NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `WON`, `LOST`), `score` (0-100), `source` (WEBSITE, REFERRAL, COLD_OUTREACH, AI_AGENT), `notes`.
- **Buttons & Actions:** "Add Lead", "Convert to Deal", "Change Status", "AI Lead Score", "Bulk Delete", "Filter by Source".
- **Workflow:** Lead ingested -> Assigned to sales rep -> Contacted -> Qualified -> 1-click Convert creates Contact, Deal, and Account simultaneously.
- **Backend APIs:** `GET /api/leads`, `POST /api/leads`, `PUT /api/leads/:id`, `POST /api/leads/:id/convert`, `DELETE /api/leads/:id`.
- **Database Model:** `Lead`.

### 1.4 Sales Pipeline (`/crm/pipeline`)
- **Purpose:** Visual drag-and-drop Kanban board managing active deal stages.
- **8 Stages:**
  1. `NEW_LEAD`: Inbound opportunity identified.
  2. `CONTACTED`: Sales rep initiated communication.
  3. `QUALIFIED`: Budget, Authority, Need, and Timeline (BANT) confirmed.
  4. `OPPORTUNITY`: Active discovery session held.
  5. `PROPOSAL`: Formal quotation or contract submitted.
  6. `NEGOTIATION`: Commercial and legal terms under review.
  7. `WON`: Closed successful deal.
  8. `LOST`: Closed lost opportunity with reason recorded.
- **Fields:** `title`, `value`, `currency`, `stage`, `probability`, `expectedCloseDate`, `contactId`, `leadId`.
- **Buttons & Actions:** Drag card across columns, "New Deal", Filter by Rep/Value, Open Deal Modal, Mark as Won/Lost.
- **Backend APIs:** `GET /api/deals`, `POST /api/deals`, `PUT /api/deals/:id`, `PATCH /api/deals/:id/stage`.
- **Database Model:** `Deal`.

### 1.5 Tasks & Reminders (`/crm/tasks`)
- **Purpose:** Daily action planner for follow-ups, calls, and project deliverables.
- **Fields:** `title`, `description`, `dueDate`, `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), `status` (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), `assignedToId`.
- **Buttons & Actions:** "New Task", Toggle Complete checkbox, Filter by Due Date (Today, Overdue, Upcoming), Delete Task.
- **Backend APIs:** `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `PATCH /api/tasks/:id/status`.
- **Database Model:** `Task`.

### 1.6 Communication Hub (`/crm/communication`)
- **Purpose:** Unified messaging inbox covering SMS, WhatsApp, Email, and Staff Calling.
- **Features:** Split-pane chat layout, channel switcher, template insertion, message status (sent, delivered, read), staff WebRTC audio calling.
- **Buttons & Actions:** "Start Call", "Send SMS", "Send WhatsApp", "Send Email", Attach File, Search Messages.
- **Backend APIs:** `GET /api/communications`, `POST /api/communications`, `GET /api/communications/history`.
- **Database Model:** `Communication`, `StaffCallSession`.

### 1.7 Territory Management (`/crm/territory`)
- **Purpose:** Geographical and market segment zoning for sales quota distribution.
- **Fields:** `name`, `code`, `region` (North America, LATAM, EMEA, APAC), `quota`, `assignedRepIds`, `status`.
- **Buttons & Actions:** "Create Territory", "Assign Rep", "Rebalance Quotas", View Zone Map.
- **Backend APIs:** `GET /api/territories`, `POST /api/territories`, `PUT /api/territories/:id`.
- **Database Model:** `Territory`.

---

## 2. ENTERPRISE ERP & OPERATIONS MODULES

### 2.1 ERP Dashboard & Projects (`/crm/erp`, `/crm/erp/projects`)
- **Purpose:** Post-sales delivery, client onboarding, and technical implementation tracking.
- **Fields:** `name`, `clientName`, `budget`, `spent`, `startDate`, `targetDate`, `status` (`PLANNING`, `IN_PROGRESS`, `ON_HOLD`, `DELIVERED`), `progressPercentage`.
- **Buttons & Actions:** "Create Project", "Add Milestone", "Log Billable Hours", Export Timesheet.
- **Backend APIs:** `GET /api/erp/projects`, `POST /api/erp/projects`, `GET /api/erp/projects/:id`.
- **Database Model:** `ErpProject`.

### 2.2 Procurement & Purchase Orders (`/crm/erp/procurement`)
- **Purpose:** Vendor sourcing, supply purchasing, and procurement invoice management.
- **Fields:** `orderNumber`, `vendorName`, `totalAmount`, `status` (`DRAFT`, `SUBMITTED`, `APPROVED`, `FULFILLED`), `items` (JSON).
- **Buttons & Actions:** "New Purchase Order", "Approve Order", "Receive Shipment", "Export PDF".
- **Backend APIs:** `GET /api/erp/purchase-orders`, `POST /api/erp/purchase-orders`, `PATCH /api/erp/purchase-orders/:id/status`.
- **Database Model:** `PurchaseOrder`.

### 2.3 Sales Orders (`/crm/erp/sales-orders`)
- **Purpose:** Commercial contract execution and shipping fulfillment.
- **Fields:** `orderNumber`, `customerName`, `dealId`, `totalAmount`, `paymentStatus`, `fulfillmentStatus`.
- **Buttons & Actions:** "Generate Sales Order", "Fulfill Order", "Create Invoice".
- **Backend APIs:** `GET /api/erp/sales-orders`, `POST /api/erp/sales-orders`.
- **Database Model:** `SalesOrder`.

### 2.4 Warehouse Inventory (`/crm/erp/inventory`)
- **Purpose:** Stock levels, SKU tracking, reorder alerts, and bin locations.
- **Fields:** `sku`, `name`, `quantityOnHand`, `reorderThreshold`, `unitPrice`, `location`.
- **Buttons & Actions:** "Add Item", "Adjust Stock", "Stock Count Audit", "Low Stock Alert".
- **Backend APIs:** `GET /api/erp/inventory`, `POST /api/erp/inventory`, `PATCH /api/erp/inventory/:id/stock`.
- **Database Model:** `InventoryItem`.

### 2.5 Manufacturing & Production (`/crm/erp/manufacturing`)
- **Purpose:** Bill of Materials (BOM), shop-floor routing, and production run execution.
- **Fields:** `orderNumber`, `productName`, `quantityToProduce`, `startDate`, `status` (`SCHEDULED`, `RUNNING`, `COMPLETED`, `HALTED`).
- **Buttons & Actions:** "New Production Order", "Start Run", "Complete Run", "BOM Builder".
- **Backend APIs:** `GET /api/manufacturing/orders`, `POST /api/manufacturing/orders`.
- **Database Model:** `ProductionOrder`.

### 2.6 Analytic Accounting & Invoices (`/features/analytic-accounting`)
- **Purpose:** Accounts receivable, client invoicing, payment reconciliation, and chart of accounts.
- **Fields:** `invoiceNumber`, `customerName`, `amount`, `taxAmount`, `dueDate`, `status` (`UNPAID`, `PAID`, `OVERDUE`).
- **Buttons & Actions:** "Create Invoice", "Send Payment Link", "Record Payment", "Export Ledger".
- **Backend APIs:** `GET /api/invoices`, `POST /api/invoices`, `PATCH /api/invoices/:id/pay`.
- **Database Model:** `Invoice`, `LedgerAccount`.

---

## 3. HR & TALENT RECRUITING MODULES

### 3.1 Employee Directory (`/crm/hr`)
- **Fields:** `fullName`, `email`, `jobTitle`, `department`, `salary`, `hireDate`, `status` (`ACTIVE`, `ON_LEAVE`, `TERMINATED`).
- **Buttons & Actions:** "Add Employee", "Edit Profile", "Generate Paycheck", "Assign Manager".
- **Database Model:** `HrEmployee`.

### 3.2 Candidate ATS Pipeline (`/crm/hr/candidates`)
- **Stages:** `APPLIED`, `SCREENING`, `INTERVIEW_SCHEDULED`, `OFFER_EXTENDED`, `HIRED`, `REJECTED`.
- **Features:** Resume preview, AI skills extraction, candidate score, interview scheduling.
- **Database Model:** `HrCandidate`.

---

## 4. CUSTOMER SUPPORT & SERVICE DESK

### 4.1 Ticket Management (`/crm/support`, `/crm/support/tickets`)
- **Fields:** `ticketNumber`, `subject`, `customerName`, `priority` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `status` (`OPEN`, `PENDING_CUSTOMER`, `RESOLVED`, `CLOSED`), `assignedAgentId`.
- **Database Model:** `SupportTicket`.

### 4.2 Knowledge Base (`/crm/knowledge-base`)
- **Fields:** `title`, `slug`, `category`, `content`, `isPublic`, `viewCount`.
- **Database Model:** `KnowledgeArticle`.

---

## 5. AI SUPERHOUSE ENGINES

### 5.1 Zunme AI / Bestie AI (`/crm/bestie`)
- **Capabilities:** Autonomous conversational copilot capable of parsing natural language and triggering executable JSON actions:
  - `CREATE_LEAD`
  - `UPDATE_DEAL_STAGE`
  - `SCHEDULE_TASK`
  - `CHECK_INVENTORY`
  - `CALCULATE_PIPELINE_RISK`
  - `DRAFT_CUSTOMER_REPLY`

### 5.2 AI Voice Agent (`/crm/ai-voice`)
- **Capabilities:** Low-latency bi-directional voice pipeline with microphone streaming, real-time waveform visualizer, and dynamic transcript cards.

### 5.3 AI Video Studio (`/crm/ai-video`)
- **Capabilities:** Text-to-Video generation, talking avatar rendering, script writing, video captioning, and brand video export.

### 5.4 AI Marketing Hub (`/crm/marketing`)
- **Capabilities:** Multi-channel campaign builder, automated email sequence generation, social media post scheduler, and ad creative optimizer.

---

## 6. ADMINISTRATIVE & SECURITY ENGINES

### 6.1 Organization Administration (`/crm/admin`)
- **Capabilities:** Multi-tenant provisioning, user seat licenses, RBAC permissions assignment, and system audit logs.

### 6.2 Secured eBox (SEA) (`/crm/ebox`)
- **Capabilities:** Encrypted administrative communication channel connecting client enterprise admins directly with Kiaan Tech engineering via the SWMTP protocol.
- **Database Model:** `EboxMessage`.
