# DASA EXPENCES — AUTOMATED GIT CONTINUOUS DEPLOYMENT (CI/CD)

Whenever you push changes to your GitHub repository:
```bash
git add .
git commit -m "your message"
git push origin main
```
Your application will automatically build, test, and deploy live to the internet.

---

## 🚀 How Automated Deployment Works

We have configured the repository with industry-standard CI/CD manifests and unified server routing:

1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
   - Automatically runs on every `git push` to `main`.
   - Installs dependencies, validates Prisma schema, and compiles the production React bundle (`npm run build`).
   - If a deploy hook or server SSH key is configured in GitHub Secrets, it automatically deploys to production.

2. **Render Blueprint** (`render.yaml`):
   - Configures automatic full-stack deployment (Node.js API + React Web App + Managed PostgreSQL database).
   - Auto-deploy is enabled: every `git push origin main` triggers an instant, zero-downtime live rollout with SSL.

3. **Vercel Manifest** (`vercel.json`):
   - For 1-click frontend auto-deployment on Vercel connected to GitHub.

4. **Multi-Stage Dockerfile** (`Dockerfile`):
   - For container auto-deployment on Railway, Fly.io, Koyeb, AWS, or DigitalOcean.

5. **Unified Full-Stack Express Server** (`backend/src/app/app.js`):
   - In production, the backend automatically serves the compiled frontend assets from `frontend/dist` with client-side SPA routing fallback. A single web service serves both `/api/*` and the web UI at `/`.

---

## ⚡ 2-Minute Setup Instructions (Choose Your Cloud Platform)

### Option A: Render.com (Recommended — Zero Maintenance & Free Tier)
1. Go to **[Render.com](https://render.com)** and sign in with your GitHub account (**JEYAWIN-D**).
2. Click **New +** (top right) ➔ Select **Blueprint**.
3. Select your repository: **`dasa-expenses-app`**.
4. Render will automatically read the `render.yaml` file from the repo:
   - It will automatically set up the **PostgreSQL Database** (`dasa-expences-db`).
   - It will automatically set up the **Web Service** (`dasa-expences-app`).
5. Click **Apply**.
6. **Done!** From now on, whenever you run `git push origin main`, Render automatically builds and updates the live site in under 60 seconds.

---

### Option B: Railway.app (Alternative 1-Click Platform)
1. Go to **[Railway.app](https://railway.app)** and log in with GitHub.
2. Click **New Project** ➔ **Deploy from GitHub repo** ➔ Select **`dasa-expenses-app`**.
3. Add a PostgreSQL database service.
4. Set `DATABASE_URL` in the web service environment variables.
5. **Done!** Every `git push origin main` will automatically rebuild and deploy via the included `Dockerfile`.

---

### Option C: Your Own Linux VPS / Cloud Server (SSH Automation)
If you are hosting on your own Ubuntu/Debian VPS (e.g. Hostinger, AWS EC2, DigitalOcean):
1. Go to your GitHub repository: **Settings** ➔ **Secrets and variables** ➔ **Actions**.
2. Add the following repository secrets:
   - `SERVER_HOST`: Your server IP or domain (e.g. `123.45.67.89`)
   - `SERVER_USER`: Your SSH username (e.g. `root` or `ubuntu`)
   - `SERVER_SSH_KEY`: Your private SSH key (`id_rsa`)
   - `DEPLOY_PATH`: Path on server where repo is cloned (e.g. `/var/www/dasa-expences`)
3. The `.github/workflows/deploy.yml` pipeline will automatically SSH into your server, pull latest code, run Prisma migrations, build frontend, and reload PM2!

---

## 📝 Daily Workflow

Once connected, your development workflow is effortless:

```bash
# 1. Make your code or UI changes locally
# 2. Stage all changed files
git add .

# 3. Commit your changes
git commit -m "Update pricing and UI design"

# 4. Push to GitHub
git push origin main
```

Within 1-2 minutes, your changes will automatically be live for your users!

