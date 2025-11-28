import { useState, useEffect } from 'react';
import { supabase, Transaction, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet
} from 'lucide-react';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { StatsCard } from './StatsCard';
import { FilterBar } from './FilterBar';
import { DateRangePicker } from './DateRangePicker';
import { CompactExportDropdown } from './CompactExportDropdown';
import { CategoryManager } from './CategoryManager';

export function Dashboard() {
  const { user } = useAuth();

  // === DATA STATE ===
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]); // semua transaksi mentah
  const [transactions, setTransactions] = useState<Transaction[]>([]); // transaksi setelah filter
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // === UI STATE ===
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    type: '',
    startDate: '',
    endDate: ''
  });

  // Load awal
  useEffect(() => {
    loadCategories();
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filter setiap kali filters / allTransactions berubah
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, allTransactions]);

  const loadCategories = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`is_default.eq.true,user_id.eq.${user.id}`)
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (!error && data) {
      setCategories(data);
    }
  };

  const loadTransactions = async () => {
    if (!user?.id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('transactions')
      .select(
        `
        *,
        category:categories(*)
      `
      )
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAllTransactions(data as Transaction[]);
      // filtering dilakukan di applyFilters()
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filteredData = [...allTransactions];

    if (filters.categoryId) {
      filteredData = filteredData.filter(
        (t) => t.category_id === filters.categoryId
      );
    }

    if (filters.type) {
      filteredData = filteredData.filter((t) => t.type === filters.type);
    }

    if (filters.startDate) {
      filteredData = filteredData.filter(
        (t) => t.transaction_date >= filters.startDate
      );
    }

    if (filters.endDate) {
      filteredData = filteredData.filter(
        (t) => t.transaction_date <= filters.endDate
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower)
      );
    }

    setTransactions(filteredData);
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFilters((prev) => ({ ...prev, startDate, endDate }));
  };

  const handleTransactionSaved = () => {
    loadTransactions();
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;

    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (!error) {
      loadTransactions();
    }
  };

  // ====== HELPER FORMAT PERIODE UNTUK KARTU HARI INI / FILTER ======
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFilterPeriodLabel = () => {
    const { startDate, endDate } = filters;

    if (startDate && endDate) {
      if (startDate === endDate) {
        return `Per ${formatDate(startDate)}`;
      }
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }

    if (startDate) return `Sejak ${formatDate(startDate)}`;
    if (endDate) return `Sampai ${formatDate(endDate)}`;

    // default: hari ini (kalau filter kosong dan DateRangePicker belum set apa-apa)
    const today = new Date();
    return `Per ${today.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })}`;
  };

  // ====== PERHITUNGAN STATISTIK ======

  // 1. Saldo bulan ini (selalu dari ALL transactions)
  const calculateCurrentMonthStats = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonth = firstDayOfMonth.toISOString().split('T')[0];
    const endOfToday = today.toISOString().split('T')[0];

    const monthlyTransactions = allTransactions.filter(
      (t) =>
        t.transaction_date >= startOfMonth &&
        t.transaction_date <= endOfToday
    );

    return monthlyTransactions.reduce(
      (acc, t) => {
        if (t.type === 'income') {
          acc.income += Number(t.amount);
        } else {
          acc.expense += Number(t.amount);
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  };

  // 2. Saldo keseluruhan (all-time)
  const calculateOverallBalance = () => {
    return allTransactions.reduce(
      (acc, t) => {
        if (t.type === 'income') {
          acc.income += Number(t.amount);
        } else {
          acc.expense += Number(t.amount);
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  };

  // 3. Statistik sesuai filter tanggal (buat kartu Pemasukan / Pengeluaran & Export)
  const calculateFilteredStats = () => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') {
          acc.income += Number(t.amount);
        } else {
          acc.expense += Number(t.amount);
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  };

  const monthlyStats = calculateCurrentMonthStats();
  const monthlyBalance = monthlyStats.income - monthlyStats.expense;

  const overallStats = calculateOverallBalance();
  const overallBalance = overallStats.income - overallStats.expense;

  const stats = calculateFilteredStats();
  const balance = stats.income - stats.expense;

  return (
    <div className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <DateRangePicker onDateRangeChange={handleDateRangeChange} />
            <CompactExportDropdown
              transactions={transactions}
              categories={categories}
              stats={{ ...stats, balance }}
              currentFilters={{
                startDate: filters.startDate,
                endDate: filters.endDate
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Saldo Bulan Ini – Month-to-date */}
          <StatsCard
            title="Saldo Bulan Ini"
            subtitle={`Per ${new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}`}
            description="Saldo bersih untuk bulan berjalan (pemasukan - pengeluaran). Data otomatis reset setiap tanggal 1."
            amount={monthlyBalance}
            icon={Wallet}
            color="blue"
            highlight={true}
          />

          {/* Saldo Keseluruhan – All-time */}
          <StatsCard
            title="Saldo Keseluruhan"
            subtitle="All-Time Balance"
            description="Total seluruh pemasukan dan pengeluaran sejak pertama kali menggunakan aplikasi. Tidak terpengaruh filter tanggal."
            amount={overallBalance}
            icon={Wallet}
            color="purple"
            highlight={false}
          />

          {/* Pemasukan – sesuai tanggal (default: hari ini / filter) */}
          <StatsCard
            title="Pemasukan"
            subtitle={getFilterPeriodLabel()}
            description="Total semua pemasukan sesuai tanggal yang dipilih (default: hari ini)."
            amount={stats.income}
            icon={TrendingUp}
            color="green"
            highlight={false}
          />

          {/* Pengeluaran – sesuai tanggal (default: hari ini / filter) */}
          <StatsCard
            title="Pengeluaran"
            subtitle={getFilterPeriodLabel()}
            description="Total semua pengeluaran sesuai tanggal yang dipilih (default: hari ini)."
            amount={stats.expense}
            icon={TrendingDown}
            color="red"
            highlight={false}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
              Transaksi
            </h2>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setShowForm(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-98"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Transaksi</span>
            </button>
          </div>

          <FilterBar
            filters={filters}
            categories={categories}
            onFilterChange={setFilters}
          />

          <TransactionList
            transactions={transactions}
            categories={categories}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          categories={categories}
          onSave={handleTransactionSaved}
          onCancel={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
        />
      )}

      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onCategoriesUpdate={loadCategories}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
    </div>
  );
}
