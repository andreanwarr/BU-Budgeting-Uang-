import { useState, useEffect } from 'react';
import { supabase, Transaction, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  LogOut,
  TrendingUp,
  TrendingDown,
  Wallet,
  FolderPlus
} from 'lucide-react';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { StatsCard } from './StatsCard';
import { FilterBar } from './FilterBar';
import { DateRangePicker } from './DateRangePicker';
import { CompactExportDropdown } from './CompactExportDropdown';
import { CategoryManager } from './CategoryManager';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadCategories();
    loadTransactions();
  }, []);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`is_default.eq.true,user_id.eq.${user?.id}`)
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (!error && data) {
      setCategories(data);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    let query = supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', user?.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;

    if (!error && data) {
      let filteredData = data;

      if (filters.startDate && filters.endDate) {
        filteredData = filteredData.filter(t =>
          t.transaction_date >= filters.startDate &&
          t.transaction_date <= filters.endDate
        );
      } else if (filters.startDate) {
        filteredData = filteredData.filter(t =>
          t.transaction_date >= filters.startDate
        );
      } else if (filters.endDate) {
        filteredData = filteredData.filter(t =>
          t.transaction_date <= filters.endDate
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(t =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower)
        );
      }
      setTransactions(filteredData as Transaction[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFilters({ ...filters, startDate, endDate });
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

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (!error) {
      loadTransactions();
    }
  };

  // Calculate current month's stats (from 1st to today)
  const calculateCurrentMonthStats = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonth = firstDayOfMonth.toISOString().split('T')[0];
    const endOfToday = today.toISOString().split('T')[0];

    const monthlyTransactions = transactions.filter(t =>
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

  // Calculate stats based on selected filter
  const calculateFilteredStats = () => {
    if (!filters.startDate || !filters.endDate) {
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
    }

    const filteredTransactions = transactions.filter(t =>
      t.transaction_date >= filters.startDate &&
      t.transaction_date <= filters.endDate
    );

    return filteredTransactions.reduce(
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

  // Calculate overall balance (all transactions)
  const calculateOverallBalance = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 sm:p-2 rounded-xl">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-800">Finance Tracker</h1>
                <p className="text-xs sm:text-sm text-slate-600 truncate max-w-[150px] sm:max-w-none">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setShowCategoryManager(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                title="Kelola Kategori"
              >
                <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden md:inline text-sm">Kategori</span>
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-sm">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main id="dashboard-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
          <StatsCard
            title="Saldo Bulan Ini"
            subtitle={`Per ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            description="Saldo bersih untuk bulan berjalan (pemasukan - pengeluaran). Data otomatis reset setiap tanggal 1."
            amount={monthlyBalance}
            icon={Wallet}
            color="blue"
            highlight={true}
          />
          <StatsCard
            title="Saldo Keseluruhan"
            subtitle="All-Time Balance"
            description="Total seluruh pemasukan dan pengeluaran sejak pertama kali menggunakan aplikasi. Tidak terpengaruh filter tanggal."
            amount={overallBalance}
            icon={Wallet}
            color="purple"
            highlight={false}
          />
          <StatsCard
            title="Pemasukan"
            subtitle="Bulan Ini"
            description="Total semua pemasukan dalam bulan berjalan. Termasuk gaji, bonus, dan sumber pemasukan lainnya."
            amount={monthlyStats.income}
            icon={TrendingUp}
            color="green"
            highlight={false}
          />
          <StatsCard
            title="Pengeluaran"
            subtitle="Bulan Ini"
            description="Total semua pengeluaran dalam bulan berjalan. Termasuk belanja, tagihan, dan pengeluaran lainnya."
            amount={monthlyStats.expense}
            icon={TrendingDown}
            color="red"
            highlight={false}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Transaksi</h2>
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
      </main>

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
