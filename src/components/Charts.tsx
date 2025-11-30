import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, TrendingDown, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { DateRangePicker } from './DateRangePicker';
import { CategoryDetailPanel } from './CategoryDetailPanel';
import { CompactExportDropdown } from './CompactExportDropdown';

interface Transaction {
  id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
  title: string;
  description?: string;
  transaction_date: string;
  category: {
    id: string;
    name: string;
    icon: string;
    type: string;
  };
}

export function Charts() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // State for category detail panel
  const [selectedCategory, setSelectedCategory] = useState<{
    name: string;
    type: 'income' | 'expense';
    transactions: Transaction[];
    totalAmount: number;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadCategories();
      loadTransactions();
    }
  }, [user, dateRange]);

  const loadCategories = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`is_default.eq.true,user_id.eq.${user.id}`);

    if (!error && data) {
      setCategories(data);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;

    // Build query - handle "Semua Data" case where dateRange is empty
    let query = supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', user.id);

    // Only apply date filters if they exist (not "Semua Data")
    if (dateRange.startDate && dateRange.endDate) {
      query = query
        .gte('transaction_date', dateRange.startDate)
        .lte('transaction_date', dateRange.endDate);
    }

    const { data, error } = await query.order('transaction_date', { ascending: true });

    if (!error && data) {
      setTransactions(data);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const categoryData = useMemo(() => {
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    transactions.forEach(t => {
      const categoryName = t.category?.name || 'Lainnya';
      if (t.type === 'income') {
        incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + Number(t.amount);
      } else {
        expenseByCategory[categoryName] = (expenseByCategory[categoryName] || 0) + Number(t.amount);
      }
    });

    const incomeData = Object.entries(incomeByCategory).map(([name, value]) => ({
      name,
      value,
      percentage: 0
    }));

    const expenseData = Object.entries(expenseByCategory).map(([name, value]) => ({
      name,
      value,
      percentage: 0
    }));

    const totalIncome = incomeData.reduce((sum, item) => sum + item.value, 0);
    const totalExpense = expenseData.reduce((sum, item) => sum + item.value, 0);

    incomeData.forEach(item => {
      item.percentage = totalIncome > 0 ? (item.value / totalIncome) * 100 : 0;
    });

    expenseData.forEach(item => {
      item.percentage = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
    });

    return { incomeData, expenseData, totalIncome, totalExpense };
  }, [transactions]);

  const dailyTrend = useMemo(() => {
    const dailyData: Record<string, { income: number; expense: number; date: string }> = {};

    transactions.forEach(t => {
      const date = t.transaction_date;
      if (!dailyData[date]) {
        dailyData[date] = { date, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        dailyData[date].income += Number(t.amount);
      } else {
        dailyData[date].expense += Number(t.amount);
      }
    });

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Handler untuk klik kategori di chart
  // Fungsi ini akan dipanggil saat user klik pada bar/slice chart
  const handleCategoryClick = (categoryName: string, type: 'income' | 'expense') => {
    // Filter transaksi berdasarkan kategori dan date range aktif
    const categoryTransactions = transactions.filter(t => {
      const matchesCategory = t.category?.name === categoryName;
      const matchesType = t.type === type;

      // Jika ada date filter, terapkan
      if (dateRange.startDate && dateRange.endDate) {
        const matchesDate = t.transaction_date >= dateRange.startDate &&
                           t.transaction_date <= dateRange.endDate;
        return matchesCategory && matchesType && matchesDate;
      }

      return matchesCategory && matchesType;
    });

    // Hitung total amount untuk kategori ini
    const totalAmount = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // Set state untuk menampilkan detail panel
    setSelectedCategory({
      name: categoryName,
      type,
      transactions: categoryTransactions,
      totalAmount
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Laporan & Analisis</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Visualisasi keuangan Anda</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Use same DateRangePicker as Dashboard */}
          <DateRangePicker
            onDateRangeChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
          />
          {/* Export with current date range */}
          <CompactExportDropdown
            transactions={transactions}
            categories={categories}
            stats={{
              income: categoryData.totalIncome,
              expense: categoryData.totalExpense,
              balance: categoryData.totalIncome - categoryData.totalExpense
            }}
            currentFilters={{
              startDate: dateRange.startDate,
              endDate: dateRange.endDate
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Total Pemasukan</p>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mt-1">{formatCurrency(categoryData.totalIncome)}</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 p-6 rounded-xl border border-rose-200 dark:border-rose-800">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-rose-500 p-2 rounded-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-rose-700 dark:text-rose-400 font-medium">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-rose-900 dark:text-rose-300 mt-1">{formatCurrency(categoryData.totalExpense)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-500 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Saldo Bersih</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
            {formatCurrency(categoryData.totalIncome - categoryData.totalExpense)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-500 p-2 rounded-lg">
              <PieIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">Transaksi</p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-300 mt-1">{transactions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Pemasukan per Kategori
          </h3>
          {categoryData.incomeData.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">Belum ada data pemasukan</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData.incomeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                  onClick={(data) => handleCategoryClick(data.name, 'income')}
                  cursor="pointer"
                >
                  {categoryData.incomeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{data.name}</p>
                          <p className="text-emerald-600 dark:text-emerald-400">{formatCurrency(data.value)}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{data.percentage.toFixed(1)}%</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Klik untuk detail →</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Pengeluaran per Kategori
          </h3>
          {categoryData.expenseData.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">Belum ada data pengeluaran</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData.expenseData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                  onClick={(data) => handleCategoryClick(data.name, 'expense')}
                  cursor="pointer"
                >
                  {categoryData.expenseData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{data.name}</p>
                          <p className="text-rose-600 dark:text-rose-400">{formatCurrency(data.value)}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{data.percentage.toFixed(1)}%</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Klik untuk detail →</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Tren Harian
        </h3>
        {dailyTrend.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">Belum ada data transaksi</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
              />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID')}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Pemasukan" />
              <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Perbandingan Kategori (Klik untuk detail)
        </h3>
        {categoryData.expenseData.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">Belum ada data untuk ditampilkan</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categoryData.expenseData.sort((a, b) => b.value - a.value).slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{data.name}</p>
                        <p className="text-rose-600 dark:text-rose-400">{formatCurrency(data.value)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Klik untuk detail →</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="value"
                fill="#8b5cf6"
                name="Pengeluaran"
                onClick={(data) => handleCategoryClick(data.name, 'expense')}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Detail Panel - Modal that shows when user clicks on a chart */}
      {selectedCategory && (
        <CategoryDetailPanel
          categoryName={selectedCategory.name}
          categoryType={selectedCategory.type}
          transactions={selectedCategory.transactions}
          categories={categories}
          totalAmount={selectedCategory.totalAmount}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
