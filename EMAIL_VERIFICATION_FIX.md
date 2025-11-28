# 🔧 FIX: Email Confirmation Redirect ke localhost:3000

## ❌ Masalah

Email confirmation redirect ke `localhost:3000` padahal aplikasi deploy di URL lain (misal: Netlify, Vercel, dll).

## ✅ Solusi

Ada **2 hal** yang harus di-fix di **Supabase Dashboard**:

---

## 📋 Step-by-Step Fix

### Step 1: Login ke Supabase Dashboard

```
https://app.supabase.com
```

Pilih project Anda: **wljmtrrdjwdqfvzvykbp**

---

### Step 2: Fix Site URL

1. Klik **"Authentication"** di sidebar kiri
2. Klik **"URL Configuration"**
3. Edit **"Site URL"**:

#### Untuk Development (Local):
```
http://localhost:5173
```

#### Untuk Production (Deploy):
```
https://your-app-domain.netlify.app
```
atau
```
https://your-app-domain.vercel.app
```

**PENTING**: Ganti dengan URL deploy Anda yang sebenarnya!

4. Klik **"Save"**

---

### Step 3: Fix Redirect URLs

Masih di halaman **"URL Configuration"**, scroll ke bawah ke bagian **"Redirect URLs"**.

#### Tambahkan URL berikut:

**Untuk Development:**
```
http://localhost:5173/auth/callback
http://localhost:5173/**
```

**Untuk Production:**
```
https://your-app-domain.netlify.app/auth/callback
https://your-app-domain.netlify.app/**
```

**PENTING**: 
- Ganti `your-app-domain` dengan domain Anda
- Tambahkan SEMUA URL yang diperlukan (dev + production)
- Format: `https://domain.com/auth/callback` dan `https://domain.com/**`

4. Klik **"Save"**

---

### Step 4: Disable Email Confirmation (Opsional)

**HANYA jika Anda ingin disable email verification untuk testing:**

1. Klik **"Authentication"** di sidebar
2. Klik **"Providers"**
3. Klik **"Email"**
4. **Un-check** "Confirm email"
5. Klik **"Save"**

⚠️ **WARNING**: Disable email confirmation tidak disarankan untuk production!

---

## 🎯 Checklist Fix

Pastikan semua ini sudah dilakukan:

- [ ] Site URL sudah diubah ke domain production
- [ ] Redirect URLs sudah ditambahkan:
  - `https://your-domain.com/auth/callback`
  - `https://your-domain.com/**`
- [ ] Development URLs juga ditambahkan (jika perlu):
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/**`
- [ ] Save dan refresh browser
- [ ] Test signup dengan email baru

---

## 📝 Contoh Konfigurasi Lengkap

### Site URL
```
Production: https://budgeting-app.netlify.app
```

### Redirect URLs (Allow list)
```
http://localhost:5173/**
http://localhost:5173/auth/callback
https://budgeting-app.netlify.app/**
https://budgeting-app.netlify.app/auth/callback
```

---

## 🔍 Cara Verify Fix Berhasil

1. **Clear cache browser** (Ctrl+Shift+Delete)
2. **Register** dengan email baru
3. **Cek email** masuk
4. **Klik link** verifikasi
5. Harusnya redirect ke: `https://your-domain.com/auth/callback` ✅
6. Login otomatis berhasil ✅

---

## ⚡ Quick Fix Commands

Jika sudah deploy, update environment variables:

```bash
# Untuk Netlify
netlify env:set VITE_SUPABASE_URL "https://wljmtrrdjwdqfvzvykbp.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"

# Untuk Vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

---

## 🐛 Troubleshooting

### Problem: Masih redirect ke localhost
**Solution**: 
- Clear browser cache
- Logout dari Supabase dashboard
- Login ulang
- Save ulang Site URL

### Problem: "Invalid redirect URL" error
**Solution**:
- Pastikan URL sudah ditambahkan di "Redirect URLs"
- Format harus PERSIS: `https://domain.com/auth/callback`
- Jangan lupa `/**` wildcard

### Problem: Email tidak dikirim
**Solution**:
- Cek folder spam
- Verify email provider settings di Supabase
- Test dengan email provider lain (Gmail, Yahoo)

---

## 📚 Dokumentasi Resmi

Supabase Auth Configuration:
https://supabase.com/docs/guides/auth/redirect-urls

---

## ✨ Kode Sudah Benar!

Kode di aplikasi sudah **100% benar** menggunakan:

```typescript
emailRedirectTo: `${window.location.origin}/auth/callback`
```

Ini akan otomatis detect domain production. Yang perlu difix **HANYA** di Supabase Dashboard saja!

---

**Last Updated**: 2024-11-28
**Status**: ✅ Ready to use
