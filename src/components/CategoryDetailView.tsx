import { X, Calendar, TrendingUp, TrendingDown, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Transaction {
  id: string;
  title: string;
  description?: string;
  amount: number;
  date: string;
}

interface CategoryDetailViewProps {
  categoryName: string;
  categoryColor: string;
  type: 'income' | 'expense';
  totalAmount: number;
  percentage: number;
  transactions: Transaction[];
  dateRange: { start: string; end: string };
  onClose: () => void;
  onExport: () => void;
}

export function CategoryDetailView({
  categoryName,
  categoryColor,
  type,
  totalAmount,
  percentage,
  transactions,
  dateRange,
  onClose,
  onExport
}: CategoryDetailViewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    } catch {
      return dateString;
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const averagePerTransaction = transactions.length > 0 ? totalAmount / transactions.length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white dark:bg-slate-800 w-full sm:w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="relative p-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)`
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            {type === 'income' ? (
              <TrendingUp className="w-8 h-8" />
            ) : (
              <TrendingDown className="w-8 h-8" />
            )}
            <div>
              <h2 className="text-2xl font-bold">{categoryName}</h2>
              <p className="text-white/80 text-sm">
                {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white/70 text-xs mb-1">Total</p>
              <p className="font-bold text-lg">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white/70 text-xs mb-1">Transaksi</p>
              <p className="font-bold text-lg">{transactions.length}x</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white/70 text-xs mb-1">Rata-rata</p>
              <p className="font-bold text-lg">{formatCurrency(averagePerTransaction)}</p>
            </div>
          </div>

          {/* Percentage Badge */}
          <div className="absolute top-6 right-16 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="font-bold text-lg">{percentage.toFixed(1)}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <FileText className="w-16 h-16 mb-4 opacity-30" />
              <p>Tidak ada transaksi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(transaction.date)}
                        </div>
                      </div>

                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 truncate">
                        {transaction.title}
                      </h3>

                      {transaction.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {transaction.description}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <div
                        className={`text-lg font-bold ${
                          type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {type === 'expense' && '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                type === 'income'
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
