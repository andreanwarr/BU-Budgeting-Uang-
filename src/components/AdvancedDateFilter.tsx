import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';

type FilterOption = 'today' | 'thisMonth' | 'nextMonth' | 'next3Months' | 'custom' | 'all';

interface AdvancedDateFilterProps {
  onDateChange: (startDate: string | null, endDate: string | null) => void;
  className?: string;
}

export function AdvancedDateFilter({ onDateChange, className = '' }: AdvancedDateFilterProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('thisMonth');
  const [showDropdown, setShowDropdown] = useState(false);
  const [customStart, setCustomStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  const filterOptions: { value: FilterOption; label: string; description: string }[] = [
    { value: 'today', label: 'Hari Ini', description: format(new Date(), 'dd MMMM yyyy', { locale: id }) },
    { value: 'thisMonth', label: 'Bulan Ini', description: format(new Date(), 'MMMM yyyy', { locale: id }) },
    { value: 'nextMonth', label: 'Bulan Selanjutnya', description: format(addMonths(new Date(), 1), 'MMMM yyyy', { locale: id }) },
    { value: 'next3Months', label: '3 Bulan Kedepan', description: `${format(new Date(), 'MMM', { locale: id })} - ${format(addMonths(new Date(), 2), 'MMM yyyy', { locale: id })}` },
    { value: 'custom', label: 'Custom', description: 'Pilih tanggal sendiri' },
    { value: 'all', label: 'Semua Data', description: 'Tampilkan semua transaksi' },
  ];

  const getSelectedLabel = () => {
    const option = filterOptions.find(opt => opt.value === selectedFilter);
    return option?.label || 'Pilih Filter';
  };

  useEffect(() => {
    applyFilter(selectedFilter);
  }, [selectedFilter]);

  const applyFilter = (filter: FilterOption) => {
    const today = new Date();
    let start: string | null = null;
    let end: string | null = null;

    switch (filter) {
      case 'today':
        start = format(today, 'yyyy-MM-dd');
        end = format(today, 'yyyy-MM-dd');
        break;
      case 'thisMonth':
        start = format(startOfMonth(today), 'yyyy-MM-dd');
        end = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'nextMonth':
        const nextMonth = addMonths(today, 1);
        start = format(startOfMonth(nextMonth), 'yyyy-MM-dd');
        end = format(endOfMonth(nextMonth), 'yyyy-MM-dd');
        break;
      case 'next3Months':
        start = format(startOfMonth(today), 'yyyy-MM-dd');
        end = format(endOfMonth(addMonths(today, 2)), 'yyyy-MM-dd');
        break;
      case 'custom':
        start = customStart;
        end = customEnd;
        break;
      case 'all':
        start = null;
        end = null;
        break;
    }

    onDateChange(start, end);
  };

  const handleCustomApply = () => {
    applyFilter('custom');
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium text-slate-700 dark:text-slate-200">{getSelectedLabel()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowDropdown(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-40 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Filter Periode</h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Options */}
            <div className="max-h-96 overflow-y-auto">
              {filterOptions.map((option) => (
                <div key={option.value}>
                  <button
                    onClick={() => {
                      setSelectedFilter(option.value);
                      if (option.value !== 'custom') {
                        setShowDropdown(false);
                      }
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      selectedFilter === option.value
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${
                          selectedFilter === option.value
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {option.description}
                        </p>
                      </div>
                      {selectedFilter === option.value && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      )}
                    </div>
                  </button>

                  {/* Custom Date Inputs */}
                  {option.value === 'custom' && selectedFilter === 'custom' && (
                    <div className="px-4 pb-4 space-y-3 bg-slate-50 dark:bg-slate-900/30">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                          Dari Tanggal
                        </label>
                        <input
                          type="date"
                          value={customStart}
                          onChange={(e) => setCustomStart(e.target.value)}
                          max={customEnd}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                          Sampai Tanggal
                        </label>
                        <input
                          type="date"
                          value={customEnd}
                          onChange={(e) => setCustomEnd(e.target.value)}
                          min={customStart}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handleCustomApply}
                        className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
                      >
                        Terapkan
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
