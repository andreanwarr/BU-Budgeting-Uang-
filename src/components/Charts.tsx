import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, TrendingDown, PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface Transaction {
  id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
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
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user, dateRange]);

  const loadTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', user.id)
      .gte('transaction_date', dateRange.startDate)
      .lte('transaction_date', dateRange.endDate)
      .order('transaction_date', { ascending: true });

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Laporan & Analisis</h2>
          <p className="text-sm text-slate-600 mt-1">Visualisasi keuangan Anda</p>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-emerald-700 font-medium">Total Pemasukan</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{formatCurrency(categoryData.totalIncome)}</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-xl border border-rose-200">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-rose-500 p-2 rounded-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-rose-700 font-medium">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-rose-900 mt-1">{formatCurrency(categoryData.totalExpense)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-500 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-blue-700 font-medium">Saldo Bersih</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {formatCurrency(categoryData.totalIncome - categoryData.totalExpense)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-500 p-2 rounded-lg">
              <PieIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-purple-700 font-medium">Transaksi</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{transactions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-emerald-600" />
            Pemasukan per Kategori
          </h3>
          {categoryData.incomeData.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Belum ada data pemasukan</div>
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
                  label={(entry) => `${entry.name}: ${entry.percent?.toFixed(1)}%`}
                >
                  {categoryData.incomeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-rose-600" />
            Pengeluaran per Kategori
          </h3>
          {categoryData.expenseData.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Belum ada data pengeluaran</div>
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
                  label={(entry) => `${entry.name}: ${entry.percent?.toFixed(1)}%`}
                >
                  {categoryData.expenseData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Tren Harian
        </h3>
        {dailyTrend.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Belum ada data transaksi</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={dailyTrend}>
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
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Pemasukan" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Pengeluaran" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Perbandingan Kategori
        </h3>
        {categoryData.expenseData.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Belum ada data untuk ditampilkan</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categoryData.expenseData.sort((a, b) => b.value - a.value).slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#8b5cf6" name="Pengeluaran" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
