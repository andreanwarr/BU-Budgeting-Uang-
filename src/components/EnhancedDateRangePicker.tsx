import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { id } from 'date-fns/locale';

interface EnhancedDateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  onDownload?: (start: string, end: string) => void;
  showDownload?: boolean;
}

export function EnhancedDateRangePicker({
  startDate,
  endDate,
  onDateChange,
  onDownload,
  showDownload = false
}: EnhancedDateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [customMode, setCustomMode] = useState(false);

  const handlePreviousMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    const start = format(startOfMonth(newMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(newMonth), 'yyyy-MM-dd');
    onDateChange(start, end);
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    const start = format(startOfMonth(newMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(newMonth), 'yyyy-MM-dd');
    onDateChange(start, end);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setCurrentMonth(now);
    const start = format(startOfMonth(now), 'yyyy-MM-dd');
    const end = format(endOfMonth(now), 'yyyy-MM-dd');
    onDateChange(start, end);
    setCustomMode(false);
  };

  const handleToday = () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    setCurrentMonth(today);
    onDateChange(todayStr, todayStr);
    setCustomMode(false);
  };

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      onDateChange(value, endDate);
    } else {
      onDateChange(startDate, value);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(startDate, endDate);
    }
  };

  const isCurrentMonth = format(currentMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');
  const isToday = startDate === endDate && startDate === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            Pilih Periode
          </h3>
        </div>

        {showDownload && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={handleToday}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isToday
              ? 'bg-emerald-500 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          Hari Ini
        </button>
        <button
          onClick={handleCurrentMonth}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isCurrentMonth && !customMode
              ? 'bg-emerald-500 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          Bulan Ini
        </button>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between mb-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        <div className="text-center">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {format(startOfMonth(currentMonth), 'dd MMM', { locale: id })} -{' '}
            {format(endOfMonth(currentMonth), 'dd MMM', { locale: id })}
          </div>
        </div>

        <button
          onClick={handleNextMonth}
          disabled={isCurrentMonth}
          className={`p-2 rounded-lg transition-colors ${
            isCurrentMonth
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Custom Date Range Toggle */}
      <button
        onClick={() => setCustomMode(!customMode)}
        className="w-full px-4 py-2 mb-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors text-sm"
      >
        {customMode ? 'Gunakan Bulan' : 'Pilih Tanggal Custom'}
      </button>

      {/* Custom Date Inputs */}
      {customMode && (
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              max={endDate}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              min={startDate}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      )}

      {/* Selected Range Display */}
      {!customMode && (
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
            Periode Terpilih:
          </div>
          <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            {format(new Date(startDate), 'dd MMMM yyyy', { locale: id })}
            {startDate !== endDate && (
              <> - {format(new Date(endDate), 'dd MMMM yyyy', { locale: id })}</>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
