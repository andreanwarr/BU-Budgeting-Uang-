import { Transaction, Category } from '../lib/supabase';
import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({
  transactions,
  categories,
  loading,
  onEdit,
  onDelete
}: TransactionListProps) {
  const { formatCurrency } = useSettings();

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = d.toDateString() === today.toDateString();
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `Hari Ini • ${d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    }
    if (isYesterday) {
      return `Kemarin • ${d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    }
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-./g, x => x[1].toUpperCase())];
    return IconComponent || Icons.Circle;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Memuat transaksi...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-slate-100 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-slate-600 dark:text-slate-300 font-medium">Belum ada transaksi</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Mulai tambahkan transaksi pertama Anda</p>
      </div>
    );
  }

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = transaction.transaction_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const getDayTotals = (dayTransactions: Transaction[]) => {
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, dayTransactions]) => {
        const totals = getDayTotals(dayTransactions);
        return (
        <div key={date} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {formatDate(date)}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {totals.income > 0 && (
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-semibold">
                  +{formatCurrency(totals.income)}
                </span>
              )}
              {totals.expense > 0 && (
                <span className="px-2 py-1 bg-rose-50 text-rose-700 rounded-lg font-semibold">
                  -{formatCurrency(totals.expense)}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {dayTransactions.map((transaction) => {
              const category = categories.find(c => c.id === transaction.category_id);
              const IconComponent = category ? getCategoryIcon(category.icon) : Icons.Circle;

              return (
                <div
                  key={transaction.id}
                  className="bg-white dark:bg-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-white dark:hover:from-slate-600 dark:hover:to-slate-700 rounded-xl p-3 sm:p-4 transition-all duration-200 border-2 border-slate-100 dark:border-slate-600 hover:border-emerald-200 dark:hover:border-emerald-600 hover:shadow-md group"
                >
                  <div className="flex items-start sm:items-center justify-between gap-2">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform ${
                        transaction.type === 'income'
                          ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 shadow-sm'
                          : 'bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600 shadow-sm'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-800 dark:text-white truncate text-sm sm:text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {transaction.title}
                          </h4>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-rose-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md font-medium truncate inline-block">
                            {category?.name || 'Tanpa Kategori'}
                          </span>
                          {transaction.description && (
                            <>
                              <span className="hidden sm:inline text-slate-400">•</span>
                              <span className="text-slate-600 dark:text-slate-300 truncate">{transaction.description}</span>
                            </>
                          )}
                        </div>
                        <div className="mt-2 sm:hidden">
                          <span className={`font-bold text-base px-2 py-1 rounded-lg inline-block ${
                            transaction.type === 'income'
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(Number(transaction.amount))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                      <span className={`hidden sm:inline font-bold text-lg whitespace-nowrap px-3 py-1.5 rounded-lg ${
                        transaction.type === 'income'
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-rose-700 bg-rose-50'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Number(transaction.amount))}
                      </span>

                      <div className="flex gap-1">
                        <button
                          onClick={() => onEdit(transaction)}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-all duration-200 active:scale-90 hover:scale-110"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(transaction.id)}
                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-all duration-200 active:scale-90 hover:scale-110"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );})}
    </div>
  );
}
