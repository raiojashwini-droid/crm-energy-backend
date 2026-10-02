# CRM nErgy — API Documentation & Contracts

## 🌐 Base URL & Protocol

- **Protocol**: HTTP / HTTPS
- **Base Path**: `/api`
- **Default Port**: `5000`
- **Content-Type**: `application/json`

---

## 🟢 Currently Active Endpoints

### 1. Health Check
Checks if the server is active and responding.

- **Route**: `GET /api/health`
- **Auth**: None (Public)
- **Status Code**: `200 OK`
- **Response**:
```json
{
  "success": true,
  "message": "CRM nErgy API is running"
}
```

### 2. Undefined Route Handler (404)
Catches all requests to non-existent paths.

- **Route**: `*` (Any undefined route)
- **Status Code**: `404 Not Found`
- **Response**:
```json
{
  "success": false,
  "message": "Resource not found: GET /api/unknown"
}
```

---

## 📋 Planned API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user or tenant account | Public |
| `POST` | `/api/auth/login` | Authenticate and return JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Bearer Token |
| `POST` | `/api/auth/refresh` | Refresh expired access token | Bearer Token |
| `POST` | `/api/auth/logout` | Revoke session / tokens | Bearer Token |

### 👥 Users & Team (`/api/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | List tenant users (paginated) | Admin / Manager |
| `GET` | `/api/users/:id` | Get user details by ID | Authenticated |
| `POST` | `/api/users` | Invite / create user | Admin |
| `PUT` | `/api/users/:id` | Update user details & role | Admin |
| `DELETE` | `/api/users/:id` | Deactivate user account | Admin |

### 🎯 Leads (`/api/leads`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leads` | List leads (filtering, search, pagination) | Authenticated |
| `GET` | `/api/leads/:id` | Get single lead with notes & activities | Authenticated |
| `POST` | `/api/leads` | Create new lead record | Authenticated |
| `PUT` | `/api/leads/:id` | Update lead status, owner, details | Authenticated |
| `DELETE` | `/api/leads/:id` | Archive or delete lead | Manager / Admin |
| `POST` | `/api/leads/:id/convert` | Convert lead into Deal + Contact | Authenticated |

### 📇 Contacts (`/api/contacts`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/contacts` | List contacts with filtering & pagination | Authenticated |
| `GET` | `/api/contacts/:id` | Get contact profile and deals history | Authenticated |
| `POST` | `/api/contacts` | Create new contact | Authenticated |
| `PUT` | `/api/contacts/:id` | Update contact information | Authenticated |
| `DELETE` | `/api/contacts/:id` | Delete contact | Manager / Admin |

### 💼 Deals & Pipeline (`/api/deals`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/deals` | List deals grouped by pipeline stages | Authenticated |
| `GET` | `/api/deals/:id` | Get deal details, stage history, and value | Authenticated |
| `POST` | `/api/deals` | Create new pipeline deal | Authenticated |
| `PATCH` | `/api/deals/:id/stage` | Update deal stage (drag & drop support) | Authenticated |
| `PUT` | `/api/deals/:id` | Update full deal details | Authenticated |
| `DELETE` | `/api/deals/:id` | Delete deal | Manager / Admin |

### ✅ Tasks (`/api/tasks`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | List assigned tasks by due date & priority | Authenticated |
| `POST` | `/api/tasks` | Create task linked to lead/deal/user | Authenticated |
| `PATCH` | `/api/tasks/:id/status`| Toggle completed status | Authenticated |
| `PUT` | `/api/tasks/:id` | Edit task details | Authenticated |
| `DELETE` | `/api/tasks/:id` | Delete task | Authenticated |

### 📝 Notes & Activities (`/api/notes`, `/api/activities`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notes?targetType=lead&targetId=1` | Get contextual notes | Authenticated |
| `POST` | `/api/notes` | Create note on record | Authenticated |
| `GET` | `/api/activities` | List timeline events | Authenticated |
| `POST` | `/api/activities` | Log call, email, or meeting | Authenticated |

---

## 📦 Standard Response Envelopes

### 1. Standard Success Response
```json
{
  "success": true,
  "data": {
    "id": 101,
    "name": "Acme Corp Lead",
    "status": "QUALIFIED"
  },
  "message": "Lead updated successfully"
}
```

### 2. Standard Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### 3. Standard Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address format"
    }
  ]
}
```
