import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type Language = 'en' | 'id';
export type Currency = 'USD' | 'IDR';
export type Theme = 'light' | 'dark';

interface UserSettings {
  id: string;
  user_id: string;
  language: Language;
  currency: Currency;
  theme: Theme;
  created_at: string;
  updated_at: string;
}

interface SettingsContextType {
  language: Language;
  currency: Currency;
  theme: Theme;
  loading: boolean;
  setLanguage: (language: Language) => Promise<void>;
  setCurrency: (currency: Currency) => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations = {
  en: {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    categories: 'Categories',
    kasbon: 'Loans',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout',
    income: 'Income',
    expense: 'Expense',
    balance: 'Balance',
    thisMonth: 'This Month',
    overall: 'Overall Balance',
    allTime: 'All-Time Balance',
    addTransaction: 'Add Transaction',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    loading: 'Loading...',
    noData: 'No data available',
    confirmDelete: 'Are you sure you want to delete this?',
    activeUser: 'Active User',
    appName: 'BU',
    appFullName: 'Budgeting Uang',
    addCategory: 'Add Category',
    categoryName: 'Category Name',
    selectIcon: 'Select Icon',
    myCategories: 'My Categories',
    title: 'Title',
    amount: 'Amount',
    description: 'Description',
    date: 'Date',
    category: 'Category',
  },
  id: {
    dashboard: 'Dashboard',
    transactions: 'Transaksi',
    categories: 'Kategori',
    kasbon: 'Kasbon',
    reports: 'Laporan',
    settings: 'Pengaturan',
    logout: 'Keluar',
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    balance: 'Saldo',
    thisMonth: 'Bulan Ini',
    overall: 'Saldo Keseluruhan',
    allTime: 'All-Time Balance',
    addTransaction: 'Tambah Transaksi',
    save: 'Simpan',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Edit',
    search: 'Cari',
    filter: 'Filter',
    export: 'Ekspor',
    loading: 'Memuat...',
    noData: 'Tidak ada data',
    confirmDelete: 'Yakin ingin menghapus ini?',
    activeUser: 'Pengguna Aktif',
    appName: 'BU',
    appFullName: 'Budgeting Uang',
    addCategory: 'Tambah Kategori',
    categoryName: 'Nama Kategori',
    selectIcon: 'Pilih Icon',
    myCategories: 'Kategori Saya',
    title: 'Judul',
    amount: 'Jumlah',
    description: 'Deskripsi',
    date: 'Tanggal',
    category: 'Kategori',
  },
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('id');
  const [currency, setCurrencyState] = useState<Currency>('IDR');
  const [theme, setThemeState] = useState<Theme>('light');
  const [loading, setLoading] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    } else {
      setLanguageState('id');
      setCurrencyState('IDR');
      setThemeState('light');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const loadSettings = async () => {
    if (!user?.id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setLanguageState(data.language as Language);
      setCurrencyState(data.currency as Currency);
      setThemeState(data.theme as Theme);
      setSettingsId(data.id);
    } else if (!data) {
      await createDefaultSettings();
    }

    setLoading(false);
  };

  const createDefaultSettings = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('user_settings')
      .insert([
        {
          user_id: user.id,
          language: 'id',
          currency: 'IDR',
          theme: 'light',
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setSettingsId(data.id);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user?.id) return;

    if (settingsId) {
      await supabase
        .from('user_settings')
        .update(updates)
        .eq('id', settingsId);
    } else {
      await createDefaultSettings();
      if (settingsId) {
        await supabase
          .from('user_settings')
          .update(updates)
          .eq('id', settingsId);
      }
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    await updateSettings({ language: newLanguage });
  };

  const setCurrency = async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    await updateSettings({ currency: newCurrency });
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await updateSettings({ theme: newTheme });
  };

  const formatCurrency = (amount: number): string => {
    const absAmount = Math.abs(amount);

    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } else {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const value = {
    language,
    currency,
    theme,
    loading,
    setLanguage,
    setCurrency,
    setTheme,
    formatCurrency,
    t,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
