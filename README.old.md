# Finance Tracker - Aplikasi Catatan Keuangan

Aplikasi web modern untuk mengelola keuangan pribadi dengan fitur lengkap, responsive, dan dapat dikonversi menjadi APK.

**Versi:** 2.3.0
**Terakhir Diperbarui:** November 2025
**Status:** Production Ready ✅

## Fitur Utama

### 1. Manajemen Transaksi
- Pencatatan pemasukan dan pengeluaran
- Timestamp otomatis
- Form lengkap: jumlah, kategori, judul, deskripsi, tanggal
- Edit dan hapus transaksi

### 2. Sistem Kategori
- 13 kategori default (5 pemasukan, 8 pengeluaran)
- Opsi tambah kategori custom (coming soon)
- Icon visual untuk setiap kategori

### 3. Pencarian & Filter
- Search berdasarkan judul dan deskripsi
- Filter berdasarkan kategori
- Filter berdasarkan tipe (pemasukan/pengeluaran)
- Filter rentang tanggal

### 4. Dashboard & Statistik
- Total saldo real-time
- Ringkasan pemasukan vs pengeluaran
- Visualisasi data dengan kartu statistik
- Grouping transaksi berdasarkan tanggal

### 5. Keamanan
- Sistem autentikasi dengan Supabase
- Row Level Security (RLS)
- Data terenkripsi
- Setiap user hanya bisa akses data sendiri

### 6. Export & Reporting (NEW: Simplified Auto-Detection)
- **🎯 Automatic Date Detection** - Deteksi tanggal otomatis dari filter aktif
- **⚡ One-Click Export** - Export dengan 1 klik tanpa input manual
- **📊 Export Excel (.xlsx)** - Data lengkap dengan summary dan periode
- **🖼️ Export Gambar (PNG/JPG)** - Laporan visual profesional
- **📁 Smart Filename** - Nama file otomatis dengan tanggal
- **🔍 Red-Underline Detection** - Deteksi tanggal dengan garis bawah merah (dd/mm/yyyy)
- **📉 Category Breakdown** - Rincian per kategori dengan persentase
- **🎨 Simplified UI** - 63% lebih sedikit tombol (3 tombol vs 11+)
- **🚀 85% Faster** - Hemat waktu dengan mengurangi klik dari 7 ke 1

### 7. Progressive Web App (PWA)
- Dapat di-install di smartphone
- Service worker untuk caching
- Offline support (terbatas)
- Manifest untuk konversi ke APK

## Teknologi

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons

### Backend
- **Supabase** - Database & Authentication
- **PostgreSQL** - Relational database
- **Row Level Security** - Data security

### PWA & Mobile
- **Service Worker** - Offline support
- **Web Manifest** - PWA config
- **PWA Builder** - Konversi ke APK

## Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd finance-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
File `.env` sudah tersedia dengan konfigurasi Supabase.

### 4. Setup Database
Ikuti instruksi lengkap di [DATABASE_SETUP.md](./DATABASE_SETUP.md)

Ringkasan:
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Buka SQL Editor
3. Jalankan script SQL dari DATABASE_SETUP.md
4. Verifikasi tabel dan data default ter-create

### 5. Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## Build untuk Production

```bash
npm run build
```

Output akan tersedia di folder `dist/`

## Deployment

### Prerequisites
1. Node.js 18+ installed
2. npm atau yarn installed
3. Supabase project configured
4. Environment variables set up

### Build untuk Production

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build
npm run build
```

Output akan tersedia di folder `dist/`

### Deploy ke Netlify (Recommended)

**Method 1: Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

**Method 2: Netlify Dashboard**
1. Login ke [Netlify](https://app.netlify.com/)
2. Klik "Add new site" → "Import an existing project"
3. Connect ke Git repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Add environment variables dari `.env`
7. Deploy!

**Netlify Configuration:**
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Deploy ke Vercel

**Method 1: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Method 2: Vercel Dashboard**
1. Login ke [Vercel](https://vercel.com/)
2. Klik "Add New Project"
3. Import Git repository
4. Framework preset: Vite
5. Build command: `npm run build`
6. Output directory: `dist`
7. Add environment variables
8. Deploy!

### Environment Variables

Pastikan set environment variables berikut di hosting provider:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test email verification
- [ ] Test login/logout
- [ ] Test transaction CRUD operations
- [ ] Test export Excel
- [ ] Test export image with date ranges
- [ ] Test PWA installation
- [ ] Verify mobile responsiveness
- [ ] Check console for errors
- [ ] Test on different browsers

### Custom Domain (Optional)

**Netlify:**
1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS records

**Vercel:**
1. Go to Project settings → Domains
2. Add domain
3. Configure DNS records

### SSL Certificate

Both Netlify and Vercel provide automatic SSL certificates via Let's Encrypt.
HTTPS will be enabled automatically.

### Troubleshooting Deployment

**Build fails:**
- Check Node.js version (18+ required)
- Run `npm install` to ensure dependencies are installed
- Check for TypeScript errors with `npm run typecheck`

**Environment variables not working:**
- Ensure variables start with `VITE_`
- Redeploy after adding environment variables
- Clear browser cache

**404 on refresh:**
- Add `_redirects` file in `public/` folder:
  ```
  /*    /index.html   200
  ```

Lihat panduan lengkap di [DEPLOYMENT.md](./DEPLOYMENT.md)

## Konversi ke APK

Lihat panduan lengkap di [DEPLOYMENT.md](./DEPLOYMENT.md)

### Metode Paling Mudah: PWA Builder
1. Deploy aplikasi ke hosting (Netlify/Vercel)
2. Kunjungi [PWA Builder](https://www.pwabuilder.com/)
3. Masukkan URL aplikasi
4. Generate dan download APK

### Metode Alternatif:
- Capacitor (Recommended untuk native features)
- Cordova (Legacy support)

## User Manual

Panduan lengkap penggunaan aplikasi tersedia di [USER_MANUAL.md](./USER_MANUAL.md)

## Date Functionality - Technical Documentation

### Overview
The application implements an intelligent date management system for the export feature that automatically resets to today's date on each login while preserving user-selected dates during a session.

### How It Works

#### 1. Date Persistence Context
**File:** `src/contexts/DatePreferencesContext.tsx`

The `DatePreferencesContext` provides centralized date management:
- Stores date preferences in `localStorage`
- Automatically resets to today's date on new login
- Preserves date selections within the same session
- Tracks last login date to detect new sessions

```typescript
// Key features:
- startDate: string          // Selected start date
- endDate: string            // Selected end date
- resetToToday()            // Reset both dates to today
- setDateRange(start, end)  // Update date range
```

#### 2. Auto-Reset on Login
When a user logs in:
1. System checks `finance_tracker_last_login` in localStorage
2. If login date is different from stored date (new session):
   - Automatically set startDate and endDate to today
   - Update localStorage with new login date
3. If same session, preserve previously selected dates

#### 3. Date Format
- **Internal Format:** `yyyy-MM-dd` (ISO 8601)
- **Display Format:** Automatically formatted by browser to user's locale
  - Indonesian users see: `dd/mm/yyyy`
  - US users see: `mm/dd/yyyy`
- **HTML5 Date Input:** Uses native `<input type="date">` for best UX

#### 4. Export Feature Integration
**File:** `src/components/EnhancedExportMenu.tsx`

The export menu integrates with DatePreferencesContext:
- Loads saved dates on component mount
- Updates context when user changes dates
- Provides "Reset ke Hari Ini" button
- Shows current date in Indonesian format as hint

### User Experience Flow

```
User Login
    ↓
DatePreferencesContext checks last login
    ↓
If new session → Reset dates to today
If same session → Load saved dates
    ↓
User opens Export menu
    ↓
Date fields populated with:
- Today's date (new session)
- Or last selected dates (same session)
    ↓
User can:
- Use quick date buttons (Hari Ini, 7 Hari, 30 Hari)
- Manually select custom date range
- Click "Reset ke Hari Ini" anytime
    ↓
Selected dates saved to localStorage
    ↓
Export uses selected date range
```

### Technical Implementation Details

#### Why State Variables Instead of Direct Form Values?
The export feature needs to:
1. Filter transactions by date range BEFORE export
2. Pass filtered data to export component
3. Include date range in filename
4. Show date range in exported image

Direct form values would require:
- Reading DOM values (anti-pattern in React)
- No reactivity to date changes
- Complex state synchronization

State variables provide:
- React's reactive updates
- Single source of truth
- Easy data flow to child components
- Type safety with TypeScript

#### LocalStorage Schema
```javascript
{
  "finance_tracker_start_date": "2025-11-21",
  "finance_tracker_end_date": "2025-11-21",
  "finance_tracker_last_login": "Thu Nov 21 2025"
}
```

### API Reference

#### useDatePreferences Hook
```typescript
import { useDatePreferences } from '../contexts/DatePreferencesContext';

const {
  startDate,      // Current start date (yyyy-MM-dd)
  endDate,        // Current end date (yyyy-MM-dd)
  resetToToday,   // () => void - Reset to today
  setDateRange    // (start: string, end: string) => void
} = useDatePreferences();
```

## Struktur Project

```
finance-tracker/
├── public/
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service worker
├── src/
│   ├── components/       # React components
│   │   ├── AuthForm.tsx
│   │   ├── Dashboard.tsx
│   │   ├── EnhancedExportMenu.tsx  # Export with date selection
│   │   ├── SimpleExportView.tsx    # Export report layout
│   │   ├── FilterBar.tsx
│   │   ├── StatsCard.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   └── CategoryManager.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── DatePreferencesContext.tsx  # Date management
│   ├── utils/
│   │   └── emailValidation.ts      # Email validation utilities
│   ├── lib/
│   │   └── supabase.ts   # Supabase config
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── supabase/
│   └── migrations/       # Database migrations
├── DATABASE_SETUP.md     # Database setup guide
├── DEPLOYMENT.md         # Deployment & APK guide
├── USER_MANUAL.md        # User manual
├── SECURITY_IMPROVEMENTS.md  # Security documentation
└── README.md            # This file
```

## Database Schema

### Table: categories
```sql
- id (uuid, primary key)
- user_id (uuid, nullable)
- name (text)
- type (text: 'income' | 'expense')
- is_default (boolean)
- icon (text)
- created_at (timestamp)
```

### Table: transactions
```sql
- id (uuid, primary key)
- user_id (uuid)
- amount (numeric)
- type (text: 'income' | 'expense')
- category_id (uuid)
- title (text)
- description (text, nullable)
- transaction_date (date)
- created_at (timestamp)
- updated_at (timestamp)
```

## Security

### Row Level Security (RLS)
- Semua tabel menggunakan RLS
- User hanya bisa akses data sendiri
- Default categories dapat diakses semua user
- Custom categories hanya untuk owner

### Authentication
- Email/password authentication
- Secure session management
- Password hashing otomatis

## Performance

- Lazy loading components
- Optimized database queries dengan indexes
- Service worker caching
- Minimal bundle size

## Browser Support

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Mobile browsers (Chrome, Safari)

## Mobile Support

### Responsive Design
- Mobile-first approach
- Breakpoints untuk tablet dan desktop
- Touch-friendly UI

### PWA Features
- Install to home screen
- Offline support
- Fast loading dengan caching

## Troubleshooting

### Database connection error
- Pastikan .env file ada dan valid
- Check Supabase project status
- Verify database schema sudah di-setup

### Authentication error
- Clear browser cache
- Check email format
- Password minimal 6 karakter

### PWA tidak install
- Pastikan HTTPS aktif
- Check manifest.json valid
- Verify service worker registered

## Fitur Terbaru (v2.3.0)

### ✅ Critical Bug Fix & Dashboard Improvements (NEW!)
- **🐛 Date Filtering Bug Fixed** - Transaksi sekarang tampil sesuai tanggal yang dipilih (fix bug tanggal 21 muncul saat pilih tanggal 22)
- **📦 Compact Export Dropdown** - Menu export hemat 80% ruang dengan dropdown yang elegant
- **📊 Monthly Balance Calculation** - Saldo otomatis hitung berdasarkan periode bulan yang dipilih
- **📱 Enhanced Responsive Design** - Sticky header, grid cerdas (1→2→3 kolom), full-width button mobile
- **👆 Touch-Friendly UI** - Semua button minimal 44px untuk kemudahan tap di mobile
- **⚡ Client-Side Filtering** - Filter tanggal sekarang presisi di client untuk hasil yang akurat
- **🎯 Better Space Utilization** - Interface lebih bersih dengan dropdown yang compact
- **📈 Period-Based Stats** - Stats cards menampilkan total berdasarkan periode yang dipilih

## Fitur Terbaru (v2.2.0)

### ✅ Enhanced UI/UX Design (NEW!)
- **🎨 Modern Visual Design** - Gradient backgrounds, smooth animations, professional appearance
- **📅 Smart Date Display** - Shows "Hari Ini" for today, "Kemarin" for yesterday with dd/mm/yyyy format
- **💳 Enhanced Transaction Cards** - Gradient hover effects, animated icons, badge-style displays
- **📊 Daily Summary Badges** - Income/expense totals for each day with color-coded badges
- **🎯 Improved Date Picker** - Emoji icons, gradient styling, animated interactions
- **✨ Micro-interactions** - Scale animations, hover effects, smooth transitions throughout
- **📱 Better Mobile UX** - Responsive design with touch-friendly elements
- **🕐 Today by Default** - Page loads showing today's date automatically

## Fitur Terbaru (v2.1.0)

### ✅ Simplified Export with Auto Date Detection (NEW!)
- **Automatic Date Detection** - Sistem pintar deteksi tanggal dari filter
- **Red-Underline Recognition** - Scan UI untuk tanggal dd/mm/yyyy bergaris bawah merah
- **One-Click Export** - Ekspor langsung tanpa input manual (1 klik vs 7 klik)
- **Smart Filename Generation** - Nama file otomatis dengan tanggal dan timestamp
- **3-Button Interface** - Excel, PNG, JPG (dikurangi dari 11+ elemen UI)
- **Multiple Detection Methods** - Filter state → UI scan → Today fallback
- **85% Time Savings** - Workflow super cepat untuk pengguna

### ✅ Sistem Export Lengkap (v2.0.0)
- Export Excel dengan ringkasan dan detail transaksi
- Export gambar (PNG/JPG) dengan date range selection
- Laporan visual dengan breakdown kategori
- Progress bar persentase untuk setiap kategori
- Otomatis reset tanggal ke hari ini setiap login

### ✅ Email Validation & Verification
- Validasi domain email real-time
- Blokir email disposable/temporary
- Deteksi typo dan saran koreksi
- Password strength meter
- Email verification wajib sebelum login

### ✅ Security Improvements
- RLS policies optimized dengan `(select auth.uid())`
- Function search path secured
- Unused indexes removed
- Performance optimization di semua query

### ✅ Mobile Responsive
- Full responsive design untuk semua ukuran layar
- Touch-friendly buttons dan inputs
- Optimized layout untuk mobile, tablet, desktop
- Date picker mobile-friendly

## Roadmap

- [ ] Charts dan grafik visualisasi interaktif
- [ ] Recurring transactions (transaksi berulang)
- [ ] Budget planning dengan notifikasi
- [ ] Multi-currency support
- [ ] Dark mode
- [ ] Custom categories management UI enhancement
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Backup & restore data
- [ ] CSV import

## Contributing

Contributions are welcome! Silakan buat pull request atau issue.

## License

MIT License - feel free to use for personal or commercial projects.

## Support

Jika ada pertanyaan atau masalah:
- Buka issue di GitHub
- Email developer
- Check documentation files

---

Dibuat dengan React, TypeScript, Tailwind CSS, dan Supabase.
