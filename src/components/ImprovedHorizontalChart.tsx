import { useState } from 'react';
import { TrendingUp, TrendingDown, X, Info } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface ImprovedHorizontalChartProps {
  incomeData: ChartData[];
  expenseData: ChartData[];
  totalIncome: number;
  totalExpense: number;
}

export function ImprovedHorizontalChart({
  incomeData,
  expenseData,
  totalIncome,
  totalExpense,
}: ImprovedHorizontalChartProps) {
  const [activeType, setActiveType] = useState<'income' | 'expense'>('expense');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ChartData | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const activeData = activeType === 'income' ? incomeData : expenseData;
  const sortedData = [...activeData].sort((a, b) => b.value - a.value).slice(0, 10);
  const total = activeType === 'income' ? totalIncome : totalExpense;

  const handleBarClick = (category: ChartData) => {
    setSelectedCategory(category);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Type Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveType('expense')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold transition-all duration-200 ${
            activeType === 'expense'
              ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm">Pengeluaran</span>
        </button>
        <button
          onClick={() => setActiveType('income')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-semibold transition-all duration-200 ${
            activeType === 'income'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">Pemasukan</span>
        </button>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Top 10 Kategori
          </h3>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
            <p className={`text-lg font-bold ${
              activeType === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        {sortedData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <Info className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada data {activeType === 'income' ? 'pemasukan' : 'pengeluaran'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedData.map((item, index) => {
              const isHovered = hoveredCategory === item.name;
              const barColor = activeType === 'income'
                ? `rgba(16, 185, 129, ${0.3 + (index * 0.07)})`
                : `rgba(239, 68, 68, ${0.3 + (index * 0.07)})`;

              return (
                <div
                  key={item.name}
                  className="group cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(item.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => handleBarClick(item)}
                >
                  {/* Category Info */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        index === 1 ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400' :
                        index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.percentage.toFixed(1)}%
                      </span>
                      <span className={`font-semibold text-sm ${
                        activeType === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="relative h-8 bg-slate-100 dark:bg-slate-700/50 rounded-lg overflow-hidden">
                    <div
                      className={`h-full rounded-lg transition-all duration-500 ${
                        isHovered ? 'opacity-100' : 'opacity-90'
                      }`}
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: barColor,
                        backgroundImage: activeType === 'income'
                          ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.6) 100%)'
                          : 'linear-gradient(90deg, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.6) 100%)',
                      }}
                    >
                      {/* Animated shine effect on hover */}
                      {isHovered && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      )}
                    </div>

                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 dark:bg-slate-700 text-white px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none z-10 shadow-lg">
                        Klik untuk detail
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Category Details */}
      {selectedCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedCategory(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-6 ${
              activeType === 'income'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                : 'bg-gradient-to-r from-red-500 to-pink-600'
            } text-white`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {activeType === 'income' ? (
                    <TrendingUp className="w-8 h-8" />
                  ) : (
                    <TrendingDown className="w-8 h-8" />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold">{selectedCategory.name}</h3>
                    <p className="text-white/80 text-sm">
                      {activeType === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <p className="text-white/70 text-xs mb-1">Total</p>
                  <p className="font-bold text-lg">{formatCurrency(selectedCategory.value)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <p className="text-white/70 text-xs mb-1">Persentase</p>
                  <p className="font-bold text-lg">{selectedCategory.percentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Kontribusi dari total</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(selectedCategory.value)} / {formatCurrency(total)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Proporsi</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {selectedCategory.percentage.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        activeType === 'income'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                          : 'bg-gradient-to-r from-red-500 to-pink-600'
                      }`}
                      style={{ width: `${selectedCategory.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
