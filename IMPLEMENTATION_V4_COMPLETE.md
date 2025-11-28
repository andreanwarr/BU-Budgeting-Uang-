# 🚀 BU - BUDGETING KEUANGAN V4.0 - COMPLETE IMPLEMENTATION GUIDE

## 📋 Table of Contents
1. [Email Verification](#1-email-verification)
2. [Permanent Sidebar](#2-permanent-sidebar)
3. [Page Restructure](#3-page-restructure)
4. [Language Switcher](#4-language-switcher)
5. [Dark Mode](#5-dark-mode)
6. [Charts Integration](#6-charts)
7. [Kasbon Feature](#7-kasbon)
8. [Responsive Design](#8-responsive)
9. [Updated README](#9-readme)

---

## 1. EMAIL VERIFICATION ✅

### ✅ Status: IMPLEMENTED

### Configuration Needed in Supabase Dashboard:

1. Go to **Authentication** → **Email Templates**
2. Enable **Confirm signup**
3. Update redirect URL: `{{ .SiteURL }}/auth/callback`

### Code Changes Made:

**`src/contexts/AuthContext.tsx`**
```typescript
const signUp = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });
  return { error };
};
```

**`src/components/AuthForm.tsx`**
- ✅ Shows verification sent message
- ✅ Handles "Email not confirmed" error
- ✅ User-friendly error messages
- ✅ Security notice for signup

### User Flow:
```
1. User signs up → Email sent
2. User clicks link in email → Verified
3. User redirected to app → Can login
4. If tries to login before verify → Error shown
```

---

## 2. PERMANENT SIDEBAR

### File: `src/components/PermanentSidebar.tsx`

```typescript
import { Home, List, FolderPlus, HandCoins, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PermanentSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: 'id' | 'en';
}

export function PermanentSidebar({ 
  currentPage, 
  onNavigate, 
  darkMode, 
  toggleDarkMode,
  language 
}: PermanentSidebarProps) {
  const { user, signOut } = useAuth();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: { id: 'Dashboard', en: 'Dashboard' }, 
      icon: Home 
    },
    { 
      id: 'transactions', 
      label: { id: 'Transaksi', en: 'Transactions' }, 
      icon: List 
    },
    { 
      id: 'categories', 
      label: { id: 'Kategori', en: 'Categories' }, 
      icon: FolderPlus 
    },
    { 
      id: 'kasbon', 
      label: { id: 'Kasbon', en: 'Loans' }, 
      icon: HandCoins 
    },
    { 
      id: 'settings', 
      label: { id: 'Pengaturan', en: 'Settings' }, 
      icon: Settings 
    }
  ];

  return (
    <aside className={`w-64 h-screen flex flex-col border-r sticky top-0 ${
      darkMode 
        ? 'bg-slate-900 border-slate-700' 
        : 'bg-white border-slate-200'
    }`}>
      {/* Logo & Title */}
      <div className={`p-6 border-b ${
        darkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl">
            <HandCoins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>BU</h1>
            <p className={`text-xs ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Budgeting Keuangan
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className={`p-4 border-b ${
        darkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
              {user?.email?.[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>
              {user?.email}
            </p>
            <p className={`text-xs ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {language === 'id' ? 'Pengguna' : 'User'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? darkMode
                    ? 'bg-emerald-900/50 text-emerald-300'
                    : 'bg-emerald-50 text-emerald-700'
                  : darkMode
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-50'
              } ${isActive ? 'font-semibold' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label[language]}</span>
            </button>
          );
        })}
      </nav>

      {/* Dark Mode Toggle */}
      <div className={`p-4 border-t ${
        darkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            darkMode
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{darkMode ? (language === 'id' ? 'Mode Terang' : 'Light Mode') : (language === 'id' ? 'Mode Gelap' : 'Dark Mode')}</span>
        </button>
      </div>

      {/* Logout Button */}
      <div className={`p-4 border-t ${
        darkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{language === 'id' ? 'Keluar' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
}
```

### Key Features:
- ✅ Always visible (no collapse)
- ✅ 5 menu items
- ✅ Dark mode support
- ✅ Language support
- ✅ User info display
- ✅ Logout button
- ✅ Active state indicator

---

## 3. PAGE RESTRUCTURE

### Main App Layout: `src/App.tsx`

```typescript
import { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { PermanentSidebar } from './components/PermanentSidebar';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { KasbonPage } from './pages/KasbonPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuth } from './contexts/AuthContext';

type Page = 'dashboard' | 'transactions' | 'categories' | 'kasbon' | 'settings';
type Language = 'id' | 'en';

function App() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('id');

  // Load preferences from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = (localStorage.getItem('language') || 'id') as Language;
    setDarkMode(savedDarkMode);
    setLanguage(savedLanguage);
    
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className={`flex min-h-screen ${
      darkMode ? 'dark bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'
    }`}>
      <PermanentSidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as Page)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        language={language}
      />

      <main className="flex-1 overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          {currentPage === 'dashboard' && <DashboardPage language={language} darkMode={darkMode} />}
          {currentPage === 'transactions' && <TransactionsPage language={language} darkMode={darkMode} />}
          {currentPage === 'categories' && <CategoriesPage language={language} darkMode={darkMode} />}
          {currentPage === 'kasbon' && <KasbonPage language={language} darkMode={darkMode} />}
          {currentPage === 'settings' && (
            <SettingsPage 
              language={language} 
              darkMode={darkMode} 
              onLanguageChange={changeLanguage}
              onDarkModeToggle={toggleDarkMode}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
```

---

## 4. LANGUAGE SWITCHER

### Create Language Context: `src/contexts/LanguageContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'id' | 'en';

interface Translations {
  [key: string]: {
    id: string;
    en: string;
  };
}

export const translations: Translations = {
  // Dashboard
  dashboard: { id: 'Dashboard', en: 'Dashboard' },
  monthlyBalance: { id: 'Saldo Bulan Ini', en: 'Monthly Balance' },
  totalBalance: { id: 'Saldo Keseluruhan', en: 'Total Balance' },
  income: { id: 'Pemasukan', en: 'Income' },
  expense: { id: 'Pengeluaran', en: 'Expense' },
  thisMonth: { id: 'Bulan Ini', en: 'This Month' },
  
  // Transactions
  transactions: { id: 'Transaksi', en: 'Transactions' },
  addTransaction: { id: 'Tambah Transaksi', en: 'Add Transaction' },
  searchTransactions: { id: 'Cari transaksi...', en: 'Search transactions...' },
  
  // Categories
  categories: { id: 'Kategori', en: 'Categories' },
  addCategory: { id: 'Tambah Kategori', en: 'Add Category' },
  
  // Kasbon
  kasbon: { id: 'Kasbon', en: 'Loans' },
  addKasbon: { id: 'Tambah Kasbon', en: 'Add Loan' },
  unpaid: { id: 'Belum Lunas', en: 'Unpaid' },
  paid: { id: 'Lunas', en: 'Paid' },
  
  // Settings
  settings: { id: 'Pengaturan', en: 'Settings' },
  language: { id: 'Bahasa', en: 'Language' },
  theme: { id: 'Tema', en: 'Theme' },
  darkMode: { id: 'Mode Gelap', en: 'Dark Mode' },
  lightMode: { id: 'Mode Terang', en: 'Light Mode' },
  
  // Common
  save: { id: 'Simpan', en: 'Save' },
  cancel: { id: 'Batal', en: 'Cancel' },
  edit: { id: 'Edit', en: 'Edit' },
  delete: { id: 'Hapus', en: 'Delete' },
  search: { id: 'Cari', en: 'Search' },
  filter: { id: 'Filter', en: 'Filter' },
  export: { id: 'Export', en: 'Export' },
  logout: { id: 'Keluar', en: 'Logout' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'id' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
```

---

## 5. DARK MODE

### Tailwind Configuration: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Dark Mode Implementation:

**In App.tsx (already shown above)**:
- Uses `dark` class on `<html>` element
- Saves preference to localStorage
- Propagates darkMode prop to all pages

**Usage in Components**:
```typescript
className={`${
  darkMode 
    ? 'bg-slate-800 text-white' 
    : 'bg-white text-slate-800'
}`}
```

---

## 6. CHARTS WITH RECHARTS

### Enhanced Charts Component: `src/components/EnhancedCharts.tsx`

```typescript
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Transaction {
  id: string;
  category: { name: string; icon: string };
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
}

interface EnhancedChartsProps {
  transactions: Transaction[];
  darkMode: boolean;
  language: 'id' | 'en';
  chartType?: 'bar' | 'pie' | 'line';
}

const COLORS = {
  income: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  expense: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2']
};

export function EnhancedCharts({ 
  transactions, 
  darkMode, 
  language,
  chartType = 'bar'
}: EnhancedChartsProps) {
  
  // Bar chart data: Per category
  const categoryData = useMemo(() => {
    const grouped: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const category = t.category.name;
      if (!grouped[category]) {
        grouped[category] = { income: 0, expense: 0 };
      }
      grouped[category][t.type] += Number(t.amount);
    });

    return Object.entries(grouped).map(([name, data]) => ({
      name,
      [language === 'id' ? 'Pemasukan' : 'Income']: data.income,
      [language === 'id' ? 'Pengeluaran' : 'Expense']: data.expense
    }));
  }, [transactions, language]);

  // Pie chart data: Distribution
  const pieData = useMemo(() => {
    const incomeCategories: Record<string, number> = {};
    const expenseCategories: Record<string, number> = {};

    transactions.forEach((t) => {
      const category = t.category.name;
      if (t.type === 'income') {
        incomeCategories[category] = (incomeCategories[category] || 0) + Number(t.amount);
      } else {
        expenseCategories[category] = (expenseCategories[category] || 0) + Number(t.amount);
      }
    });

    return {
      income: Object.entries(incomeCategories).map(([name, value]) => ({ name, value })),
      expense: Object.entries(expenseCategories).map(([name, value]) => ({ name, value }))
    };
  }, [transactions]);

  // Line chart data: Timeline (last 6 months)
  const timelineData = useMemo(() => {
    const grouped: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const date = new Date(t.transaction_date);
      const month = date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { 
        month: 'short', 
        year: 'numeric' 
      });

      if (!grouped[month]) {
        grouped[month] = { income: 0, expense: 0 };
      }
      grouped[month][t.type] += Number(t.amount);
    });

    return Object.entries(grouped)
      .map(([month, data]) => ({
        month,
        [language === 'id' ? 'Pemasukan' : 'Income']: data.income,
        [language === 'id' ? 'Pengeluaran' : 'Expense']: data.expense
      }))
      .slice(-6);
  }, [transactions, language]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const chartTextColor = darkMode ? '#cbd5e1' : '#475569';
  const gridColor = darkMode ? '#334155' : '#e2e8f0';

  if (chartType === 'bar') {
    return (
      <div className={`p-6 rounded-2xl border ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          darkMode ? 'text-white' : 'text-slate-800'
        }`}>
          {language === 'id' ? 'Per Kategori' : 'By Category'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" stroke={chartTextColor} />
            <YAxis 
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
              stroke={chartTextColor}
            />
            <Tooltip 
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: darkMode ? '#ffffff' : '#000000'
              }}
            />
            <Legend />
            <Bar 
              dataKey={language === 'id' ? 'Pemasukan' : 'Income'} 
              fill="#10b981" 
            />
            <Bar 
              dataKey={language === 'id' ? 'Pengeluaran' : 'Expense'} 
              fill="#ef4444" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartType === 'pie') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Pie */}
        <div className={`p-6 rounded-2xl border ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {language === 'id' ? 'Distribusi Pemasukan' : 'Income Distribution'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData.income}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.income.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.income[index % COLORS.income.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Pie */}
        <div className={`p-6 rounded-2xl border ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {language === 'id' ? 'Distribusi Pengeluaran' : 'Expense Distribution'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData.expense}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.expense.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.expense[index % COLORS.expense.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                  border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Line chart
  return (
    <div className={`p-6 rounded-2xl border ${
      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        darkMode ? 'text-white' : 'text-slate-800'
      }`}>
        {language === 'id' ? 'Tren 6 Bulan Terakhir' : '6 Month Trend'}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={timelineData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="month" stroke={chartTextColor} />
          <YAxis 
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            stroke={chartTextColor}
          />
          <Tooltip 
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              backgroundColor: darkMode ? '#1e293b' : '#ffffff',
              border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
              borderRadius: '8px',
              color: darkMode ? '#ffffff' : '#000000'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={language === 'id' ? 'Pemasukan' : 'Income'} 
            stroke="#10b981" 
            strokeWidth={2} 
          />
          <Line 
            type="monotone" 
            dataKey={language === 'id' ? 'Pengeluaran' : 'Expense'} 
            stroke="#ef4444" 
            strokeWidth={2} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## 7. KASBON FEATURE

### Kasbon Table Schema (Already Created ✅)

```sql
CREATE TABLE kasbon (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  loan_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes & RLS already configured ✅
```

### Kasbon Page: `src/pages/KasbonPage.tsx`

```typescript
import { KasbonManager } from '../components/KasbonManager';

interface KasbonPageProps {
  language: 'id' | 'en';
  darkMode: boolean;
}

export function KasbonPage({ language, darkMode }: KasbonPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${
          darkMode ? 'text-white' : 'text-slate-800'
        }`}>
          {language === 'id' ? 'Manajemen Kasbon' : 'Loan Management'}
        </h1>
        <p className={`mt-2 ${
          darkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {language === 'id' 
            ? 'Kelola pinjaman dan pelunasan' 
            : 'Manage loans and repayments'}
        </p>
      </div>

      <KasbonManager language={language} darkMode={darkMode} />
    </div>
  );
}
```

### Integration with Dashboard:

**In Dashboard, add kasbon summary:**
```typescript
// Load kasbon data
const [kasbons, setKasbons] = useState<any[]>([]);

useEffect(() => {
  loadKasbons();
}, [user]);

const loadKasbons = async () => {
  const { data } = await supabase
    .from('kasbon')
    .select('*')
    .eq('user_id', user.id);
  if (data) setKasbons(data);
};

// Calculate kasbon stats
const kasbonStats = {
  totalUnpaid: kasbons
    .filter(k => k.status === 'unpaid')
    .reduce((sum, k) => sum + Number(k.amount), 0),
  totalPaid: kasbons
    .filter(k => k.status === 'paid')
    .reduce((sum, k) => sum + Number(k.amount), 0),
  monthlyUnpaid: kasbons
    .filter(k => {
      const date = new Date(k.loan_date);
      const now = new Date();
      return k.status === 'unpaid' && 
             date.getMonth() === now.getMonth() &&
             date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, k) => sum + Number(k.amount), 0)
};

// Add kasbon card to dashboard
<StatsCard
  title={language === 'id' ? 'Kasbon Belum Lunas' : 'Unpaid Loans'}
  subtitle={language === 'id' ? 'Total Outstanding' : 'Total Outstanding'}
  amount={kasbonStats.totalUnpaid}
  icon={HandCoins}
  color="orange"
/>
```

---

## 8. RESPONSIVE DESIGN

### Mobile-First Approach:

**Sidebar on Mobile**:
```typescript
// In PermanentSidebar component
<aside className={`
  w-64 h-screen flex flex-col border-r sticky top-0
  hidden md:flex // Hide on mobile, show on tablet+
  ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}
`}>
```

**Add Mobile Menu Button**:
```typescript
// In App.tsx, add mobile menu toggle
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

// Mobile menu button (show only on small screens)
<button 
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  className="md:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-600 text-white rounded-lg"
>
  <Menu className="w-6 h-6" />
</button>

// Mobile sidebar (overlay)
{mobileMenuOpen && (
  <>
    <div 
      className="md:hidden fixed inset-0 bg-black/50 z-40"
      onClick={() => setMobileMenuOpen(false)}
    />
    <div className="md:hidden fixed inset-y-0 left-0 w-64 z-50">
      <PermanentSidebar {...props} />
    </div>
  </>
)}
```

**Responsive Cards**:
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

**Responsive Tables**:
```typescript
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* Table content */}
  </table>
</div>
```

---

## 9. SETTINGS PAGE

### File: `src/pages/SettingsPage.tsx`

```typescript
import { Globe, Moon, Sun } from 'lucide-react';

interface SettingsPageProps {
  language: 'id' | 'en';
  darkMode: boolean;
  onLanguageChange: (lang: 'id' | 'en') => void;
  onDarkModeToggle: () => void;
}

export function SettingsPage({
  language,
  darkMode,
  onLanguageChange,
  onDarkModeToggle
}: SettingsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${
          darkMode ? 'text-white' : 'text-slate-800'
        }`}>
          {language === 'id' ? 'Pengaturan' : 'Settings'}
        </h1>
        <p className={`mt-2 ${
          darkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {language === 'id' 
            ? 'Kelola preferensi aplikasi Anda' 
            : 'Manage your app preferences'}
        </p>
      </div>

      {/* Language Setting */}
      <div className={`p-6 rounded-2xl border ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <Globe className={`w-5 h-5 ${
            darkMode ? 'text-emerald-400' : 'text-emerald-600'
          }`} />
          <h2 className={`text-lg font-semibold ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {language === 'id' ? 'Bahasa' : 'Language'}
          </h2>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onLanguageChange('id')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              language === 'id'
                ? 'bg-emerald-600 text-white'
                : darkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🇮🇩 Bahasa Indonesia
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              language === 'en'
                ? 'bg-emerald-600 text-white'
                : darkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Theme Setting */}
      <div className={`p-6 rounded-2xl border ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          {darkMode ? (
            <Moon className="w-5 h-5 text-blue-400" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-600" />
          )}
          <h2 className={`text-lg font-semibold ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {language === 'id' ? 'Tema Tampilan' : 'Display Theme'}
          </h2>
        </div>

        <button
          onClick={onDarkModeToggle}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
            darkMode
              ? 'bg-slate-700 hover:bg-slate-600'
              : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <span className={`font-medium ${
            darkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {darkMode 
              ? (language === 'id' ? 'Mode Gelap' : 'Dark Mode')
              : (language === 'id' ? 'Mode Terang' : 'Light Mode')}
          </span>
          <div className={`w-12 h-6 rounded-full transition-colors ${
            darkMode ? 'bg-emerald-600' : 'bg-slate-300'
          } relative`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              darkMode ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </div>
        </button>

        <p className={`mt-3 text-sm ${
          darkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {language === 'id'
            ? 'Mode gelap mengurangi ketegangan mata dalam kondisi cahaya rendah'
            : 'Dark mode reduces eye strain in low-light conditions'}
        </p>
      </div>

      {/* Account Info */}
      <div className={`p-6 rounded-2xl border ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 ${
          darkMode ? 'text-white' : 'text-slate-800'
        }`}>
          {language === 'id' ? 'Informasi Akun' : 'Account Information'}
        </h2>

        <div className="space-y-3">
          <div>
            <label className={`text-sm font-medium ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {language === 'id' ? 'Email' : 'Email'}
            </label>
            <p className={`mt-1 ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}>
              {/* User email from context */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 10. UPDATED README.MD

```markdown
# BU - Budgeting Keuangan

![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Aplikasi budgeting keuangan pribadi yang komprehensif dengan fitur lengkap, multi-bahasa, dan dark mode support.

## ✨ Fitur Utama V4.0

### 🔐 Autentikasi & Keamanan
- Email verification dengan Supabase Auth
- Password strength indicator
- Email domain validation
- Secure session management

### 🎨 UI/UX
- **Permanent Sidebar** - Navigasi yang selalu terlihat
- **Dark Mode** - Lindungi mata Anda di malam hari
- **Multi-Language** - Indonesia & English
- **Responsive Design** - PC, Mac, iPhone, Android

### 📊 Dashboard & Statistik
- Saldo bulan ini (auto-reset setiap tanggal 1)
- Total saldo keseluruhan (all-time)
- Pemasukan & pengeluaran bulanan
- Kasbon tracking & summary
- Interactive charts (Bar, Pie, Line)

### 💰 Fitur Keuangan
- **Transaksi** - CRUD lengkap dengan filter & search
- **Kategori** - Custom categories dengan icons
- **Kasbon** - Track pinjaman (unpaid/paid)
- **Charts** - Visualisasi data yang menarik
- **Export** - Excel, PNG, JPG

### ⚙️ Pengaturan
- Bahasa (Indonesia/English)
- Theme (Light/Dark mode)
- Account information

## 🛠️ Teknologi

### Frontend
- React 18.3.1 + TypeScript 5.9.3
- Vite 5.4.21 (build tool)
- Tailwind CSS 3.4.1 (styling)
- Lucide React (icons)
- Recharts 2.x (charts)

### Backend
- Supabase (BaaS)
  - PostgreSQL database
  - Email/Password auth
  - Row Level Security (RLS)
  - Email verification

### Libraries
- date-fns 4.1.0
- html-to-image 1.11.13
- xlsx 0.18.5

## 📦 Instalasi

```bash
# Clone repository
git clone https://github.com/yourusername/bu-budgeting.git
cd bu-budgeting

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan Supabase credentials

# Run development
npm run dev
```

## 🔑 Environment Variables

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🗄️ Database Schema

### Tables:
1. **users** (Supabase Auth)
2. **categories** (income/expense categories)
3. **transactions** (financial transactions)
4. **kasbon** (loans tracking) ✨ NEW!

All tables have RLS enabled for security.

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Supabase Configuration

**Important**: Enable email verification in Supabase Dashboard:
1. Go to Authentication → Email Templates
2. Enable "Confirm signup"
3. Set redirect URL: `https://your-domain.com/auth/callback`

## 📱 Mobile Support

Aplikasi fully responsive untuk:
- Desktop (PC/Mac) - 1024px+
- Tablet - 768px - 1023px
- Mobile (iPhone/Android) - < 768px

## 🎯 Cara Penggunaan

### 1. Daftar & Verifikasi
- Sign up dengan email & password
- Cek inbox untuk link verifikasi
- Klik link untuk aktivasi akun
- Login dengan credentials

### 2. Dashboard
- Lihat overview keuangan
- Monitor saldo & kasbon
- Filter by date range

### 3. Transaksi
- Tambah pemasukan/pengeluaran
- Pilih kategori & tanggal
- Filter & search
- Export data

### 4. Kasbon
- Tambah kasbon (nama, nominal, tanggal)
- Track status (lunas/belum lunas)
- Monitor jatuh tempo

### 5. Pengaturan
- Ganti bahasa (ID/EN)
- Toggle dark mode
- View account info

## 🌐 Supported Languages

- 🇮🇩 Bahasa Indonesia
- 🇬🇧 English

## 🎨 Theme Support

- ☀️ Light Mode (default)
- 🌙 Dark Mode

Settings saved to localStorage.

## 📊 Charts Available

1. **Bar Chart** - Income vs Expense per category
2. **Pie Charts** - Distribution (Income & Expense)
3. **Line Chart** - 6-month trend analysis

## 🔒 Security Features

- Row Level Security (RLS)
- Email verification required
- Password strength validation
- Secure session management
- User data isolation

## 🐛 Troubleshooting

### Email not received
- Check spam folder
- Verify email address is correct
- Wait 5-10 minutes

### Can't login
- Ensure email is verified
- Check password (min 6 characters)
- Clear browser cache

### Charts not showing
- Verify transactions exist
- Check date filter range
- Refresh page

## 📝 License

MIT License - see LICENSE file

## 👨‍💻 Author

**BU Team**
- Email: andreanwar713@gmail.com
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Supabase for amazing BaaS
- Recharts for beautiful visualizations
- Tailwind CSS for rapid styling
- React team for the framework

---

**Version 4.0.0** | **December 2025** | **Production Ready ✅**

Made with ❤️ for better financial management
```

---

## 📝 IMPLEMENTATION CHECKLIST

### ✅ Completed:
- [x] Email verification setup
- [x] AuthForm updated with verification UI
- [x] Error handling for unverified emails

### 📝 To Implement:
- [ ] Create PermanentSidebar.tsx
- [ ] Create EnhancedCharts.tsx
- [ ] Create LanguageContext.tsx
- [ ] Update App.tsx with layout
- [ ] Create page components (Dashboard, Transactions, etc.)
- [ ] Create SettingsPage.tsx
- [ ] Update tailwind.config.js for dark mode
- [ ] Test responsiveness
- [ ] Update README.md
- [ ] Deploy

---

## 🎯 NEXT STEPS

1. **Copy components** from this guide
2. **Update App.tsx** with new layout
3. **Configure Supabase** email templates
4. **Test email verification** flow
5. **Test dark mode** functionality
6. **Test language switcher**
7. **Deploy** to production

---

**Estimated Implementation Time:** 3-4 hours
**Difficulty:** Intermediate to Advanced
**Status:** Ready for Implementation ✅

**Support:** andreanwar713@gmail.com
