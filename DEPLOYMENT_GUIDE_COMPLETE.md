# 🚀 Complete Deployment Guide - BU (Budgeting Uang)

This guide covers everything you need to deploy your finance tracker application to production.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Build Process](#build-process)
5. [Deployment Platforms](#deployment-platforms)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Supabase project created and configured
- [ ] Database migrations applied
- [ ] Environment variables ready
- [ ] Local build tested successfully
- [ ] All dependencies installed
- [ ] Git repository ready (if using Git-based deployment)

---

## 🔑 Environment Setup

### Required Environment Variables

Create a `.env` file (locally) or set environment variables in your deployment platform:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

**⚠️ IMPORTANT:**
- Never commit `.env` to Git (it's in `.gitignore`)
- Use `VITE_` prefix for all client-side variables
- Keep your `service_role` key secret (never use in frontend)

---

## 🗄️ Database Configuration

### Step 1: Apply Migrations

**Via Supabase Dashboard (Recommended):**

1. Login to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Run these migrations in order:

**Migration 1: Core Tables**
```sql
-- File: supabase/migrations/20251128075532_create_core_tables.sql
-- This creates categories, transactions, and kasbon tables
-- Copy and paste the entire file content
```

**Migration 2: User Settings**
```sql
-- File: supabase/migrations/20251128073935_create_user_settings_table.sql
-- This creates user_settings table
-- Copy and paste the entire file content
```

**Migration 3: User Profiles**
```sql
-- File: supabase/migrations/20251128083233_create_user_profiles_table.sql
-- This creates user_profiles table with avatar support
-- Copy and paste the entire file content
```

**Migration 4: RLS Fix**
```sql
-- File: supabase/migrations/20251121101947_fix_rls_performance_and_security.sql
-- This optimizes RLS policies
-- Copy and paste the entire file content
```

### Step 2: Verify Database Setup

Run this query in SQL Editor:

```sql
-- Check all tables exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

You should see:
- `categories`
- `kasbon`
- `transactions`
- `user_profiles`
- `user_settings`

### Step 3: Verify Default Categories

```sql
-- Should return 14 rows
SELECT COUNT(*) FROM categories WHERE is_default = true;
```

### Step 4: Configure Storage (for Profile Avatars)

1. Go to **Storage** in Supabase Dashboard
2. Create a new bucket called `avatars`
3. Make it **public**
4. Set these policies:

**Upload Policy:**
```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Update Policy:**
```sql
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Read Policy:**
```sql
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Enable **Email** provider
3. **Disable** email confirmation (for easier testing)
4. Set **Site URL** to your deployment URL
5. Add **Redirect URLs** (e.g., `https://yourdomain.com/*`)

---

## 🏗️ Build Process

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Tests

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
```

### 3. Build for Production

```bash
npm run build
```

**Expected Output:**
```
vite v5.4.21 building for production...
✓ 3088 modules transformed.
dist/index.html                     1.38 kB
dist/assets/index-xxxxxxxx.css     57.65 kB
dist/assets/index-xxxxxxxx.js   1,837.68 kB
✓ built in 16s
```

### 4. Test Build Locally

```bash
npm run preview
```

Visit `http://localhost:4173` and test:
- Login/signup
- Theme toggle
- Language switch
- Add transaction
- View charts
- Export functionality

---

## 🌐 Deployment Platforms

### Option 1: Netlify (Recommended)

**Via Netlify CLI:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

**Via Netlify Dashboard:**

1. Drag and drop `dist/` folder
2. OR connect Git repository
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

**Create `netlify.toml`:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Custom Domain:**
1. Go to **Domain settings**
2. Add custom domain
3. Update DNS records

---

### Option 2: Vercel

**Via Vercel CLI:**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Via Vercel Dashboard:**

1. Import from Git
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables

**Create `vercel.json`:**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### Option 3: Railway

1. Connect your GitHub repository
2. Railway auto-detects Vite
3. Add environment variables
4. Deploy automatically on Git push

**Configuration:**
- Build command: `npm run build`
- Start command: `npm run preview` (Railway serves from dist)

---

### Option 4: Render

1. Create new **Static Site**
2. Connect repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables

**Add `render.yaml`:**

```yaml
services:
  - type: web
    name: budgeting-uang
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

### Option 5: GitHub Pages

**Setup:**

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json
"scripts": {
  "deploy": "gh-pages -d dist"
}
```

**Update `vite.config.ts`:**

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  plugins: [react()]
})
```

**Deploy:**

```bash
npm run build
npm run deploy
```

**Enable GitHub Pages:**
1. Go to repo **Settings** → **Pages**
2. Source: **gh-pages** branch
3. Save

---

## ✅ Post-Deployment Verification

### 1. Authentication Test

- [ ] Sign up with new email
- [ ] Login works
- [ ] Logout works
- [ ] Session persists on refresh

### 2. Core Functionality Test

- [ ] Dashboard loads with stats
- [ ] Can add new transaction
- [ ] Can edit transaction
- [ ] Can delete transaction
- [ ] Transactions list updates in real-time

### 3. Settings & Preferences Test

- [ ] Theme toggle works (light/dark)
- [ ] Language switch works (EN/ID)
- [ ] Currency switch works (USD/IDR)
- [ ] Settings persist after refresh
- [ ] Profile avatar upload works

### 4. Reports & Charts Test

- [ ] Charts display data correctly
- [ ] Date filters work
- [ ] Export to Excel works
- [ ] Export to Image works
- [ ] Clickable charts show details

### 5. Mobile Test

- [ ] Responsive on mobile
- [ ] Sidebar opens/closes
- [ ] Sidebar scrolls properly (iOS Safari)
- [ ] Touch events work on charts
- [ ] Forms work on mobile
- [ ] Date picker works

### 6. Performance Test

- [ ] Initial load < 3 seconds
- [ ] Theme switch is instant
- [ ] No console errors
- [ ] No 404 errors
- [ ] Images load properly

---

## 🐛 Troubleshooting

### Build Errors

**Error: `Module not found`**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error: TypeScript errors**
```bash
npm run typecheck
# Fix errors shown
npm run build
```

---

### Deployment Errors

**Error: Environment variables not working**

✅ **Solution:**
- Ensure `VITE_` prefix
- Rebuild after adding variables
- Check deployment logs
- Verify in Network tab

**Error: 404 on page refresh**

✅ **Solution:**
- Add redirect rules (see platform configs)
- Verify `_redirects` or `vercel.json` exists
- Check publish directory is correct

**Error: Supabase connection failed**

✅ **Solution:**
- Verify environment variables
- Check URL has `https://`
- Test with curl:
```bash
curl https://your-project.supabase.co/rest/v1/
```

---

### Runtime Errors

**Error: `relation "categories" does not exist`**

✅ **Solution:**
- Apply database migrations
- Verify in Supabase SQL Editor:
```sql
SELECT * FROM categories LIMIT 1;
```

**Error: RLS policy violation**

✅ **Solution:**
- Ensure user is logged in
- Check policies in Supabase Dashboard
- Verify policies allow authenticated users

**Error: Theme not persisting**

✅ **Solution:**
- Check `user_settings` table exists
- Verify RLS policies on user_settings
- Clear browser cache
- Check Network tab for failed requests

**Error: Storage upload failed**

✅ **Solution:**
- Verify `avatars` bucket exists
- Check storage policies
- Ensure bucket is public
- Check file size limits

---

## 📊 Monitoring & Analytics

### Supabase Dashboard

Monitor in **Database** → **Logs**:
- Query performance
- Error logs
- API usage

### Browser DevTools

Check:
- **Console:** No errors
- **Network:** All requests succeed (200 status)
- **Application:** LocalStorage and cookies work
- **Performance:** Load times < 3s

### Optional: Add Analytics

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

```typescript
// In main.tsx
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

---

## 🔐 Security Best Practices

1. **Never commit secrets:**
   - `.env` is in `.gitignore`
   - Use environment variables in deployment platforms

2. **Use RLS policies:**
   - All tables have RLS enabled
   - Users can only access their own data

3. **Validate user input:**
   - Forms have validation
   - Supabase validates on backend

4. **HTTPS only:**
   - All platforms provide free SSL
   - Force HTTPS in production

5. **Regular updates:**
   - Keep dependencies updated
   - Monitor Supabase security advisories

---

## 📞 Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Review Supabase logs
3. Check browser console
4. Contact support: andreanwar713@gmail.com

---

## ✅ Deployment Success Checklist

- [ ] Application builds successfully
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Storage bucket created (avatars)
- [ ] Authentication configured
- [ ] Deployed to platform
- [ ] Custom domain configured (optional)
- [ ] All features tested
- [ ] Mobile tested
- [ ] Performance verified
- [ ] No console errors
- [ ] Documentation updated

---

**🎉 Congratulations! Your app is now live in production!**

**Version 3.0.0** | **December 2025** | **Production Ready ✅**
