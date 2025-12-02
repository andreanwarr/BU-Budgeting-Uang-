import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { TrendingUp, TrendingDown, Wallet, BarChart3, Download, AlertTriangle } from 'lucide-react';
import { AdvancedDateFilter } from './AdvancedDateFilter';
import { ImprovedHorizontalChart } from './ImprovedHorizontalChart';
import { ErrorBoundary } from './ErrorBoundary';
import * as XLSX from 'xlsx';

interface Transaction {
  id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
  title: string;
  transaction_date: string;
  category: {
    id: string;
    name: string;
    icon: string;
    type: string;
  };
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
  '#06b6d4', '#f97316', '#14b8a6', '#a855f7', '#6366f1', '#84cc16'
];

export function ImprovedChartsView() {
  const { user } = useAuth();
  const { theme } = useSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateFilter, setDateFilter] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user, dateFilter]);

  const loadTransactions = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user.id);

      if (dateFilter.start && dateFilter.end) {
        query = query
          .gte('transaction_date', dateFilter.start)
          .lte('transaction_date', dateFilter.end);
      }

      const { data, error } = await query.order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error loading transactions:', error);
        setError('Gagal memuat data transaksi. Silakan coba lagi.');
        setTransactions([]);
      } else if (data) {
        setTransactions(data as Transaction[]);
      }
    } catch (err) {
      console.error('Unexpected error loading transactions:', err);
      setError('Terjadi kesalahan tidak terduga. Silakan muat ulang halaman.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    try {
      const incomeByCategory: Record<string, number> = {};
      const expenseByCategory: Record<string, number> = {};

      if (!Array.isArray(transactions)) {
        return { incomeData: [], expenseData: [], totalIncome: 0, totalExpense: 0 };
      }

      transactions.forEach((t) => {
        if (!t || typeof t !== 'object') return;

        const categoryName = t.category?.name || 'Lainnya';
        const amount = Number(t.amount);

        if (isNaN(amount)) return;

        if (t.type === 'income') {
          incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + amount;
        } else if (t.type === 'expense') {
          expenseByCategory[categoryName] = (expenseByCategory[categoryName] || 0) + amount;
        }
      });

    const incomeData = Object.entries(incomeByCategory).map(([name, value], index) => ({
      name,
      value,
      percentage: 0,
      color: COLORS[index % COLORS.length],
    }));

    const expenseData = Object.entries(expenseByCategory).map(([name, value], index) => ({
      name,
      value,
      percentage: 0,
      color: COLORS[index % COLORS.length],
    }));

    const totalIncome = incomeData.reduce((sum, item) => sum + item.value, 0);
    const totalExpense = expenseData.reduce((sum, item) => sum + item.value, 0);

    incomeData.forEach((item) => {
      item.percentage = totalIncome > 0 ? (item.value / totalIncome) * 100 : 0;
    });

    expenseData.forEach((item) => {
      item.percentage = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
    });

      return { incomeData, expenseData, totalIncome, totalExpense };
    } catch (err) {
      console.error('Error processing chart data:', err);
      return { incomeData: [], expenseData: [], totalIncome: 0, totalExpense: 0 };
    }
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleDateChange = (start: string | null, end: string | null) => {
    setDateFilter({ start, end });
  };

  const handleExport = () => {
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    const summaryData = [
      ['RINGKASAN LAPORAN'],
      [''],
      ['Total Pemasukan', formatCurrency(chartData.totalIncome)],
      ['Total Pengeluaran', formatCurrency(chartData.totalExpense)],
      ['Saldo Bersih', formatCurrency(chartData.totalIncome - chartData.totalExpense)],
      ['Jumlah Transaksi', transactions.length],
      [''],
      ['']
    ];

    const transactionData = [
      ['DETAIL TRANSAKSI'],
      [''],
      ['Tanggal', 'Tipe', 'Kategori', 'Judul', 'Jumlah']
    ];

    transactions.forEach((t) => {
      transactionData.push([
        t.transaction_date,
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        t.category?.name || 'Lainnya',
        t.title,
        formatCurrency(Number(t.amount))
      ]);
    });

    const allData = [...summaryData, ...transactionData];
    const ws = XLSX.utils.aoa_to_sheet(allData);

    ws['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 },
      { wch: 20 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');

    const fileName = `Laporan_${dateFilter.start || 'Semua'}_${dateFilter.end || 'Data'}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Laporan & Analisis
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Visualisasi keuangan dengan filter periode fleksibel
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            disabled={transactions.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <AdvancedDateFilter onDateChange={handleDateChange} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-emerald-500 p-2.5 rounded-xl shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Total Pemasukan</p>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mt-1">
            {formatCurrency(chartData.totalIncome)}
          </p>
        </div>

        {/* Expense Card */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 p-6 rounded-xl border border-rose-200 dark:border-rose-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-rose-500 p-2.5 rounded-xl shadow-md">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-rose-700 dark:text-rose-400 font-medium">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-rose-900 dark:text-rose-300 mt-1">
            {formatCurrency(chartData.totalExpense)}
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-500 p-2.5 rounded-xl shadow-md">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Saldo Bersih</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
            {formatCurrency(chartData.totalIncome - chartData.totalExpense)}
          </p>
        </div>

        {/* Transactions Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-500 p-2.5 rounded-xl shadow-md">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">Total Transaksi</p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-300 mt-1">{transactions.length}</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">
                Terjadi Kesalahan
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm mb-3">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadTransactions();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      )}

      {/* Chart */}
      {!loading && !error && transactions.length > 0 && (
        <ErrorBoundary
          fallback={
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">
                    Grafik Tidak Dapat Dimuat
                  </h3>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    Terjadi kesalahan saat menampilkan grafik. Silakan muat ulang halaman.
                  </p>
                </div>
              </div>
            </div>
          }
        >
          <ImprovedHorizontalChart
            incomeData={chartData.incomeData}
            expenseData={chartData.expenseData}
            totalIncome={chartData.totalIncome}
            totalExpense={chartData.totalExpense}
          />
        </ErrorBoundary>
      )}

      {/* Empty State */}
      {!loading && !error && transactions.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <BarChart3 className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Belum Ada Data
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Transaksi akan muncul di sini setelah Anda menambahkannya
          </p>
        </div>
      )}
    </div>
  );
}
