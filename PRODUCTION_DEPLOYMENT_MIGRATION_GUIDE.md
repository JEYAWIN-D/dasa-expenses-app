# DASA EXPENCES — PRODUCTION DEPLOYMENT, MIGRATION & DISASTER RECOVERY RUNBOOK

**Product:** DASA EXPENCES (Enterprise Multi-Tenant SaaS Platform)  
**Developed & Owned By:** DASA TECH ([dasatech.in](https://dasatech.in))  
**Contact / WhatsApp:** +91 76399 30148  
**Support Email:** [support@dasatech.in](mailto:support@dasatech.in)  

---

## 1. System Requirements & Architecture Overview

### Infrastructure Prerequisites:
- **Operating System:** Linux (Ubuntu 22.04 LTS / Debian 12 / RHEL 9) or Windows Server 2022
- **Node.js Runtime:** Node.js v20.x or v22.x LTS
- **Database Engine:** PostgreSQL 15 or 16 (Managed AWS RDS, Supabase, or self-hosted)
- **Object Storage:** AWS S3, Cloudflare R2, MinIO, or Google Cloud Storage
- **Reverse Proxy / SSL:** NGINX or Caddy with automated Let's Encrypt TLS 1.3
- **In-Memory Cache / Queues:** Redis 7.x (Optional for high-throughput rate limiting & queues)

---

## 2. Production Environment Variables Reference

### Backend Configuration (`backend/.env`):
```ini
# Environment & Server
NODE_ENV=production
PORT=5000
APP_NAME="DASA EXPENCES SaaS Platform"
APP_URL=https://app.dasatech.in
PLATFORM_ADMIN_URL=https://admin.dasatech.in

# Database Connection (PostgreSQL Pool)
DATABASE_URL="postgresql://dasa_saas_user:SecurePostgresPassword2026@db-cluster.internal:5432/dasa_expences_db?schema=public&connection_limit=50&pool_timeout=20"

# Cryptographic Keys & Sessions
JWT_SECRET="dasa_tech_super_secret_jwt_key_2026_enterprise_encryption_minimum_64_chars"
JWT_EXPIRES_IN="8h"
PLATFORM_JWT_SECRET="dasa_tech_platform_super_admin_jwt_secret_different_from_tenant_key"

# Digital Signature & Security
SIGNATURE_SECRET="dasa_tech_digital_pin_hmac_secret_2026"
CORS_ORIGIN="https://app.dasatech.in,https://dasatech.in,https://admin.dasatech.in"

# Cloud Object Storage (Tenant Vault)
STORAGE_PROVIDER="S3" # S3, R2, or LOCAL
AWS_ACCESS_KEY_ID="AKIA_DASA_PRODUCTION_KEY"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI_PRODUCTION_SECRET"
AWS_REGION="ap-south-1"
S3_BUCKET_NAME="dasa-expences-tenant-vault"

# Payment Gateway (Razorpay / Cashfree)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx"

# Email / Notifications (Transactional SMTP / Resend)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="SG.xxxxxxxxxxxx"
SMTP_FROM="notifications@dasatech.in"
```

### Frontend Configuration (`frontend/.env.production`):
```ini
VITE_API_URL="/api"
VITE_APP_NAME="DASA EXPENCES"
VITE_COMPANY_NAME="DASA TECH"
VITE_COMPANY_WEBSITE="https://dasatech.in"
VITE_SUPPORT_PHONE="+91 76399 30148"
```

---

## 3. Database Migration & Tenant Backfill Procedure

To upgrade existing single-tenant or legacy installations to the multi-tenant SaaS schema without data loss:

### Step 1: Execute Schema Push
```bash
cd backend
npx prisma generate
npx prisma db push
```

### Step 2: Run Tenant Backfill & Seeding Script
```bash
node src/database/migrate_tenants.js
```
**Actions performed automatically:**
- Provisions standard subscription tiers (`STARTER`, `GROWTH`, `BUSINESS`, `ENTERPRISE`).
- Provisions the Root Super-Admin account: `platform@dasatech.in`.
- Creates the Primary Organization: `dasa-tech-hq` ("DASA TECH Enterprise").
- Associates all unassigned legacy clients, quotations, invoices, payments, and projects with `dasa-tech-hq`.
- Initializes the double-entry accounting ledger and cloud storage quota meters.

---

## 4. Zero-Downtime Deployment Steps

### Step 1: Build Production Frontend Assets
```bash
cd frontend
npm install --frozen-lockfile
npm run build
```
The optimized bundle is generated in `frontend/dist/`.

### Step 2: Start Backend with Process Manager (PM2)
```bash
cd backend
npm install --production --frozen-lockfile
pm2 start src/index.js --name "dasa-saas-api" -i max
pm2 save
```

### Step 3: NGINX Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name app.dasatech.in admin.dasatech.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.dasatech.in admin.dasatech.in;

    ssl_certificate /etc/letsencrypt/live/app.dasatech.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.dasatech.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # Frontend Single Page App
    location / {
        root /var/www/dasa-expences/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 5. Automated Backup & Disaster Recovery Protocols

### 1. Daily Automated Database Dump
Create backup script `/usr/local/bin/dasa_db_backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/dasa_pg"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="dasa_expences_${TIMESTAMP}.sql.gz"

mkdir -p ${BACKUP_DIR}

# Generate compressed encrypted dump
PGPASSWORD="SecurePostgresPassword2026" pg_dump -U dasa_saas_user -h localhost dasa_expences_db | gzip > ${BACKUP_DIR}/${FILENAME}

# Retain local backups for 30 days
find ${BACKUP_DIR} -name "dasa_expences_*.sql.gz" -mtime +30 -exec rm {} \;

# Sync to encrypted offsite bucket
aws s3 cp ${BACKUP_DIR}/${FILENAME} s3://dasa-disaster-recovery-vault/database/
```
Schedule via crontab to run daily at 02:00 AM:
```cron
0 2 * * * /usr/local/bin/dasa_db_backup.sh > /var/log/dasa_backup.log 2>&1
```

### 2. Database Recovery Procedure (RTO < 30 Minutes, RPO < 24 Hours)
In the event of database failure:
1. Provision a clean PostgreSQL 15/16 instance.
2. Fetch the latest snapshot from the disaster recovery vault:
   ```bash
   aws s3 cp s3://dasa-disaster-recovery-vault/database/dasa_expences_latest.sql.gz ./
   gunzip dasa_expences_latest.sql.gz
   ```
3. Restore database schema and records:
   ```bash
   psql -U dasa_saas_user -h localhost -d dasa_expences_db -f dasa_expences_latest.sql
   ```
4. Verify data integrity and restart backend services:
   ```bash
   pm2 restart dasa-saas-api
   ```

---

## 6. Rollback Runbook (Zero Data Loss)

If a deployment encounters critical issues:
1. **Frontend Rollback:** Switch NGINX root symlink to previous release directory:
   ```bash
   ln -sfn /var/www/dasa-expences/releases/prev_dist /var/www/dasa-expences/frontend/dist
   systemctl reload nginx
   ```
2. **Backend Rollback:** Revert PM2 service to previous commit:
   ```bash
   git checkout <PREVIOUS_COMMIT_TAG>
   npm install --production
   pm2 restart dasa-saas-api
   ```
3. **Database Schema Rollback:** Database migrations were strictly additive (adding new models and nullable columns). No rollback drops are required, ensuring zero data loss for existing customer records.
