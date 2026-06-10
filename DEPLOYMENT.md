# JobPickers cPanel Deployment & Architecture Guide

This guide details the technical setup, hosting configuration, and deployment pipeline for JobPickers. It is created for any developer or AI assistant working on this codebase.

---

## 🏗️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite (via Prisma ORM)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Local Runtime**: Node.js v20.11.0 (Portable installation located at `.node/`)

---

## 🌐 Production Environment (cPanel)
- **Hosting Type**: cPanel Shared Hosting
- **Node.js Wrapper**: Phusion Passenger (managed via **Setup Node.js App** in cPanel)
- **Node.js version**: 20.x / 22.x
- **Application Directory**: `/home2/job/jobpickers.com`
- **Application Startup File**: `server.js` (Custom HTTP server wrapper to boot Next.js on Passenger)

### Database & Environments on Server
- **Database File**: `/home2/job/jobpickers.com/prisma/dev.db` (safely excluded from Git uploads)
- **Environment Settings**: Stored inside `/home2/job/jobpickers.com/.env` on the server:
  - `DATABASE_URL="file:./dev.db"`
  - `NEXTAUTH_SECRET="..."`
  - `NEXTAUTH_URL="https://jobpickers.com"`
  - `NEXT_PUBLIC_SITE_URL="https://jobpickers.com"`
  - `CRON_SECRET="..."`

---

## 🚀 Continuous Deployment (GitHub Actions)
Deployments are fully automated via GitHub Actions on push to the `main` branch.
- **Workflow configuration**: `.github/workflows/deploy.yml`
- **Trigger**: `git push origin main`

### Pipeline Steps:
1. **Installs dependencies**: Runs `npm ci` on GitHub.
2. **Generates Prisma Client**: Runs `npx prisma generate` to ensure build types are ready.
3. **Compiles application**: Runs `npm run build` to generate the Next.js production bundle.
4. **Auto-Restart Trigger**: Generates `tmp/restart.txt` with a fresh timestamp.
5. **FTP Sync**: Uses `SamKirkland/FTP-Deploy-Action@v4.3.5` to sync files to cPanel.
   - **Credentials used**: Repository secrets `CPANEL_FTP_HOST`, `CPANEL_FTP_USER`, and `CPANEL_FTP_PASSWORD`.
   - **Exclusions**: Safely ignores `.env`, `node_modules`, `.next`, `prisma/dev.db`, and other local development tools during uploads.

---

## 🔧 Useful Terminal Commands (Server Environment)
To run commands inside cPanel, open the cPanel Terminal and execute:

### 1. Activate the Node.js Virtual Environment
```bash
source ~/nodevenv/jobpickers.com/*/bin/activate
```
*(Always run this first to load the correct Node, NPM, and NPX paths).*

### 2. Install/Update Dependencies (Only if package.json changes)
```bash
cd ~/jobpickers.com
npm install
```

### 3. Sync Database Schema (Only if schema.prisma changes)
```bash
cd ~/jobpickers.com
npx prisma db push
```
