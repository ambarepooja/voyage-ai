# 🚀 Voyage AI — Production Deployment Guide

This guide provides simple, step-by-step instructions to deploy Voyage AI live on the web.

---

## 🌟 Recommended Method: Vercel (Frontend) + Render (Backend)
*Best for: 100% Free tier, automated SSL/HTTPS, instant deployments from GitHub.*

### Step 1: Push Project to GitHub
1. Open your terminal in the `voyage-ai` root folder:
   ```bash
   git init
   git add .
   git commit -m "Production ready Voyage AI"
   ```
2. Create a new repository on [GitHub](https://github.com) named `voyage-ai`.
3. Push your code:
   ```bash
   git remote add origin https://github.com/<your-username>/voyage-ai.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Deploy Backend on Render (Free)
1. Go to **[Render.com](https://render.com)** and Sign In with GitHub.
2. Click **New +** -> **Web Service**.
3. Connect your `voyage-ai` GitHub repository.
4. Fill in the settings:
   - **Name**: `voyage-ai-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `SECRET_KEY`: *(Any random string, e.g. `voyage-secret-key-prod-2026`)*
   - `DATABASE_URL`: *(Optional: Leave blank to use SQLite or add cloud PostgreSQL URI)*
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://voyage-ai-backend.onrender.com`).

---

### Step 3: Deploy Frontend on Vercel (Free)
1. Go to **[Vercel.com](https://vercel.com)** and Sign In with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your `voyage-ai` repository.
4. Configure the project:
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://voyage-ai-backend.onrender.com/api/v1` *(Your Render backend URL + `/api/v1`)*
6. Click **Deploy**.
7. Your app is live with automatic SSL! (e.g., `https://voyage-ai.vercel.app`).

---

## 🐳 Alternative Method: Docker Compose (VPS / AWS / DigitalOcean)
*Best for: Running the entire stack (Frontend, Backend, PostgreSQL, Redis, Nginx) on your own Linux server.*

1. SSH into your VPS (Ubuntu 22.04/24.04).
2. Clone your repository:
   ```bash
   git clone https://github.com/<your-username>/voyage-ai.git
   cd voyage-ai
   ```
3. Set your environment variables in `.env`:
   ```bash
   GEMINI_API_KEY=your_key_here
   SECRET_KEY=your_secret_key_here
   ```
4. Start all services:
   ```bash
   docker-compose up -d --build
   ```
5. Your application will be live at `http://your-server-ip`.

---

## ✅ Deployment Checklist
- [x] CORS configured for all origins (`*`) in FastAPI.
- [x] Dynamic API Base URL support via `VITE_API_BASE_URL`.
- [x] SPA client routing rewrites configured (`vercel.json`).
- [x] Production build tested and verified (`npm run build` passed).
- [x] SQLite & PostgreSQL cross-compatibility supported via `DATABASE_URL`.
