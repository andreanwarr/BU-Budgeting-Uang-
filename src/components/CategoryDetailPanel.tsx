import { Transaction, Category } from '../lib/supabase';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface CategoryDetailPanelProps {
  categoryName: string;
  categoryType: 'income' | 'expense';
  transactions: Transaction[];
  categories: Category[];
  totalAmount: number;
  onClose: () => void;
}

export function CategoryDetailPanel({
  categoryName,
  categoryType,
  transactions,
  categories,
  totalAmount,
  onClose
}: CategoryDetailPanelProps) {
  const { formatCurrency } = useSettings();

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-./g, x => x[1].toUpperCase())];
    return IconComponent || Icons.Circle;
  };

  // Sort transactions by amount (descending)
  const sortedTransactions = [...transactions].sort((a, b) => Number(b.amount) - Number(a.amount));

  // Calculate percentage for each transaction
  const transactionsWithPercentage = sortedTransactions.map(t => ({
    ...t,
    percentage: totalAmount > 0 ? (Number(t.amount) / totalAmount) * 100 : 0
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white dark:bg-slate-800 w-full sm:max-w-3xl sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative p-6 text-white ${
          categoryType === 'income'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
            : 'bg-gradient-to-r from-red-500 to-pink-600'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            {categoryType === 'income' ? (
              <TrendingUp className="w-8 h-8" />
            ) : (
              <TrendingDown className="w-8 h-8" />
            )}
            <div>
              <h2 className="text-2xl font-bold">{categoryName}</h2>
              <p className="text-white/80 text-sm">
                {categoryType === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white/70 text-xs mb-1">Total</p>
              <p className="font-bold text-lg">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white/70 text-xs mb-1">Transaksi</p>
              <p className="font-bold text-lg">{transactions.length}x</p>
            </div>
          </div>
        </div>

        {/* Transactions List with Horizontal Bars */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4 uppercase tracking-wider">
            Detail Transaksi
          </h3>

          {transactionsWithPercentage.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <p>Tidak ada transaksi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactionsWithPercentage.map((transaction) => {
                const category = categories.find(c => c.id === transaction.category_id);
                const IconComponent = category ? getCategoryIcon(category.icon) : Icons.Circle;

                return (
                  <div
                    key={transaction.id}
                    className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-600"
                  >
                    {/* Transaction Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          categoryType === 'income'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate text-base">
                            {transaction.title}
                          </h4>
                          {transaction.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                              {transaction.description}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {new Date(transaction.transaction_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className={`text-lg font-bold ${
                          categoryType === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(Number(transaction.amount))}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {transaction.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Horizontal Progress Bar - matches mobile screenshot */}
                    <div className="relative h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          categoryType === 'income'
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                            : 'bg-gradient-to-r from-red-400 to-pink-500'
                        }`}
                        style={{ width: `${transaction.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Total {transactions.length} Transaksi
            </span>
            <span
              className={`text-2xl font-bold ${
                categoryType === 'income'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
