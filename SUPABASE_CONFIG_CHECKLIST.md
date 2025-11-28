# Supabase Email Verification Configuration - Quick Checklist

## 🚀 Quick Start (5 Minutes)

Follow these steps exactly to enable email verification in your Supabase project.

---

## Step 1: Enable Email Confirmation ⚙️

1. **Go to:** [app.supabase.com](https://app.supabase.com) → Your Project
2. **Navigate to:** `Authentication` → `Providers` → `Email`
3. **Toggle ON:** `Confirm email`
4. **Toggle ON:** `Enable email confirmations`
5. **Click:** `Save`

**✅ Result:** Users must verify email before accessing the app

---

## Step 2: Configure Redirect URLs 🔗

1. **Go to:** `Authentication` → `URL Configuration`
2. **Set Site URL:**
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

3. **Add Redirect URLs:**
   ```
   http://localhost:5173/auth/callback
   https://yourdomain.com/auth/callback
   ```

4. **Click:** `Save`

**✅ Result:** Email verification links redirect correctly

---

## Step 3: Test Email Verification 🧪

### Register New User

1. **Open your app:** `http://localhost:5173`
2. **Click:** "Belum punya akun? Daftar"
3. **Enter:**
   - Email: `test@example.com`
   - Password: `Test123456`
4. **Click:** "Daftar Akun"

### Expected Results

✅ **Should see:**
- Green success message
- "Email verifikasi telah dikirim!"
- Form cleared
- **NOT logged in**

❌ **Should NOT see:**
- Dashboard
- User logged in
- Transaction data

### Check Email

1. **Open email inbox** for `test@example.com`
2. **Find email** from Supabase (check spam if needed)
3. **Click** verification link

### After Clicking Link

✅ **Should see:**
- Redirect to `/auth/callback`
- Success message with checkmark
- "Email berhasil diverifikasi!"
- Auto-redirect to dashboard (2 seconds)
- **NOW logged in**

---

## Step 4: Test Login Before Verification ⛔

### Scenario

1. Register new user: `test2@example.com`
2. **DON'T** click verification link
3. Try to login immediately

### Expected Results

✅ **Should see:**
- Red error message
- "Email belum diverifikasi"
- "Kirim ulang email verifikasi" button
- **NOT logged in**

❌ **Should NOT see:**
- Dashboard access
- User logged in

---

## Configuration Summary

### What You Configured

| Setting | Value | Purpose |
|---------|-------|---------|
| **Email Confirmation** | ON | Require email verification |
| **Site URL** | Your domain | Base URL for redirects |
| **Redirect URLs** | /auth/callback | Email verification callback |

### Authentication Flow

```
Registration → Email Sent → NOT Logged In
                    ↓
            User Clicks Link
                    ↓
         /auth/callback page
                    ↓
         Email Verified ✓
                    ↓
          Dashboard Access
```

---

## Troubleshooting Common Issues

### ❌ Problem: User Auto-Logged In After Signup

**Cause:** Email confirmation not enabled

**Fix:**
1. Go to: `Authentication` → `Providers` → `Email`
2. Ensure `Confirm email` is **ON**
3. Wait 2-3 minutes for changes to apply
4. Clear browser storage: `localStorage.clear()`
5. Try again

### ❌ Problem: Verification Email Not Received

**Possible Causes:**

1. **Spam Folder**
   - Check spam/junk folder
   - Add sender to contacts

2. **Wrong Email**
   - Verify email address
   - Check for typos

3. **Rate Limited**
   - Wait 5 minutes
   - Try again

4. **Email Provider Blocking**
   - Use different email provider
   - Configure custom SMTP (production)

### ❌ Problem: Callback URL Error

**Cause:** URL not configured in Supabase

**Fix:**
1. Go to: `Authentication` → `URL Configuration`
2. Add exact URL: `http://localhost:5173/auth/callback`
3. Include protocol (`http://` or `https://`)
4. Include port number if needed (`:5173`)
5. Save changes

### ❌ Problem: Token Expired Error

**Cause:** Verification link older than 24 hours

**Fix:**
1. Click "Kirim ulang email verifikasi"
2. Check new email
3. Click new verification link
4. Complete within 24 hours

---

## Optional: Custom Email Template

### Make Emails Look Professional

1. **Go to:** `Authentication` → `Email Templates`
2. **Select:** `Confirm signup`
3. **Customize** the template
4. **Use variables:**
   - `{{ .ConfirmationURL }}` - Verification link
   - `{{ .Email }}` - User's email
   - `{{ .Token }}` - Verification token

### Example Template (Copy & Paste)

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">BU - Budgeting Uang</h1>
  </div>

  <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">Konfirmasi Email Anda</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Terima kasih telah mendaftar di BU - Budgeting Uang!
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Klik tombol di bawah untuk mengaktifkan akun Anda:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
        Verifikasi Email
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
      Atau copy link berikut ke browser Anda:
    </p>
    <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; color: #4b5563; font-size: 13px; word-break: break-all;">
      {{ .ConfirmationURL }}
    </p>

    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      Link ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak mendaftar akun, abaikan email ini.
    </p>
  </div>
</div>
```

---

## Production Deployment Checklist

Before going live:

- [ ] Email confirmation enabled
- [ ] Production redirect URL added (`https://yourdomain.com/auth/callback`)
- [ ] Custom SMTP configured (recommended)
- [ ] Email template customized
- [ ] Rate limits configured
- [ ] HTTPS enabled on domain
- [ ] Test full registration flow
- [ ] Test login with unverified email
- [ ] Test resend verification email
- [ ] Test callback redirect

---

## Need Help?

### Documentation
- 📖 [Full Setup Guide](./EMAIL_VERIFICATION_SETUP.md)
- 📘 [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

### Check Status
1. **Supabase Logs:** Dashboard → Logs → Auth Logs
2. **Browser Console:** Press F12 → Console tab
3. **Network Tab:** Press F12 → Network tab

### Common Solutions
- **Clear browser storage:** `localStorage.clear()` in console
- **Wait for config:** Changes take 2-3 minutes to apply
- **Check spam folder:** Emails might be filtered
- **Verify URLs:** Must match exactly with protocol and port

---

**Quick Reference Card**

```
┌─────────────────────────────────────────┐
│  EMAIL VERIFICATION STATUS              │
├─────────────────────────────────────────┤
│  ✅ Configured: Email confirmation ON   │
│  ✅ URLs: Callback configured           │
│  ✅ Tested: Registration flow           │
│  ✅ Tested: Login blocked               │
│  ✅ Tested: Email received              │
│  ✅ Tested: Callback working            │
│  ✅ Ready: Production deployment        │
└─────────────────────────────────────────┘
```

---

**Configuration Complete! 🎉**

Your application now has secure email verification enabled.
