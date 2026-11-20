# CRM nErgy REST API Inventory

Complete documentation of all backend REST endpoints discovered in `crm-energy personal/backend/src/routes/*.js`.

---

## 1. AUTHENTICATION & SESSION ENDPOINTS (`/api/auth`)

| Method | Endpoint | Description | Request Payload | Auth Required |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user credentials and return JWT token | `{ email, password, product? }` | No |
| `POST` | `/api/auth/register` | Register new user and organization tenant | `{ name, email, password, companyName }` | No |
| `GET` | `/api/auth/me` | Fetch active authenticated profile and tenant metadata | None | Yes (Bearer JWT) |
| `POST` | `/api/auth/logout` | Revoke session and invalidate tokens | None | Yes |
| `POST` | `/api/auth/refresh` | Refresh expired access token | `{ refreshToken }` | No |
| `POST` | `/api/auth/forgot-password` | Request password reset token via email | `{ email }` | No |
| `POST` | `/api/auth/reset-password` | Apply new password with token | `{ token, newPassword }` | No |

---

## 2. CORE CRM ENDPOINTS

### 2.1 Contacts (`/api/contacts`)
| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/contacts` | List contacts with pagination, search, and filtering | `?page=1&limit=25&search=...&type=...` |
| `POST` | `/api/contacts` | Create new contact record | `{ firstName, lastName, email, phone, company, type }` |
| `GET` | `/api/contacts/:id` | Retrieve single contact with timeline and associated deals | None |
| `PUT` | `/api/contacts/:id` | Update contact information | `{ ...fields }` |
| `DELETE` | `/api/contacts/:id` | Delete contact and cascade/unlink relations | None |

### 2.2 Leads (`/api/leads`)
| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/leads` | List commercial leads | `?status=...&source=...&search=...` |
| `POST` | `/api/leads` | Create new prospective lead | `{ name, email, phone, company, status, source }` |
| `GET` | `/api/leads/:id` | Retrieve lead details | None |
| `PUT` | `/api/leads/:id` | Update lead data and score | `{ ...fields }` |
| `POST` | `/api/leads/:id/convert`| Convert lead into Contact + Deal | `{ dealTitle, dealValue, targetDate }` |
| `DELETE` | `/api/leads/:id` | Remove lead record | None |

### 2.3 Deals & Sales Pipeline (`/api/deals`)
| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/deals` | List all deals grouped by Kanban stage | `?stage=...&repId=...` |
| `POST` | `/api/deals` | Create new sales deal | `{ title, value, stage, contactId, expectedCloseDate }` |
| `GET` | `/api/deals/:id` | Retrieve deal details and history | None |
| `PUT` | `/api/deals/:id` | Update deal parameters | `{ ...fields }` |
| `PATCH`| `/api/deals/:id/stage`| Update stage (drag-and-drop trigger) | `{ stage: "PROPOSAL" }` |
| `DELETE`| `/api/deals/:id` | Delete deal record | None |

### 2.4 Tasks & Reminders (`/api/tasks`)
| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/tasks` | List tasks for tenant/user | `?status=...&priority=...&due=today` |
| `POST` | `/api/tasks` | Create new task | `{ title, dueDate, priority, assignedToId }` |
| `PATCH`| `/api/tasks/:id/status`| Update status (e.g. mark completed) | `{ status: "COMPLETED" }` |
| `DELETE`| `/api/tasks/:id` | Delete task | None |

### 2.5 Activity Timeline & Notes (`/api/activities`, `/api/notes`)
| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/activities` | List recent events across system | `?limit=50&entityType=...&entityId=...` |
| `POST` | `/api/notes` | Add timestamped note to entity | `{ entityType, entityId, content }` |

---

## 3. ENTERPRISE ERP & OPERATIONS ENDPOINTS

### 3.1 ERP Projects (`/api/erp/projects`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/erp/projects` | List active client delivery projects |
| `POST` | `/api/erp/projects` | Create new implementation project |
| `GET` | `/api/erp/projects/:id` | Get project milestones, budget, and timesheets |

### 3.2 Inventory & Purchase Orders (`/api/erp`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/erp/inventory` | List SKU items, quantity on hand, reorder points |
| `POST` | `/api/erp/inventory` | Add new warehouse SKU |
| `PATCH`| `/api/erp/inventory/:id/stock` | Adjust stock count |
| `GET` | `/api/erp/purchase-orders` | List purchase orders with vendor status |
| `POST` | `/api/erp/purchase-orders` | Submit purchase order |
| `GET` | `/api/erp/sales-orders` | List sales orders for fulfillment |

### 3.3 Manufacturing (`/api/manufacturing`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/manufacturing/orders` | List production runs |
| `POST` | `/api/manufacturing/orders` | Schedule manufacturing work order |

### 3.4 Invoicing & Accounting (`/api/invoices`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/invoices` | List invoices with paid/unpaid status |
| `POST` | `/api/invoices` | Generate invoice for customer/deal |
| `PATCH`| `/api/invoices/:id/pay` | Record invoice payment |

---

## 4. HR & RECRUITING ENDPOINTS (`/api/hr`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/hr/employees` | List employee directory with department filters |
| `POST` | `/api/hr/employees` | Add new employee |
| `GET` | `/api/hr/candidates` | List ATS candidates in hiring pipeline |
| `POST` | `/api/hr/candidates` | Add new candidate |
| `PATCH`| `/api/hr/candidates/:id/stage` | Move candidate to next hiring stage |

---

## 5. CUSTOMER SUPPORT ENDPOINTS (`/api/support`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/support/tickets` | List support tickets with priority and status |
| `POST` | `/api/support/tickets` | Open new support ticket |
| `GET` | `/api/support/tickets/:id` | Ticket detail with message history |
| `POST` | `/api/support/tickets/:id/reply` | Post reply to customer ticket |
| `GET` | `/api/support/kb` | List public and internal knowledge base articles |

---

## 6. SECURED eBox & SWMTP ENDPOINTS (`/api/ebox`, `/api/swmtp`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ebox/messages` | Retrieve administrative messages sent to/from Kiaan Tech |
| `POST` | `/api/ebox/messages` | Transmit encrypted support hotline dispatch |
| `POST` | `/api/swmtp/send` | Transmit message over SWMTP protocol |
| `GET` | `/api/swmtp/inbox` | Ingest SWMTP inbound messages |
