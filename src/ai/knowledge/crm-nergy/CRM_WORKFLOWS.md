# CRM nErgy Business Workflows & Autonomous Protocols

Step-by-step documentation of verified cross-module workflows and autonomous AI execution sequences in CRM nErgy.

---

## 1. LEAD-TO-CASH SALES & OPERATIONS WORKFLOW

```mermaid
flowchart TD
    A[Inbound Lead Captured] --> B[AI Qualification & Scoring]
    B --> C[Sales Rep Contact & BANT Verification]
    C --> D[1-Click Lead Conversion]
    D --> E[Contact, Account & Deal Created]
    E --> F[Sales Pipeline Kanban Progression]
    F --> G[Deal Reaches WON Stage]
    G --> H[Automated ERP Sales Order Triggered]
    H --> I[Warehouse Stock Checked & Reserved]
    I --> J[Analytic Invoice Dispatched to Customer]
    J --> K[Payment Reconciliation via Stripe/Bank]
```

### 1.1 Detailed Operational Steps:
1. **Lead Ingestion:** Inbound lead arrives via Website form, cold outreach campaign, referral, or AI inbound voice agent.
2. **AI Qualification:** Lead receives an automated score (0-100) based on title, company size, and budget alignment.
3. **Contact & Pipeline:** Assigned sales rep conducts discovery calls; moves deal through Kanban (`CONTACTED` -> `QUALIFIED` -> `PROPOSAL` -> `NEGOTIATION`).
4. **Deal Won:** When status moves to `WON`, the system automatically generates an active `ErpProject` for onboarding, provisions an initial invoice draft, and decrements warehouse stock.

---

## 2. REQUISITION-TO-PAYMENT PROCUREMENT WORKFLOW

```mermaid
flowchart LR
    A[Low Stock Threshold Reached] --> B[Automated Purchase Order Drafted]
    B --> C[Operations Admin Review & Bidding]
    C --> D[Finance Admin Approval]
    D --> E[Vendor Dispatch]
    E --> F[Shipment Received & Inspected]
    F --> G[Warehouse Stock Incremented]
```

### 2.1 Detailed Operational Steps:
1. **Trigger:** Inventory item quantity on hand drops below `reorderThreshold`.
2. **Requisition:** A draft purchase order (`DRAFT`) is generated specifying the required quantity and preferred vendor.
3. **Approval:** Operations Admin submits order for review; Finance Admin approves commercial terms.
4. **Reception:** When goods arrive at the loading dock, receiving staff inspects items and clicks **"Receive Shipment"**, which immediately updates `quantityOnHand` in `InventoryItem`.

---

## 3. TALENT REQUISITION & ATS CANDIDATE WORKFLOW

```mermaid
flowchart TD
    A[Job Requisition Created in /crm/hr/jobs] --> B[Inbound Candidate Applications Ingested]
    B --> C[AI Resume Skills Extraction & Candidate Score]
    C --> D[HR Director Moves Candidate to Interview Stage]
    D --> E[Calendar Invites Sent to Interview Panel]
    E --> F[Scorecards & Feedback Submitted]
    F --> G[Offer Letter Generated]
    G --> H[1-Click Hire Creates HrEmployee Record]
```

---

## 4. CUSTOMER SUPPORT RESOLUTION & SLA ESCALATION

```mermaid
flowchart LR
    A[Customer Opens Ticket] --> B[SLA Countdown Timer Starts]
    B --> C[Ticket Assigned by Priority]
    C --> D[Agent Direct Reply or AI FAQ Match]
    D --> E[Customer Verifies Resolution]
    E --> F[Ticket Closed & CSAT Survey Dispatched]
```

---

## 5. ZUNME AI / BESTIE AI JSON ACTION EXECUTION PROTOCOL

When the user gives natural language instructions to **Zunme AI**, the AI parses intent into strict executable JSON action blocks:

### 5.1 Create Lead Action:
```json
{
  "action": "CREATE_LEAD",
  "parameters": {
    "name": "Sarah Connor",
    "email": "sarah@cyberdyne.com",
    "company": "Cyberdyne Systems",
    "estimatedValue": 75000,
    "source": "AI_AGENT"
  }
}
```

### 5.2 Update Deal Stage Action:
```json
{
  "action": "UPDATE_DEAL_STAGE",
  "parameters": {
    "dealId": "deal_xyz123",
    "newStage": "PROPOSAL",
    "note": "Proposal delivered via email with 15% annual commitment discount."
  }
}
```

### 5.3 Schedule Task Action:
```json
{
  "action": "SCHEDULE_TASK",
  "parameters": {
    "title": "Quarterly Business Review with Acme Corp",
    "dueDate": "2026-11-15T10:00:00Z",
    "priority": "HIGH",
    "assignedTo": "user_sales_lead"
  }
}
```

### 5.4 Check Inventory Action:
```json
{
  "action": "CHECK_INVENTORY",
  "parameters": {
    "sku": "SOLAR-INV-5KW"
  }
}
```
