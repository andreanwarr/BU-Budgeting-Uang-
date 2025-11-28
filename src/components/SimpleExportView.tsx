import { Transaction, Category } from '../lib/supabase';
import { TrendingUp, TrendingDown, Calendar, PieChart } from 'lucide-react';

interface SimpleExportViewProps {
  transactions: Transaction[];
  categories: Category[];
  startDate: string;
  endDate: string;
}

export function SimpleExportView({ transactions, categories, startDate, endDate }: SimpleExportViewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const expensesByCategory = categories.map(category => {
    const categoryTransactions = transactions.filter(
      t => t.type === 'expense' && t.category_id === category.id
    );
    const total = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      category: category.name,
      total,
      count: categoryTransactions.length,
      percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0
    };
  }).filter(item => item.total > 0).sort((a, b) => b.total - a.total);

  const incomesByCategory = categories.map(category => {
    const categoryTransactions = transactions.filter(
      t => t.type === 'income' && t.category_id === category.id
    );
    const total = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      category: category.name,
      total,
      count: categoryTransactions.length,
      percentage: totalIncome > 0 ? (total / totalIncome) * 100 : 0
    };
  }).filter(item => item.total > 0).sort((a, b) => b.total - a.total);

  const dateRange = startDate === endDate
    ? formatDate(startDate)
    : `${formatDate(startDate)} - ${formatDate(endDate)}`;

  return (
    <div className="bg-white p-8 min-w-[600px]">
      <div className="mb-6 text-center border-b-2 border-emerald-500 pb-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Laporan Keuangan</h1>
        <div className="flex items-center justify-center gap-2 text-slate-600">
          <Calendar className="w-5 h-5" />
          <p className="text-base">{dateRange}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-500 p-4 rounded-r-lg">
          <p className="text-sm font-medium text-emerald-700 mb-1">Total Pemasukan</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 border-l-4 border-rose-500 p-4 rounded-r-lg">
          <p className="text-sm font-medium text-rose-700 mb-1">Total Pengeluaran</p>
          <p className="text-xl font-bold text-rose-600">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-sm font-medium text-blue-700 mb-1">Saldo</p>
          <p className={`text-xl font-bold ${
            balance >= 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {expensesByCategory.length > 0 && (
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-800">Rincian Pengeluaran per Kategori</h2>
          </div>
          <div className="space-y-3">
            {expensesByCategory.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{item.category}</span>
                    <span className="text-xs text-slate-500">{item.count} transaksi</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 w-12 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <span className="ml-4 font-bold text-rose-600 text-sm">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {incomesByCategory.length > 0 && (
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-800">Rincian Pemasukan per Kategori</h2>
          </div>
          <div className="space-y-3">
            {incomesByCategory.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{item.category}</span>
                    <span className="text-xs text-slate-500">{item.count} transaksi</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 w-12 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <span className="ml-4 font-bold text-emerald-600 text-sm">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Daftar Transaksi</h2>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Tidak ada transaksi pada tanggal ini
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => {
              const category = categories.find(c => c.id === transaction.category_id);

              return (
                <div
                  key={transaction.id}
                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income'
                          ? 'bg-emerald-100'
                          : 'bg-rose-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-rose-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{transaction.title}</h3>
                        <p className="text-sm text-slate-600">{category?.name || 'Tanpa Kategori'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-xl ${
                        transaction.type === 'income'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                    </div>
                  </div>

                  {transaction.description && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Pencatatan:</span> {transaction.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t-2 border-slate-200 text-center text-sm text-slate-500">
        <p>Dibuat dengan Finance Tracker</p>
      </div>
    </div>
  );
}
