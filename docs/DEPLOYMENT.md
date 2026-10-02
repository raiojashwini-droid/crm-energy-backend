# CRM nErgy — Deployment & Operations Guide

## 🚀 Production Deployment Overview

The CRM nErgy backend is a stateless Node.js application designed for containerized or virtual machine hosting behind an SSL-terminating reverse proxy.

---

## 📋 Production Checklist

- [ ] Node.js runtime (v20+ LTS) installed on host.
- [ ] MySQL database server provisioned with automatic backups and read replicas (if high-traffic).
- [ ] Production `.env` securely populated with strong secrets.
- [ ] Production database migrations applied via `npx prisma migrate deploy`.
- [ ] Node server managed by a process manager (PM2 / Docker / Systemd).
- [ ] Reverse proxy (Nginx / Cloudflare) configured with HTTPS/SSL certificates.
- [ ] Centralized logging and error tracking (e.g. Sentry / Datadog) enabled.

---

## 🔐 Required Production Environment Variables

| Variable | Description | Example / Recommendation |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment identifier | `production` (disables stack traces in errors) |
| `PORT` | Listening HTTP port | `5000` (or dynamic platform port) |
| `DATABASE_URL` | Production MySQL connection string | `mysql://app_user:StrongPass@db-host:3306/crm_nergy` |
| `JWT_SECRET` | Cryptographic secret for signing tokens | Minimum 64-character random string |
| `JWT_EXPIRES_IN` | Access token lifespan | `1h` or `15m` |
| `CORS_ORIGIN` | Allowed web frontend origin | `https://crm.nergy.ai` |

---

## 🗄️ Database Migrations in Production

> **CRITICAL RULE**: Never run `prisma migrate dev` or `prisma db push` in production.

Apply pending schema migrations safely using:
```bash
npx prisma migrate deploy
```
This command applies all pending SQL migrations in `prisma/migrations/` sequentially without altering existing untracked tables or prompting for interactive input.

---

## 📦 Process Management with PM2

### 1. Ecosystem File (`ecosystem.config.js`)
```javascript
module.exports = {
  apps: [
    {
      name: 'crm-nergy-backend',
      script: 'src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
```

### 2. Startup Commands
```bash
# Start cluster
pm2 start ecosystem.config.js --env production

# View real-time logs
pm2 logs crm-nergy-backend

# Restart with zero downtime
pm2 reload crm-nergy-backend
```

---

## 🌐 Reverse Proxy Configuration (Nginx)

```nginx
server {
    listen 80;
    server_name api.crm.nergy.ai;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.crm.nergy.ai;

    ssl_certificate /etc/letsencrypt/live/api.crm.nergy.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.crm.nergy.ai/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
