# CRM nErgy Database Schema & Models Inventory

Full inventory of the 23 Prisma database models and 5 Enums discovered in `backend/prisma/schema.prisma` and `crm-db (1).sql`.

---

## 1. PRISMA ENUMS

1. **`Role`**:
   - `BUSINESS_OWNER`, `CUSTOMER`, `CONTENT_CREATOR`, `CONTENT_BUILDER`, `INFLUENCER`, `AFFILIATE_PARTNER`, `AI_MARKETING_PRO`, `HR`, `OPERATIONS_SALES_ADMIN`, `FINANCE_COMPLIANCE_ADMIN`, `CRM_PRO`, `SUPER_ADMIN`.
2. **`DealStage`**:
   - `NEW_LEAD`, `CONTACTED`, `QUALIFIED`, `OPPORTUNITY`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST`.
3. **`LeadStatus`**:
   - `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `WON`, `LOST`.
4. **`Priority`**:
   - `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
5. **`TaskStatus`**:
   - `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
6. **`ActivityType`**:
   - `NOTE_ADDED`, `CALL_LOGGED`, `EMAIL_SENT`, `MEETING_HELD`, `STAGE_CHANGED`, `STATUS_CHANGED`, `LEAD_CONVERTED`, `TASK_CREATED`, `TASK_COMPLETED`.

---

## 2. PRISMA DATABASE MODELS (23 ENTITIES)

### 2.1 `Tenant` (Multi-Tenant Isolation Root)
- `id`: String (cuid primary key)
- `name`: String (Company Name)
- `domain`: String?
- `subscription`: String? (e.g. "ACTIVE", "ENTERPRISE")
- `status`: String?
- `parentId`: String? (Self-relation for franchise/sub-tenancy)
- `settings`: Json?
- `createdAt`, `updatedAt`: DateTime

### 2.2 `User` (Staff & System Accounts)
- `id`: String (cuid)
- `tenantId`: String (FK -> `Tenant`)
- `name`: String
- `email`: String (Unique)
- `password`: String (Bcrypt hashed)
- `role`: Enum `Role`
- `avatar`: String?
- `phone`: String?
- `status`: String ("ACTIVE", "INVITED", "DISABLED")
- `lastLogin`: DateTime?

### 2.3 `Lead` (Inbound Prospective Customers)
- `id`: String (cuid)
- `tenantId`: String (FK -> `Tenant`)
- `name`: String
- `email`: String?
- `phone`: String?
- `company`: String?
- `status`: Enum `LeadStatus`
- `score`: Int (0-100)
- `source`: String?
- `estimatedValue`: Decimal?
- `assignedToId`: String? (FK -> `User`)

### 2.4 `Contact` (Client & Partner Directory)
- `id`: String (cuid)
- `tenantId`: String (FK -> `Tenant`)
- `firstName`: String
- `lastName`: String
- `email`: String
- `phone`: String?
- `company`: String?
- `jobTitle`: String?
- `type`: String ("CUSTOMER", "LEAD", "PARTNER", "VENDOR")
- `lifecycleStage`: String?

### 2.5 `Deal` (Commercial Sales Opportunities)
- `id`: String (cuid)
- `tenantId`: String (FK -> `Tenant`)
- `title`: String
- `value`: Decimal
- `currency`: String (default "USD")
- `stage`: Enum `DealStage`
- `probability`: Int (0-100)
- `expectedCloseDate`: DateTime?
- `contactId`: String? (FK -> `Contact`)
- `leadId`: String? (FK -> `Lead`)
- `ownerId`: String? (FK -> `User`)

### 2.6 `Task` (Follow-ups & Deliverables)
- `id`: String (cuid)
- `tenantId`: String (FK -> `Tenant`)
- `title`: String
- `description`: String?
- `dueDate`: DateTime?
- `priority`: Enum `Priority`
- `status`: Enum `TaskStatus`
- `assignedToId`: String? (FK -> `User`)
- `relatedType`: String? ("LEAD", "DEAL", "CONTACT", "PROJECT")
- `relatedId`: String?

### 2.7 `Note` & `Activity` (Audit Log & Feed)
- `id`: String (cuid)
- `tenantId`: String (FK -> `Tenant`)
- `type`: Enum `ActivityType` (for `Activity`)
- `content`: Text
- `userId`: String (FK -> `User`)
- `createdAt`: DateTime

### 2.8 `ErpProject` (Delivery & Implementation)
- `id`: String (cuid)
- `tenantId`: String (FK -> `Tenant`)
- `name`: String
- `clientName`: String?
- `budget`: Decimal?
- `spent`: Decimal?
- `status`: String ("PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED")
- `progressPercentage`: Int

### 2.9 `PurchaseOrder` & `SalesOrder`
- `id`: String (cuid)
- `tenantId`: String (FK -> `Tenant`)
- `orderNumber`: String (Unique per tenant)
- `vendorName` / `customerName`: String
- `totalAmount`: Decimal
- `status`: String

### 2.10 `InventoryItem` (Warehouse Stock)
- `id`: String (cuid)
- `tenantId`: String (FK -> `Tenant`)
- `sku`: String
- `name`: String
- `quantityOnHand`: Int
- `reorderThreshold`: Int
- `unitPrice`: Decimal
- `location`: String?

### 2.11 `Invoice` & `LedgerAccount`
- Invoices track billing status, tax, discount, due date, and payment timestamps.
- LedgerAccounts track debits, credits, and chart of accounts hierarchy.

### 2.12 `HrEmployee` & `HrCandidate`
- `HrEmployee` stores payroll, hire date, department, emergency contacts.
- `HrCandidate` tracks candidate hiring status (`APPLIED` to `HIRED`), resume text, and interview scores.

### 2.13 `SupportTicket` & `KnowledgeArticle`
- Support tickets track SLA deadlines, agent assignments, customer message threads.
- Knowledge articles track public/internal help center guides.

### 2.14 `ProductionOrder`
- Tracks manufacturing runs, assigned BOM, quantity, and work center status.

### 2.15 `Communication` & `StaffCallSession`
- Stores SMS, WhatsApp, Email transcripts, and WebRTC audio call session metrics.

### 2.16 `Territory`
- Tracks geographical sales regions and rep quota allocations.

### 2.17 `EboxMessage`
- Encrypted administrative communication between client tenant and Kiaan Tech engineering via SWMTP.
