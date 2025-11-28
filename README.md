# Finance Tracker - Aplikasi Catatan Keuangan

![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

Aplikasi web modern untuk mengelola keuangan pribadi dengan fitur lengkap, responsive, dan dapat dikonversi menjadi APK. Dilengkapi dengan perhitungan saldo bulanan otomatis, ekspor data, dan antarmuka yang intuitif.

**Versi:** 2.4.0  
**Terakhir Diperbarui:** November 2025  
**Status:** Production Ready ✅

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Fitur Terbaru v2.4.0](#-fitur-terbaru-v240)
- [Screenshot](#-screenshot)
- [Teknologi](#️-teknologi)
- [Instalasi](#-instalasi)
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

### Manajemen Transaksi
- ✅ Tambah, edit, dan hapus transaksi
- 🏷️ Kategori kustom dengan icon
- 🔍 Pencarian real-time
- 📅 Filter tanggal pintar (hari ini, bulan ini, custom range)

### Export & Reporting
- 📊 Export ke Excel (.xlsx)
- 🖼️ Export ke PNG/JPG
- 📦 Compact dropdown (hemat 80% ruang)

---

## 🎉 Fitur Terbaru (v2.4.0)

### ✅ Monthly Balance Enhancement

**Saldo Bulanan Otomatis:**
- 📊 Perhitungan otomatis dari tanggal 1 hingga hari ini
- 🎯 Kartu highlighted dengan visual prominent
- 📅 Label dinamis "Per [tanggal hari ini]"
- 🔄 Real-time update saat ada transaksi baru
- 💡 Badge "Aktif" pada kartu utama

**Contoh:**
```
Bulan November 2025:
- Transaksi 1-21 Nov:
  • Pemasukan: Rp 5.000.000
  • Pengeluaran: Rp 4.500.000
  
- Pada 22 Nov, "Saldo Bulan Ini" menampilkan:
  • Rp 500.000 (5 juta - 4.5 juta)
  • Subtitle: "Per 22 Nov 2025"
  • Badge: "Aktif"
```

### ✅ UI/UX Improvements

**Layout Fixes:**
- 🎨 4-column grid layout (optimal desktop)
- 📐 No empty spaces, balanced spacing
- 📱 Responsive: 1 column (mobile) → 2 (tablet) → 4 (desktop)

**Visual Enhancements:**
- ✨ Highlighted primary card (blue border & ring)
- 🎨 New purple color for Total Saldo
- 🏷️ Subtitle support untuk setiap kartu
- 🔍 Hover scale effect pada kartu highlight
- 💫 Enhanced shadow untuk kartu aktif

---

## 📸 Screenshot

### Desktop View
```
┌─────────────────────────────────────────────────────┐
│  Finance Tracker              Kategori │ Keluar    │
├─────────────────────────────────────────────────────┤
│  📅 Hari Ini ▼    📥 Export ▼                       │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐│
│  │Saldo     │ │Total     │ │Pemasukan│ │Pengeluar││
│  │Bulan Ini │ │Saldo     │ │Bulan Ini│ │Bulan Ini││
│  │[AKTIF]   │ │          │ │         │ │         ││
│  │Rp 500K   │ │Rp 1.2M   │ │Rp 800K  │ │Rp 300K  ││
│  └──────────┘ └──────────┘ └────────┘ └─────────┘│
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Teknologi

- **React 18.3** + **TypeScript 5.9**
- **Vite 5.4** - Build tool
- **Tailwind CSS 3.4** - Styling
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

# 4. Run development
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

## 🎯 Penggunaan

### Menambah Transaksi
1. Klik "+ Tambah Transaksi"
2. Isi form (judul, tipe, kategori, jumlah, tanggal)
3. Simpan

### Filter Transaksi
- **Tanggal:** Hari ini, Bulan ini, Custom range
- **Kategori:** Pilih kategori tertentu
- **Tipe:** Income/Expense
- **Search:** Cari berdasarkan judul/deskripsi

### Memahami Saldo

**Saldo Bulan Ini (Highlighted):**
- Akumulatif dari tanggal 1 sampai hari ini
- Update otomatis setiap transaksi baru
- Badge "Aktif" = periode aktif

**Total Saldo (Purple):**
- Saldo keseluruhan (all time)
- Tidak terpengaruh filter tanggal

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

**Environment Variables (Netlify/Vercel):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

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

**RLS Policy errors:**
- Ensure user is logged in
- Check policies in Supabase Dashboard
- Verify user_id matches auth.uid()

### Deployment Issues

**Env vars not working:**
- Ensure `VITE_` prefix
- Rebuild after adding vars
- Check deployment logs

**404 on refresh:**
- Add redirect rules (see configs above)
- Verify `_redirects` or `vercel.json`

---

## 📁 Key Files

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard (UPDATED!)
│   ├── StatsCard.tsx          # Stats card (UPDATED!)
│   ├── CompactExportDropdown.tsx
│   └── ...
├── lib/
│   └── supabase.ts
└── ...
```

---

## 📞 Support

- 📧 Email: andreanwar713@gmail.com
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

## 🗺️ Roadmap

### v2.5.0
- [ ] Dark mode
- [ ] Budget tracking
- [ ] Recurring transactions
- [ ] Multi-currency

### v3.0.0
- [ ] Mobile app
- [ ] Bank integration
- [ ] AI insights
- [ ] Receipt scanning

---

**Made with ❤️ in Indonesia**

**Version 2.4.0** | **November 2025** | **Production Ready ✅**
