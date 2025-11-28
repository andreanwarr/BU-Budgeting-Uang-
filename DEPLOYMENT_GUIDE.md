# Finance Tracker - Deployment Guide

**Version:** 3.0.0
**Last Updated:** November 2025

Complete guide untuk deploy Finance Tracker ke berbagai platform hosting dengan database setup.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Database Setup](#-critical-database-setup)
- [Build Process](#build-process)
- [Platform-Specific Guides](#platform-specific-guides)
  - [Netlify](#deploy-ke-netlify)
  - [Vercel](#deploy-ke-vercel)
  - [Railway](#deploy-ke-railway)
  - [Render](#deploy-ke-render)
  - [GitHub Pages](#deploy-ke-github-pages)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Custom Domain](#custom-domain-setup)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required
- ✅ Node.js 18 or higher
- ✅ npm 9 or higher
- ✅ Git installed
- ✅ Supabase project setup
- ✅ GitHub account (for Git-based deployments)

### Recommended
- Domain name (optional, for custom domain)
- CloudFlare account (optional, for CDN & SSL)

---

## 🚨 CRITICAL: Database Setup

### BEFORE DEPLOYING, YOU MUST CREATE DATABASE TABLES!

The application requires specific database tables to function. Follow these steps:

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project or use existing
3. Wait for project to initialize

### Step 2: Run Database Migrations

**Option A: Via Supabase Dashboard (Easiest)**

1. Open your project in Supabase Dashboard
2. Go to **SQL Editor**
3. Copy content from `supabase/migrations/create_core_tables.sql`
4. Paste and run in SQL Editor
5. Verify tables created:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```

Expected tables:
- `categories` (14 default categories created)
- `transactions`
- `kasbon`
- `user_settings`

**Option B: Via Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Step 3: Verify Database

Check that tables exist and RLS is enabled:

```sql
-- Check tables
SELECT
  tablename,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public';

-- Should show 4 tables with policies
```

### Step 4: Get API Credentials

1. In Supabase Dashboard → Settings → API
2. Copy:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
3. Keep these for environment variables

---

## Build Process

### 1. Prepare for Production

```bash
# Clone repository
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### 2. Configure Environment

Edit `.env`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Test Build Locally

```bash
# Type check
npm run typecheck

# Build production
npm run build

# Preview build
npm run preview
```

### 4. Verify Build

Check `dist/` folder:
```bash
ls -la dist/
# Should contain:
# - index.html
# - assets/
# - manifest.json (PWA)
# - sw.js (Service Worker)
```

---

## Platform-Specific Guides

---

## Deploy ke Netlify

### Method 1: Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize (first time only)
netlify init

# Deploy to production
netlify deploy --prod --dir=dist
```

### Method 2: Netlify Dashboard

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Deploy manually"
3. Drag & drop `dist/` folder
4. Add environment variables (see below)

### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### Environment Variables

In Netlify Dashboard → Site settings → Environment variables:
- `VITE_SUPABASE_URL` = `https://xxx.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJ...`

---

## Deploy ke Vercel

### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### Method 2: Vercel Dashboard

1. Go to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import from Git repository
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add environment variables
6. Deploy

### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment Variables

In Vercel Dashboard → Settings → Environment Variables:
- `VITE_SUPABASE_URL` = `https://xxx.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJ...`

---

## Deploy ke Railway

### Via Railway Dashboard

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Vite
5. Add environment variables
6. Deploy

### Environment Variables

Add in Railway Dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Deploy ke Render

### Via Render Dashboard

1. Go to [Render](https://render.com)
2. Click "New" → "Static Site"
3. Connect GitHub repository
4. Configure:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. Add environment variables
6. Deploy

### Render Configuration

Create `render.yaml`:

```yaml
services:
  - type: web
    name: finance-tracker
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_ANON_KEY
        sync: false
```

---

## Deploy ke GitHub Pages

### Setup

```bash
# Install gh-pages
npm install -D gh-pages

# Add deploy script to package.json
```

Update `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/finance-tracker/', // Replace with your repo name
  // ... rest of config
})
```

### Deploy

```bash
npm run deploy
```

### Enable GitHub Pages

1. Go to repository → Settings → Pages
2. Source: `gh-pages` branch
3. Wait for deployment
4. Access at: `https://username.github.io/finance-tracker`

---

## Post-Deployment Checklist

After deploying to any platform, verify:

### 1. Environment Variables
```bash
# Test in browser console
console.log(import.meta.env.VITE_SUPABASE_URL);
// Should show your Supabase URL
```

### 2. Database Connection
- [ ] Can sign up new user
- [ ] Can log in
- [ ] Can create transaction
- [ ] Can view transactions

### 3. Features Working
- [ ] Dark/Light mode toggle
- [ ] Language switch (EN/ID)
- [ ] Currency switch (USD/IDR)
- [ ] Settings save properly
- [ ] Export functions (Excel/PNG)

### 4. Theme Persistence
- [ ] Toggle dark mode
- [ ] Refresh page
- [ ] Theme should remain dark
- [ ] Check database: `SELECT * FROM user_settings;`

### 5. Performance
- [ ] Page loads < 3 seconds
- [ ] No console errors
- [ ] All assets loaded
- [ ] Service worker registered (PWA)

---

## Custom Domain Setup

### Netlify

1. Netlify Dashboard → Domain settings
2. Add custom domain
3. Update DNS records at your registrar:
   ```
   CNAME: your-domain.com → your-site.netlify.app
   ```
4. Enable HTTPS (automatic with Netlify)

### Vercel

1. Vercel Dashboard → Settings → Domains
2. Add domain
3. Update DNS:
   ```
   CNAME: your-domain.com → cname.vercel-dns.com
   ```
4. HTTPS enabled automatically

### CloudFlare (Recommended for all platforms)

1. Add site to CloudFlare
2. Update nameservers at registrar
3. Enable:
   - SSL/TLS: Full
   - Auto Minify: JS, CSS, HTML
   - Brotli compression
   - HTTP/3
4. Create CNAME record to your deployment

---

## Environment Variables

### Required Variables

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Security Best Practices

1. **Never commit `.env` to Git**
   - Already in `.gitignore`
   - Use platform-specific env vars

2. **Use `VITE_` prefix**
   - Required for Vite to expose to client
   - Only `VITE_*` vars are accessible

3. **Rotate keys periodically**
   - Generate new anon key in Supabase
   - Update in all deployments

4. **Use different keys per environment**
   - Production: Different Supabase project
   - Staging: Separate Supabase project
   - Development: Local `.env`

---

## Troubleshooting

### Build Errors

**Error: Module not found**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: TypeScript errors**
```bash
# Check types
npm run typecheck

# Fix and rebuild
npm run build
```

### Deployment Issues

**404 on page refresh**

Fix: Add redirect rules

Netlify (`netlify.toml`):
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Vercel (`vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Environment variables not working**

1. Check prefix: Must be `VITE_`
2. Rebuild after adding vars
3. Clear cache and redeploy
4. Check deployment logs

**Supabase connection failed**

1. Verify URL and key in env vars
2. Check Supabase project status
3. Test connection:
   ```javascript
   fetch('https://xxx.supabase.co/rest/v1/')
   ```
4. Check CORS settings in Supabase

**Theme not persisting**

1. Check `user_settings` table exists
2. Verify RLS policies
3. Test in incognito (rule out cache)
4. Check browser console for errors
5. Verify database connection in production

**Database errors**

**Error: relation "categories" does not exist**
- Run migrations in Supabase Dashboard
- Verify tables created

**Error: RLS policy violation**
- Check if user is authenticated
- Verify policies in Supabase Dashboard
- Test query in SQL Editor:
  ```sql
  SELECT * FROM categories WHERE is_default = true;
  ```

**Settings not saving**
- Check `user_settings` table
- Verify user can insert/update
- Check Network tab for failed requests
- Test in Supabase Dashboard:
  ```sql
  INSERT INTO user_settings (user_id, theme)
  VALUES ('your-user-id', 'dark');
  ```

---

## Performance Optimization

### 1. Enable Compression

All modern hosts (Netlify, Vercel) auto-enable:
- Gzip
- Brotli

### 2. CDN

Automatic with:
- Netlify (global CDN)
- Vercel (Edge Network)
- CloudFlare (if used)

### 3. Caching

Vite automatically adds cache headers:
```
assets/*.js  - Cache: 1 year
assets/*.css - Cache: 1 year
index.html   - Cache: No cache
```

### 4. Lazy Loading

Already implemented:
- Code splitting
- Dynamic imports
- Lazy component loading

---

## Monitoring

### Recommended Tools

1. **Uptime Monitoring**
   - UptimeRobot (free)
   - Better Uptime

2. **Error Tracking**
   - Sentry
   - LogRocket

3. **Analytics**
   - Google Analytics
   - Plausible Analytics (privacy-friendly)

---

## Backup & Recovery

### Database Backup

1. Supabase Dashboard → Settings → Database
2. Download backup (daily automatic backups)
3. Store backups securely

### Code Backup

1. Push to GitHub regularly
2. Tag releases:
   ```bash
   git tag -a v3.0.0 -m "Production release"
   git push origin v3.0.0
   ```

---

## Support

**Issues during deployment?**
- Check this guide first
- Check platform documentation
- Open GitHub issue
- Email: andreanwar713@gmail.com

---

**Version 3.0.0** | **Last Updated: November 2025**
