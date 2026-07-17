# EduGuard AI — Deployment Guide

Frontend → Vercel ✅ (already live)  
Backend  → Render (free tier)  
Database → Neon PostgreSQL (free tier)

---

## Step 1 — Create a Free Neon Database

1. Go to **https://neon.tech** and sign up / log in.
2. Click **New Project** → give it any name (e.g. `eduguard`).
3. Once created, open **Connection Details**.
4. Copy the **Pooled connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Save it — you will paste it into Render in Step 2.

---

## Step 2 — Deploy the Backend on Render

1. Go to **https://render.com** and sign up / log in with GitHub.
2. Click **New → Web Service**.
3. Connect your GitHub repo: `Shubhampaithankar23/Student-Dropout-Prediction`
4. Fill in the settings:
   - **Name**: `eduguard-ai-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm ci`
   - **Start Command**: `npm run deploy:start`
   - **Plan**: Free
5. Scroll to **Environment Variables** and add these:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DB_DIALECT` | `postgres` |
   | `DATABASE_URL` | *(paste your Neon connection string)* |
   | `FRONTEND_URL` | `https://student-dropout-prediction-ou9nf54v7.vercel.app` |
   | `JWT_SECRET` | *(click Generate)* |
   | `JWT_REFRESH_SECRET` | *(click Generate)* |
   | `JWT_EXPIRES_IN` | `7d` |
   | `JWT_REFRESH_EXPIRES_IN` | `30d` |
   | `BCRYPT_ROUNDS` | `12` |
   | `RATE_LIMIT_WINDOW` | `15` |
   | `RATE_LIMIT_MAX` | `200` |

6. Click **Create Web Service** → wait ~2 minutes for it to build.
7. Once the status shows **Live**, copy your Render URL, e.g.:
   ```
   https://eduguard-ai-api.onrender.com
   ```
8. Test it: open `https://eduguard-ai-api.onrender.com/health` in your browser.  
   You should see: `{"status":"OK",...}`

---

## Step 3 — Connect the Frontend to the Backend

1. Go to your **Vercel dashboard** → select the `Student-Dropout-Prediction` project.
2. Go to **Settings → Environment Variables**.
3. Add (or update) this variable:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://eduguard-ai-api.onrender.com/api` |

4. Click **Save**.
5. Go to **Deployments** → click **Redeploy** on the latest deployment (or push any small commit).
6. Wait for the new Vercel build to finish.

---

## Step 4 — Test Login

Open your Vercel URL and log in with the demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@eduguard.ai` | `Admin@123` |
| Teacher | `teacher@eduguard.ai` | `Teacher@123` |
| Counselor | `counselor@eduguard.ai` | `Counselor@123` |

---

## Notes

- **Free Render services spin down after 15 minutes of inactivity.** The first request after sleep takes ~30 seconds. This is normal on the free tier.
- The `deploy:start` script runs `migrate → seed → start` automatically on every deploy. Seed data is idempotent (won't duplicate on restarts).
- Email alerts are disabled by default unless you set `EMAIL_USER` and `EMAIL_PASS` in Render.
