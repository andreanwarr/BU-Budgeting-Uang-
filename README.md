# Finance Tracker - Aplikasi Catatan Keuangan

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

Aplikasi web modern untuk mengelola keuangan pribadi dengan fitur lengkap, responsive, dan dapat dikonversi menjadi APK. Dilengkapi dengan dark mode, multi-bahasa, multi-currency, dan antarmuka yang intuitif.

**Versi:** 3.0.0
**Terakhir Diperbarui:** November 2025
**Status:** Production Ready ✅

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Fitur Terbaru v3.0.0](#-fitur-terbaru-v300)
- [Bug Fixes](#-bug-fixes-v300)
- [Screenshot](#-screenshot)
- [Teknologi](#️-teknologi)
- [Instalasi](#-instalasi)
- [Setup Database](#-setup-database)
- [Penggunaan](#-penggunaan)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🌟 Fitur Utama

### Dashboard & Statistik
- 📊 **Saldo Bulan Ini** - Tampilan saldo akumulatif bulan berjalan (Highlighted!)
- 💰 **Total Saldo Keseluruhan** - Lihat total saldo dari semua transaksi
- 📈 **Pemasukan Bulanan** - Monitor pemasukan bulan ini
- 📉 **Pengeluaran Bulanan** - Pantau pengeluaran bulan ini
- ⚡ **Quick Add Button** - Tombol floating untuk tambah transaksi cepat

### Manajemen Transaksi
- ✅ Tambah, edit, dan hapus transaksi
- 🏷️ Kategori kustom dengan icon
- 🔍 Pencarian real-time
- 📅 Filter tanggal pintar (hari ini, bulan ini, custom range)
- 🎨 Dark mode support

### Pengaturan & Kustomisasi
- 🌙 **Dark/Light Mode** - Toggle tema dengan persistensi
- 🌍 **Multi-bahasa** - English & Bahasa Indonesia
- 💱 **Multi-currency** - USD ($) & IDR (Rp)
- 💾 Semua preferensi tersimpan otomatis

### Export & Reporting
- 📊 Export ke Excel (.xlsx)
- 🖼️ Export ke PNG/JPG
- 📦 Compact dropdown (hemat 80% ruang)

---

## 🎉 Fitur Terbaru (v3.0.0)

### ✅ Dark/Light Mode Theme Toggle
**Fitur:**
- 🌙 Toggle dark/light mode dengan smooth transition
- 💾 Preferensi tema tersimpan otomatis
- 🎨 Konsisten di semua komponen
- 🔄 Sinkronisasi dengan database
- ⚡ Instant feedback visual

**Cara Menggunakan:**
1. Klik ikon moon/sun di sidebar (bawah)
2. Atau buka Settings → Theme
3. Pilih Light atau Dark
4. Tema langsung berubah dan tersimpan

### ✅ Multi-Language Support
**Bahasa Tersedia:**
- 🇬🇧 English
- 🇮🇩 Bahasa Indonesia

**Fitur:**
- Otomatis terapkan ke seluruh UI
- Tersimpan per user
- Switch instant tanpa reload

### ✅ Multi-Currency Support
**Currency Tersedia:**
- 💵 USD (Dollar Amerika)
- 💴 IDR (Rupiah Indonesia)

**Fitur:**
- Format angka sesuai locale
- Simbol mata uang otomatis
- Tersimpan per user

### ✅ Settings Menu
**Halaman Pengaturan Lengkap:**
- Theme toggle (Light/Dark)
- Language selection
- Currency selection
- About section dengan info aplikasi

### ✅ Quick Transaction Button
- Tombol floating di pojok kanan bawah
- Akses cepat tambah transaksi
- Selalu visible saat scroll

---

## 🐛 Bug Fixes (v3.0.0)

### Fixed: Theme Toggle Not Working
**Masalah:**
- Theme toggle tidak mengubah tampilan
- Preferensi tidak tersimpan ke database
- Race condition saat settings belum ada

**Solusi:**
- Fixed `updateSettings` function logic
- Improved state management
- Added proper async handling
- Theme now persists correctly

**Technical Details:**
```typescript
// Before (Bug)
const updateSettings = async (updates) => {
  if (settingsId) {
    await supabase.update(...)
  } else {
    await createDefaultSettings();
    if (settingsId) { // ❌ settingsId masih null!
      await supabase.update(...)
    }
  }
};

// After (Fixed)
const updateSettings = async (updates) => {
  if (settingsId) {
    await supabase.update(...)
  } else {
    // ✅ Insert dengan updates langsung
    const { data } = await supabase.insert([{
      user_id: user.id,
      language: updates.language || language,
      currency: updates.currency || currency,
      theme: updates.theme || theme,
    }]).select().single();

    if (data) setSettingsId(data.id);
  }
};
```

### Fixed: Database Tables Not Created
**Masalah:**
- Tabel `transactions`, `categories`, dan `kasbon` tidak ada
- App error saat mencoba query
- RLS policies tidak berfungsi

**Solusi:**
- Created comprehensive migration
- Added all required tables:
  - `categories` (14 default categories)
  - `transactions` (with foreign keys)
  - `kasbon` (loan management)
  - `user_settings` (already existed)
- Implemented proper RLS policies
- Added performance indexes
- Auto-update triggers for updated_at

**Database Schema:**
```sql
-- Categories: Kategori transaksi
- id, user_id, name, type, is_default, icon
- RLS: Users see default + own categories

-- Transactions: Transaksi keuangan
- id, user_id, amount, type, category_id, title, description, transaction_date
- RLS: Users only see own transactions

-- Kasbon: Loan/debt tracking
- id, user_id, name, amount, type, status, due_date, notes
- RLS: Users only see own kasbon

-- User Settings: Preferensi user
- id, user_id, language, currency, theme
- RLS: Users only see own settings
```

---

## 📸 Screenshot

### Desktop View (Light Mode)
```
┌─────────────────────────────────────────────────────┐
│  🌙 BU                    Dashboard │ Settings │ ☰  │
├─────────────────────────────────────────────────────┤
│  📅 Hari Ini ▼    📥 Export ▼                  ⊕   │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐│
│  │Saldo     │ │Total     │ │Pemasukan│ │Pengeluar││
│  │Bulan Ini │ │Saldo     │ │Bulan Ini│ │Bulan Ini││
│  │[AKTIF]   │ │          │ │         │ │         ││
│  │Rp 500K   │ │Rp 1.2M   │ │Rp 800K  │ │Rp 300K  ││
│  └──────────┘ └──────────┘ └────────┘ └─────────┘│
└─────────────────────────────────────────────────────┘
```

### Desktop View (Dark Mode)
```
┌─────────────────────────────────────────────────────┐
│  ☀️ BU                    Dashboard │ Settings │ ☰  │
├─────────────────────────────────────────────────────┤
│  [Dark themed with gradient backgrounds]            │
│  All cards, buttons, and text in dark mode         │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Teknologi

- **React 18.3** + **TypeScript 5.9**
- **Vite 5.4** - Build tool
- **Tailwind CSS 3.4** - Styling (with dark mode)
- **Supabase** - Backend & Database
- **Lucide React** - Icons
- **date-fns 4.1** - Date manipulation
- **xlsx 0.18** - Excel export

---

## 📦 Instalasi

### Prerequisites
- Node.js 18+
- npm 9+
- Akun Supabase

### Steps

```bash
# 1. Clone repository
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env dengan Supabase credentials

# 4. Setup database (PENTING!)
# Jalankan migration di Supabase Dashboard
# Lihat bagian "Setup Database" di bawah

# 5. Run development
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Get credentials:**
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project → Settings → API
3. Copy Project URL dan anon key

---

## 🗄️ Setup Database

### CRITICAL: Database Migration Required!

Aplikasi ini memerlukan database tables yang harus dibuat sebelum digunakan.

### Option 1: Via Supabase Dashboard (Recommended)

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Buka **SQL Editor**
4. Jalankan migration berikut secara berurutan:

**File migrations:**
- `supabase/migrations/create_core_tables.sql` - Creates categories, transactions, kasbon tables
- `supabase/migrations/create_user_settings_table.sql` - Creates user_settings table

5. Verify tables created:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

You should see:
- `categories`
- `transactions`
- `kasbon`
- `user_settings`

### Option 2: Via Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push

# Verify
supabase db diff
```

### Verify Database Setup

Setelah migration, cek:

1. **Tables exist:**
   - categories (with 14 default categories)
   - transactions
   - kasbon
   - user_settings

2. **RLS enabled:**
   - All tables have RLS enabled
   - Policies created for authenticated users

3. **Default data:**
   - 14 default categories (Gaji, Bonus, Makanan, etc.)

### Troubleshooting Database

**Error: relation "categories" does not exist**
- Run the core tables migration
- Verify in SQL Editor: `SELECT * FROM categories;`

**Error: RLS policy violation**
- Ensure you're logged in
- Check policies in Dashboard → Authentication → Policies

**Theme not saving**
- Ensure `user_settings` table exists
- Check if RLS policies are correct

---

## 🎯 Penggunaan

### Menambah Transaksi
1. Klik "+ Tambah Transaksi" atau tombol floating ⊕
2. Isi form (judul, tipe, kategori, jumlah, tanggal)
3. Simpan

### Mengubah Theme
1. **Via Sidebar:** Klik ikon moon/sun di bagian bawah
2. **Via Settings:** Buka Settings → Theme → Pilih Light/Dark

### Mengubah Bahasa
1. Buka Settings
2. Pilih Language → English atau Bahasa Indonesia
3. UI langsung berubah

### Mengubah Currency
1. Buka Settings
2. Pilih Currency → USD ($) atau IDR (Rp)
3. Semua angka otomatis terformat ulang

### Filter Transaksi
- **Tanggal:** Hari ini, Bulan ini, Custom range
- **Kategori:** Pilih kategori tertentu
- **Tipe:** Income/Expense
- **Search:** Cari berdasarkan judul/deskripsi

### Export Data
1. Klik dropdown "Export"
2. Pilih format: Excel, PNG, atau JPG
3. File otomatis download

---

## 🚀 Deployment

### Build

```bash
npm run build
```

Output: `dist/` folder

### Deploy ke Netlify

```bash
# Via CLI
netlify deploy --prod --dir=dist

# Via Dashboard
# 1. Drag & drop folder dist/
# 2. Add environment variables
```

**Netlify Configuration:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deploy ke Vercel

```bash
# Via CLI
vercel --prod

# Via Dashboard
# 1. Import dari Git
# 2. Framework: Vite
# 3. Build: npm run build
# 4. Output: dist
```

**Environment Variables (All Platforms):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### IMPORTANT: Post-Deployment

After deploying, ensure:

1. ✅ Environment variables set correctly
2. ✅ Database migrations applied
3. ✅ Test login/signup works
4. ✅ Test theme toggle works
5. ✅ Test transaction CRUD works

### Other Platforms

**Railway:**
- Auto-detect Vite
- Add env vars → Deploy

**Render:**
- Build: `npm run build`
- Publish: `dist`

**GitHub Pages:**
```bash
npm install -D gh-pages
npm run deploy
```

Update `vite.config.ts`:
```typescript
base: '/finance-tracker/'
```

---

## 🔧 Troubleshooting

### Build Errors

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
npm run typecheck
```

### Runtime Errors

**Supabase connection failed:**
- Check `.env` file
- Verify URL and anon key
- Restart dev server

**Table does not exist:**
- Run database migrations (see Setup Database)
- Verify tables in Supabase Dashboard

**RLS Policy errors:**
- Ensure user is logged in
- Check policies in Supabase Dashboard
- Verify user_id matches auth.uid()

**Theme not changing:**
- Check browser console for errors
- Clear browser cache
- Verify `user_settings` table exists
- Check Network tab for failed requests

**Settings not saving:**
- Ensure `user_settings` table has RLS policies
- Check if authenticated user can insert/update
- Verify in Supabase Dashboard → Table Editor

### Deployment Issues

**Env vars not working:**
- Ensure `VITE_` prefix
- Rebuild after adding vars
- Check deployment logs

**404 on refresh:**
- Add redirect rules (see configs above)
- Verify `_redirects` or `vercel.json`

**Dark mode not persisting:**
- Check if cookies/localStorage enabled
- Verify database connection in production
- Test with different browsers

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx           # Main dashboard with stats
│   ├── Settings.tsx            # Settings page (NEW!)
│   ├── Sidebar.tsx             # Sidebar with theme toggle
│   ├── StatsCard.tsx           # Stats card with dark mode
│   ├── TransactionForm.tsx     # Transaction form modal
│   ├── TransactionList.tsx     # Transaction list with dark mode
│   ├── QuickTransactionButton.tsx # Floating add button (NEW!)
│   └── ...
├── contexts/
│   ├── AuthContext.tsx         # Authentication
│   ├── SettingsContext.tsx     # Settings & theme (FIXED!)
│   └── DatePreferencesContext.tsx
├── lib/
│   └── supabase.ts             # Supabase client
└── ...

supabase/migrations/
├── create_core_tables.sql      # Categories, transactions, kasbon (NEW!)
└── create_user_settings_table.sql # User settings
```

---

## 📞 Support

- 📧 Email: andreanwar713@gmail.com
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

## 🗺️ Roadmap

### v3.1.0
- [ ] Budget tracking
- [ ] Recurring transactions
- [ ] Financial goals
- [ ] Enhanced charts

### v4.0.0
- [ ] Mobile app (React Native)
- [ ] Bank integration
- [ ] AI insights
- [ ] Receipt scanning
- [ ] Multi-user accounts

---

## 📝 Changelog

### v3.0.0 (November 2025)
- ✅ Fixed theme toggle functionality
- ✅ Fixed database creation issues
- ✅ Added dark/light mode support
- ✅ Added multi-language (EN/ID)
- ✅ Added multi-currency (USD/IDR)
- ✅ Added Settings page
- ✅ Added Quick Add button
- ✅ Improved state management
- ✅ Enhanced RLS policies
- ✅ Added comprehensive migrations

### v2.4.0 (November 2025)
- Monthly balance enhancement
- UI/UX improvements
- Compact export dropdown

---

**Made with ❤️ in Indonesia**

**Version 3.0.0** | **November 2025** | **Production Ready ✅**
