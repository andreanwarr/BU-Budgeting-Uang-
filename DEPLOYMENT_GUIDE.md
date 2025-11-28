# Finance Tracker - Deployment Guide

**Version:** 2.4.0  
**Last Updated:** November 2025

Complete guide untuk deploy Finance Tracker ke berbagai platform hosting.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [Platform-Specific Guides](#platform-specific-guides)
  - [Netlify](#deploy-ke-netlify)
  - [Vercel](#deploy-ke-vercel)
  - [Railway](#deploy-ke-railway)
  - [Render](#deploy-ke-render)
  - [GitHub Pages](#deploy-ke-github-pages)
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
# - manifest.json
# - sw.js
```

---

## Platform-Specific Guides

---

## Deploy ke Netlify

### Method 1: Netlify CLI (Recommended)

```bash
# 1. Install Netlify CLI globally
npm install -g netlify-cli

# 2. Login to Netlify
netlify login
# Browser will open for authentication

# 3. Initialize (first time only)
netlify init
# Select: "Create & configure a new site"
# Choose team
# Site name: finance-tracker (or custom)
# Build command: npm run build
# Publish directory: dist

# 4. Deploy to production
netlify deploy --prod
```

### Method 2: Drag & Drop

```bash
# 1. Build locally
npm run build

# 2. Go to Netlify Dashboard
# https://app.netlify.com/drop

# 3. Drag & drop the dist/ folder

# 4. Add environment variables
# Site settings → Environment → Environment variables
# Add: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### Method 3: Git Integration (Best for CI/CD)

#### 3.1. Push to GitHub

```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore

# Commit and push
git add .
git commit -m "Initial commit"
git push origin main
```

#### 3.2. Connect to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize
4. Select your repository
5. Configure build settings:
   ```
   Branch to deploy: main
   Build command: npm run build
   Publish directory: dist
   ```
6. Click **"Show advanced"** → **"New variable"**
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
7. Click **"Deploy site"**

### Netlify Configuration File

Create `netlify.toml` in root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

# SPA redirect
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Netlify CLI Commands

```bash
# Check status
netlify status

# Open site in browser
netlify open:site

# Open admin dashboard
netlify open:admin

# View logs
netlify watch

# Link existing site
netlify link

# Environment variables
netlify env:list
netlify env:set KEY value
```

---

## Deploy ke Vercel

### Method 1: Vercel CLI

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login
# Enter email and verify

# 3. Deploy to production
vercel --prod

# Follow prompts:
# - Setup and deploy? Y
# - Which scope? Select your account
# - Link to existing project? N
# - Project name: finance-tracker
# - Directory: ./
# - Override settings? N
```

### Method 2: Vercel Dashboard (Git Integration)

#### 2.1. Push to GitHub (if not done)

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2.2. Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository:**
   - Click **"Import"** on your repo
   - Or use **"Import Third-Party Git Repository"** for other platforms
4. **Configure Project:**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build (auto-detected)
   Output Directory: dist (auto-detected)
   Install Command: npm install (auto-detected)
   ```
5. **Environment Variables:**
   - Click **"Environment Variables"**
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
   - Apply to: Production, Preview, Development
6. Click **"Deploy"**

### Vercel Configuration File

Create `vercel.json` in root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "regions": ["sin1"],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Vercel CLI Commands

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod

# View logs
vercel logs

# Environment variables
vercel env ls
vercel env add VARIABLE_NAME
vercel env rm VARIABLE_NAME

# Domains
vercel domains ls
vercel domains add example.com

# Remove deployment
vercel remove finance-tracker
```

---

## Deploy ke Railway

### Railway Dashboard Method

1. **Sign Up/Login:**
   - Go to [Railway](https://railway.app)
   - Sign in with GitHub

2. **Create New Project:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repository

3. **Auto-Configuration:**
   - Railway auto-detects Vite
   - Build command: `npm run build`
   - Start command: Auto-detected

4. **Environment Variables:**
   - Click on your project
   - Go to **"Variables"** tab
   - Add:
     ```
     VITE_SUPABASE_URL=https://xxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=your-key
     ```

5. **Deploy:**
   - Click **"Deploy"**
   - Railway builds and deploys automatically

### Railway CLI Method

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Link project
railway link

# Add environment variables
railway variables set VITE_SUPABASE_URL=https://xxxxx.supabase.co
railway variables set VITE_SUPABASE_ANON_KEY=your-key

# Deploy
railway up
```

### Railway Configuration

Create `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Deploy ke Render

### Render Dashboard Method

1. **Sign Up/Login:**
   - Go to [Render](https://render.com)
   - Sign in with GitHub

2. **New Static Site:**
   - Click **"New"** → **"Static Site"**
   - Connect repository

3. **Configure:**
   ```
   Name: finance-tracker
   Branch: main
   Build Command: npm run build
   Publish Directory: dist
   ```

4. **Environment Variables:**
   - Scroll to **"Environment"**
   - Add:
     ```
     VITE_SUPABASE_URL
     VITE_SUPABASE_ANON_KEY
     ```

5. **Create Static Site:**
   - Click **"Create Static Site"**
   - Wait for build

### Render Blueprint (render.yaml)

Create `render.yaml`:

```yaml
services:
  - type: web
    name: finance-tracker
    env: static
    buildCommand: npm run build
    staticPublishPath: dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: NODE_VERSION
        value: 18
      - key: VITE_SUPABASE_URL
        value: https://xxxxx.supabase.co
      - key: VITE_SUPABASE_ANON_KEY
        sync: false
```

---

## Deploy ke GitHub Pages

### Setup

1. **Install gh-pages:**
   ```bash
   npm install -D gh-pages
   ```

2. **Update package.json:**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/finance-tracker"
   }
   ```

3. **Update vite.config.ts:**
   ```typescript
   import { defineConfig } from 'vite';
   
   export default defineConfig({
     base: '/finance-tracker/', // Repository name
     // ... other config
   });
   ```

### Deploy

```bash
# Deploy to gh-pages branch
npm run deploy

# Or manually
npm run build
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

### GitHub Pages Settings

1. Go to repository settings
2. **Pages** section
3. Source: `gh-pages` branch
4. Root directory: `/` (root)
5. Save

### Custom Domain on GitHub Pages

1. Add CNAME file in `public/`:
   ```
   yourdomain.com
   ```

2. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
         185.199.109.153
         185.199.110.153
         185.199.111.153
   
   Type: CNAME
   Name: www
   Value: yourusername.github.io
   ```

---

## Custom Domain Setup

### Netlify Custom Domain

1. **Add Domain:**
   - Site settings → Domain management
   - Add custom domain
   - Enter: `yourdomain.com`

2. **Configure DNS:**
   
   **Option A: Netlify DNS (Recommended)**
   ```
   Update nameservers at domain registrar to:
   dns1.p0X.nsone.net
   dns2.p0X.nsone.net
   dns3.p0X.nsone.net
   dns4.p0X.nsone.net
   ```

   **Option B: External DNS**
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

3. **Enable HTTPS:**
   - Automatic (Let's Encrypt)
   - Force HTTPS redirect

### Vercel Custom Domain

1. **Add Domain:**
   - Project settings → Domains
   - Enter domain: `yourdomain.com`
   - Add www variant

2. **Configure DNS:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Verify:**
   - Vercel checks DNS automatically
   - SSL certificate auto-provisioned

### CloudFlare Setup (Recommended)

Benefits:
- Free SSL/TLS
- DDoS protection
- CDN (faster loading)
- Analytics

**Steps:**

1. **Add Site to CloudFlare:**
   - Go to [CloudFlare Dashboard](https://dash.cloudflare.com)
   - Add site: `yourdomain.com`
   - Select Free plan
   - Scan existing DNS records

2. **Update Nameservers:**
   ```
   At your domain registrar, change nameservers to:
   name1.cloudflare.com
   name2.cloudflare.com
   ```

3. **Configure DNS:**
   ```
   Type: A
   Name: @
   Value: [Your hosting IP]
   Proxy status: Proxied (orange cloud)
   
   Type: CNAME
   Name: www
   Value: yourdomain.com
   Proxy status: Proxied
   ```

4. **SSL/TLS Settings:**
   - Go to SSL/TLS
   - Mode: Full (strict)
   - Always Use HTTPS: On
   - Automatic HTTPS Rewrites: On

5. **Caching:**
   - Caching → Configuration
   - Caching Level: Standard
   - Browser Cache TTL: 4 hours

---

## Environment Variables

### Required Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# Optional
VITE_APP_NAME=Finance Tracker
VITE_APP_VERSION=2.4.0
```

### Platform-Specific Setup

**Netlify:**
```bash
netlify env:set VITE_SUPABASE_URL "https://xxxxx.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-key"
```

**Vercel:**
```bash
vercel env add VITE_SUPABASE_URL production
# Enter value when prompted

vercel env add VITE_SUPABASE_ANON_KEY production
```

**Railway:**
```bash
railway variables set VITE_SUPABASE_URL="https://xxxxx.supabase.co"
railway variables set VITE_SUPABASE_ANON_KEY="your-key"
```

### Security Best Practices

1. **Never commit `.env` to Git:**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use different keys for environments:**
   - Development: Test Supabase project
   - Production: Production Supabase project

3. **Rotate keys periodically:**
   - Generate new anon key every 3-6 months
   - Update in all deployment platforms

---

## Troubleshooting

### Build Failures

**Error: "Module not found"**
```bash
# Solution 1: Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Solution 2: Check imports
# Ensure all imports use correct paths
```

**Error: "Out of memory"**
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Error: "TypeScript errors"**
```bash
# Type check
npm run typecheck

# Ignore errors (not recommended)
# tsconfig.json: "skipLibCheck": true
```

### Deployment Failures

**Error: "Environment variables not found"**
- Verify variable names have `VITE_` prefix
- Check variable values (no quotes in dashboard)
- Redeploy after adding variables

**Error: "404 on page refresh"**
- Add redirect rules (see platform configs)
- SPA mode must be enabled
- Check `_redirects` or `vercel.json`

**Error: "Build succeeded but site is blank"**
- Check browser console for errors
- Verify Supabase URL is correct
- Check CORS settings in Supabase
- Inspect network tab for failed requests

### Runtime Errors

**Supabase connection failed:**
```bash
# Check environment variables
console.log(import.meta.env.VITE_SUPABASE_URL);

# Verify in Supabase Dashboard:
# 1. Project is active
# 2. API keys are correct
# 3. URL is correct
```

**RLS Policy errors:**
```bash
# Check policies in Supabase Dashboard:
# Tables → Select table → Policies

# Common fix: Ensure policies allow user operations
# Example: SELECT policy
# USING (auth.uid() = user_id)
```

### Performance Issues

**Slow first load:**
- Enable caching headers (see configs)
- Use CloudFlare CDN
- Optimize images
- Code splitting

**Large bundle size:**
```bash
# Analyze bundle
npm run build
npx vite-bundle-visualizer

# Optimize: 
# - Lazy load components
# - Remove unused dependencies
# - Use dynamic imports
```

---

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] All pages accessible
- [ ] Authentication works
- [ ] Database connections work
- [ ] Export functionality works
- [ ] Responsive on mobile
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Analytics setup (optional)
- [ ] Monitoring setup (optional)
- [ ] Backup plan in place

---

## Monitoring & Analytics

### Netlify Analytics
- Site settings → Analytics
- Enable (paid feature)

### Vercel Analytics
- Project settings → Analytics
- Enable (free for hobby)

### Google Analytics
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Uptime Monitoring
- [UptimeRobot](https://uptimerobot.com) (Free)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

---

## Rollback Strategy

### Netlify
```bash
# View deployments
netlify sites:list

# Rollback to previous
netlify rollback
```

### Vercel
```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

### Git-Based Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard [commit-hash]
git push origin main --force
```

---

## Support

Need help with deployment?

- 📧 Email: andreanwar713@gmail.com
- 📚 Docs: See README.md
- 🐛 Issues: GitHub Issues

---

**Last Updated:** November 2025  
**Version:** 2.4.0  
**Status:** Production Ready ✅
