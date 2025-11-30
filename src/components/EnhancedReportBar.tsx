import { useState } from 'react';
import { ChevronRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface CategoryReport {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  transactions: Array<{
    id: string;
    title: string;
    amount: number;
    date: string;
  }>;
}

interface EnhancedReportBarProps {
  incomeCategories: CategoryReport[];
  expenseCategories: CategoryReport[];
  totalIncome: number;
  totalExpense: number;
  onCategoryClick: (category: CategoryReport, type: 'income' | 'expense') => void;
}

export function EnhancedReportBar({
  incomeCategories,
  expenseCategories,
  totalIncome,
  totalExpense,
  onCategoryClick
}: EnhancedReportBarProps) {
  const [activeType, setActiveType] = useState<'income' | 'expense'>('expense');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const activeCategories = activeType === 'income' ? incomeCategories : expenseCategories;
  const activeTotal = activeType === 'income' ? totalIncome : totalExpense;
  const sortedCategories = [...activeCategories].sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Type Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveType('expense')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all duration-200 ${
            activeType === 'expense'
              ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <TrendingDown className="w-5 h-5" />
          <span>Pengeluaran</span>
          <span className="text-sm opacity-90">{formatCurrency(totalExpense)}</span>
        </button>
        <button
          onClick={() => setActiveType('income')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all duration-200 ${
            activeType === 'income'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Pemasukan</span>
          <span className="text-sm opacity-90">{formatCurrency(totalIncome)}</span>
        </button>
      </div>

      {/* Visual Bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex h-12 rounded-lg overflow-hidden shadow-inner">
          {sortedCategories.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm">
              Tidak ada data
            </div>
          ) : (
            sortedCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => onCategoryClick(category, activeType)}
                className="relative group cursor-pointer transition-all duration-200 hover:opacity-90"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.color,
                  minWidth: category.percentage > 5 ? 'auto' : '2%'
                }}
                title={`${category.name}: ${formatCurrency(category.amount)} (${category.percentage.toFixed(1)}%)`}
              >
                {category.percentage > 8 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs font-medium drop-shadow-lg truncate px-1">
                      {category.percentage.toFixed(0)}%
                    </span>
                  </div>
                )}
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-all duration-200" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Category List */}
      <div className="max-h-96 overflow-y-auto">
        {sortedCategories.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada transaksi {activeType === 'income' ? 'pemasukan' : 'pengeluaran'}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {sortedCategories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => onCategoryClick(category, activeType)}
                className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200 group"
              >
                {/* Rank Badge */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                  index === 1 ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400' :
                  index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                  'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500'
                }`}>
                  {index + 1}
                </div>

                {/* Color Indicator */}
                <div
                  className="flex-shrink-0 w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: category.color }}
                />

                {/* Category Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {category.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      {category.transactions.length} transaksi
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${category.percentage}%`,
                        backgroundColor: category.color
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {category.percentage.toFixed(1)}% dari total
                    </span>
                  </div>
                </div>

                {/* Amount & Arrow */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  <span className={`font-bold text-lg ${
                    activeType === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(category.amount)}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Total Summary */}
      <div className={`p-4 border-t border-slate-200 dark:border-slate-700 ${
        activeType === 'income'
          ? 'bg-emerald-50 dark:bg-emerald-900/10'
          : 'bg-red-50 dark:bg-red-900/10'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Total {activeType === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </span>
          <span className={`text-2xl font-bold ${
            activeType === 'income'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(activeTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
