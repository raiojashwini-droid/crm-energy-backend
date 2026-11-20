# CRM nErgy Features, Input Fields & UI Actions

Detailed specification of forms, inputs, buttons, tables, filters, and UI interactive elements across CRM nErgy.

---

## 1. CONTACTS & ACCOUNTS

### 1.1 Form Fields (Create / Edit Contact)
- **First Name:** Text input (`required`, min: 2 chars)
- **Last Name:** Text input (`required`, min: 2 chars)
- **Email:** Email input (`required`, RFC 5322 validation)
- **Phone:** Tel input (international E.164 format supported)
- **Job Title:** Text input (e.g. "VP of Engineering")
- **Company / Organization:** Dropdown / Text input
- **Contact Type:** Dropdown (`LEAD`, `CUSTOMER`, `PARTNER`, `VENDOR`)
- **Lifecycle Stage:** Dropdown (`SUBSCRIBER`, `LEAD`, `OPPORTUNITY`, `CUSTOMER`, `EVANGELIST`)
- **LinkedIn Profile:** URL input
- **Address:** Multi-field (Street, City, State, Postal Code, Country)
- **Custom Notes:** Textarea

### 1.2 Table Columns
`Name` (with avatar initials) | `Email` | `Phone` | `Company` | `Type Badge` | `Last Contacted` | `Action Menu` (3 dots)

### 1.3 Actions & Buttons
- `Add Contact` (Opens drawer/modal)
- `Import Contacts` (CSV upload modal with column mapping)
- `Export CSV` (Downloads filtered list)
- `Bulk Delete` (Requires confirmation dialog)
- `Quick Call` (Triggers WebRTC dialer)
- `Send Direct Email` (Opens composer)

---

## 2. LEADS MANAGEMENT

### 2.1 Form Fields (Create / Edit Lead)
- **Full Name:** Text input
- **Business Email:** Email input
- **Phone Number:** Tel input
- **Company Name:** Text input
- **Lead Source:** Dropdown (`WEBSITE`, `REFERRAL`, `COLD_CALL`, `LINKEDIN`, `AI_INBOUND`, `EVENT`)
- **Estimated Deal Value:** Number input (with currency selector)
- **Status:** Dropdown (`NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `WON`, `LOST`)
- **AI Qualification Score:** Read-only / Auto-computed badge (0-100)

### 2.2 Table Columns & Filters
- **Columns:** `Lead Name` | `Company` | `Status` | `AI Score` | `Source` | `Assigned To` | `Created At` | `Actions`
- **Filters:** Search keyword, Filter by Status, Filter by Score (>70 = High Intent), Filter by Date Range.

### 2.3 Special Actions
- `Convert Lead`: Automatically creates a new `Contact` record, opens a `Deal` creation dialog, and marks lead status as `WON`.
- `Run AI Qualification`: Analyzes lead parameters against company ICP (Ideal Customer Profile).

---

## 3. SALES PIPELINE & KANBAN

### 3.1 Kanban Board Layout
- **8 Ordered Columns:**
  1. **New Lead** (default 10% win probability)
  2. **Contacted** (20% win probability)
  3. **Qualified** (40% win probability)
  4. **Opportunity** (60% win probability)
  5. **Proposal** (75% win probability)
  6. **Negotiation** (90% win probability)
  7. **Closed Won** (100% win probability)
  8. **Closed Lost** (0% win probability)

### 3.2 Deal Card Elements
- Deal Title & Company
- Deal Value (e.g. `$45,000 USD`)
- Associated Contact Name
- Target Close Date badge (colored red if overdue)
- AI Risk Warning pill (e.g. "Inactive for 14 days")
- Drag Handle for column transition

---

## 4. ENTERPRISE ERP FORMS & TABLES

### 4.1 Purchase Orders Form
- **Vendor Selection:** Dropdown
- **PO Number:** Auto-generated sequence (`PO-2026-XXXX`)
- **Line Items Table:** Item SKU, Description, Quantity, Unit Cost, Tax %, Line Total
- **Delivery Date:** Date picker
- **Shipping Address:** Dropdown / Text
- **Total Amount:** Auto-computed sum

### 4.2 Warehouse Inventory Management
- **SKU Code:** Unique string identifier
- **Item Name:** Text input
- **Category:** Dropdown (`RAW_MATERIALS`, `WORK_IN_PROGRESS`, `FINISHED_GOODS`)
- **Stock on Hand:** Number input
- **Reorder Threshold:** Alert trigger number
- **Unit Cost & Retail Price:** Currency numbers
- **Location / Bin:** Warehouse code (e.g. `WH1-A12`)

---

## 5. HR & RECRUITING

### 5.1 Employee Profile Form
- **Personal Details:** Full name, personal email, date of birth, emergency contact.
- **Employment Details:** Work email, employee ID (`EMP-XXXX`), job title, department (`Sales`, `Engineering`, `Finance`, `Support`, `Operations`), manager ID.
- **Compensation:** Base salary, pay frequency (`MONTHLY`, `BI_WEEKLY`), currency.
- **Documents:** Identification proof, employment contract, tax forms.

### 5.2 ATS Candidate Flow
- **Candidate Name:** Text input
- **Resume File:** PDF / DOCX upload with instant preview
- **Applied Position:** Dropdown of open job requisitions
- **Stage Pill:** `Applied` -> `Screening` -> `Interview` -> `Offer` -> `Hired` -> `Rejected`
- **Interviewer Feedback Scorecard:** Rating (1-5 stars) and qualitative remarks.

---

## 6. CUSTOMER SUPPORT TICKETING

### 6.1 Ticket Form Fields
- **Customer / Contact:** Dropdown search
- **Subject:** Text input
- **Priority:** Dropdown (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- **Category:** Dropdown (`BILLING`, `TECHNICAL`, `FEATURE_REQUEST`, `BUG`)
- **Description:** Rich text editor supporting attachments and screenshots
- **SLA Deadline:** Auto-computed based on priority (Critical = 2h, High = 8h, Standard = 24h)

---

## 7. AI BESTIE & VOICE AGENT UI CONTROLS

### 7.1 Bestie AI Chatbox
- Natural language input bar with auto-resizing textarea
- Suggested quick prompts (e.g., "Analyze Q4 pipeline risks", "Draft proposal for Acme Corp", "Which invoices are overdue?")
- Executable Action Card: Previews parsed JSON parameters with an **"Approve & Execute"** button before applying changes to database.

### 7.2 AI Voice Agent Interface
- **Microphone Toggle Button:** Pulsing visual state when active.
- **Audio Waveform Visualizer:** 32-bar real-time frequency visualizer reflecting voice amplitude.
- **Live Transcript Panel:** Real-time conversational dialogue turns.
- **Mute / Hang Up Buttons.**
