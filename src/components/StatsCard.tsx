import { LucideIcon, Info } from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface StatsCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  amount: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'purple';
  highlight?: boolean;
}

export function StatsCard({ title, subtitle, description, amount, icon: Icon, color, highlight = false }: StatsCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { formatCurrency } = useSettings();

  const colorClasses = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-emerald-500 to-teal-600',
    red: 'from-rose-500 to-pink-600',
    purple: 'from-purple-500 to-indigo-600'
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${
      highlight
        ? 'border-blue-300 dark:border-blue-700 ring-2 ring-blue-100 dark:ring-blue-900/50 shadow-lg'
        : 'border-slate-200 dark:border-slate-700'
    } p-4 sm:p-6 hover:shadow-md transition-all duration-200 ${
      highlight ? 'transform hover:scale-[1.02]' : ''
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-xs sm:text-sm font-semibold ${
              highlight ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
            }`}>
              {title}
            </p>
            {highlight && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                Aktif
              </span>
            )}
            {description && (
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label="Info"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                {showTooltip && (
                  <div className="absolute left-0 top-6 z-50 w-64 sm:w-72 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg p-3 shadow-xl">
                    <div className="absolute -top-1 left-2 w-2 h-2 bg-slate-800 dark:bg-slate-700 transform rotate-45"></div>
                    {description}
                  </div>
                )}
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{subtitle}</p>
          )}
          <p className={`text-xl sm:text-2xl font-bold truncate ${
            highlight ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-white'
          }`}>
            {formatCurrency(amount)}
          </p>
        </div>
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-2 sm:p-3 rounded-xl flex-shrink-0 ${
          highlight ? 'shadow-lg' : ''
        }`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
