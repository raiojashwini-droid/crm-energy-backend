# CRM nErgy — Local Development Setup Guide

This guide details how to set up, configure, run, and verify the CRM nErgy backend locally.

---

## 💻 Prerequisites

Ensure the following tools are installed on your workstation:

1. **Node.js**: Version `20.x` or `24.x` (LTS recommended)
   - Verify with: `node -v`
2. **npm**: Version `10.x` or later
   - Verify with: `npm -v`
3. **XAMPP / MySQL**:
   - Ensure MySQL is started in XAMPP Control Panel (or via `C:\xampp\mysql\bin\mysqld.exe`).
   - Verified listening on port `3306`.
   - Default XAMPP credentials: user `root`, empty password.

---

## 🛠️ Step-by-Step Installation

### Step 1: Open Backend Directory
Navigate to the backend directory:
```bash
cd d:\Kiaan\crm\backend
```

### Step 2: Install Node Dependencies
Install all required production and development dependencies:
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the template `.env.example` to create your active `.env`:
```bash
cp .env.example .env
```
Open `.env` and verify your local XAMPP MySQL configuration:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://root@localhost:3306/crm-db"
JWT_SECRET=dev_crm_nergy_secret_key_step1
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```
> **Note**: Standard XAMPP installations use username `root` with no password and connect to local database `crm-db` (`mysql://root@localhost:3306/crm-db`).
> **Important**: Never commit your `.env` file to Git.

### Step 4: Validate Prisma Schema
Verify that Prisma CLI can read and validate your schema:
```bash
npm run prisma:validate
```
Expected output:
```text
The schema at prisma\schema.prisma is valid 🚀
```

### Step 5: Start the Development Server
Launch the server with live hot-reloading:
```bash
npm run dev
```
Expected console output:
```text
[nodemon] starting `node src/server.js`
CRM nErgy API Server running on port 5000 [development]
```

---

## 🧪 Verification

### 1. Test Health Endpoint
Open a terminal and run:
```bash
curl -i http://localhost:5000/api/health
```
Expected response:
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"success":true,"message":"CRM nErgy API is running"}
```

### 2. Test 404 Route Handler
```bash
curl -i http://localhost:5000/api/unknown-test
```
Expected response:
```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8

{"success":false,"message":"Resource not found: GET /api/unknown-test"}
```

---

## 🔧 Common Troubleshooting Scenarios

### Issue 1: `Port 5000 is already in use`
- **Cause**: Another node process or application is occupying port 5000.
- **Resolution**: Update `PORT=5001` in your `.env` file or kill the existing process occupying port 5000.

### Issue 2: `Host 'localhost' is not allowed to connect to this MariaDB/MySQL server`
- **Cause**: The database user in `DATABASE_URL` doesn't have privileges for `localhost` or requires IPv4 address `127.0.0.1`.
- **Resolution**: Update host in `DATABASE_URL` from `localhost` to `127.0.0.1` or verify your MySQL user grant permissions:
  ```sql
  GRANT ALL PRIVILEGES ON crm_nergy.* TO 'your_user'@'localhost' IDENTIFIED BY 'your_password';
  FLUSH PRIVILEGES;
  ```

### Issue 3: `You don't have any models defined in your schema.prisma`
- **Cause**: This is normal during Phase 2 before models are written in Phase 3.
- **Resolution**: Models will be added during Step 3 (Database Modeling).
