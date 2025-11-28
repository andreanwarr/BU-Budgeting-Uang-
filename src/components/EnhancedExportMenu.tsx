import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, Image, ChevronDown, Calendar, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toPng, toJpeg } from 'html-to-image';
import { Transaction, Category } from '../lib/supabase';
import { createRoot } from 'react-dom/client';
import { SimpleExportView } from './SimpleExportView';
import { format } from 'date-fns';

interface EnhancedExportMenuProps {
  transactions: Transaction[];
  categories: Category[];
  stats: {
    income: number;
    expense: number;
    balance: number;
  };
}

export function EnhancedExportMenu({ transactions, categories, stats }: EnhancedExportMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setStartDate(today);
    setEndDate(today);
  }, []);

  const resetToToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setStartDate(today);
    setEndDate(today);
  };

  const updateDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const exportToExcel = () => {
    setExporting(true);
    try {
      const summaryData = [
        ['RINGKASAN KEUANGAN'],
        [''],
        ['Total Pemasukan', formatCurrency(stats.income)],
        ['Total Pengeluaran', formatCurrency(stats.expense)],
        ['Saldo', formatCurrency(stats.balance)],
        [''],
        ['']
      ];

      const transactionData = [
        ['DAFTAR TRANSAKSI'],
        [''],
        ['Tanggal', 'Tipe', 'Kategori', 'Judul', 'Deskripsi', 'Jumlah']
      ];

      transactions.forEach((t) => {
        transactionData.push([
          new Date(t.transaction_date).toLocaleDateString('id-ID'),
          t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          t.category?.name || '',
          t.title,
          t.description || '',
          formatCurrency(Number(t.amount))
        ]);
      });

      const allData = [...summaryData, ...transactionData];
      const ws = XLSX.utils.aoa_to_sheet(allData);

      ws['!cols'] = [
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 30 },
        { wch: 30 },
        { wch: 20 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan');

      const fileName = `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setShowMenu(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengexport ke Excel');
    } finally {
      setExporting(false);
    }
  };

  const exportToImage = async (format: 'png' | 'jpg') => {
    if (!startDate || !endDate) {
      alert('Pilih rentang tanggal terlebih dahulu');
      return;
    }

    setExporting(true);
    try {
      const filteredTransactions = transactions.filter(
        t => t.transaction_date >= startDate && t.transaction_date <= endDate
      );

      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(
        <SimpleExportView
          transactions={filteredTransactions}
          categories={categories}
          startDate={startDate}
          endDate={endDate}
        />
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      const exportElement = container.firstChild as HTMLElement;
      const dataUrl = format === 'png'
        ? await toPng(exportElement, { quality: 1.0, pixelRatio: 2 })
        : await toJpeg(exportElement, { quality: 0.95, pixelRatio: 2 });

      root.unmount();
      document.body.removeChild(container);

      const dateLabel = startDate === endDate
        ? startDate
        : `${startDate}_${endDate}`;

      const link = document.createElement('a');
      link.download = `Laporan_${dateLabel}.${format}`;
      link.href = dataUrl;
      link.click();

      setShowMenu(false);
      setShowDatePicker(false);
    } catch (error) {
      console.error(`Error exporting to ${format.toUpperCase()}:`, error);
      alert(`Gagal mengexport ke ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  };

  const handleQuickDate = (type: 'today' | 'week' | 'month') => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    switch (type) {
      case 'today':
        setStartDate(todayStr);
        setEndDate(todayStr);
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        setStartDate(format(weekAgo, 'yyyy-MM-dd'));
        setEndDate(todayStr);
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        setStartDate(format(monthAgo, 'yyyy-MM-dd'));
        setEndDate(todayStr);
        break;
    }
  };

  return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-98"
      >
        <Download className="w-5 h-5" />
        <span>Export</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setShowMenu(false);
              setShowDatePicker(false);
            }}
          />
          <div className="absolute left-0 sm:right-0 mt-2 w-full sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-20 overflow-hidden">
            <button
              onClick={exportToExcel}
              disabled={exporting}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors duration-200 text-left disabled:opacity-50"
            >
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-slate-800">Excel (.xlsx)</div>
                <div className="text-xs text-slate-600">Export data lengkap</div>
              </div>
            </button>

            <div className="border-t border-slate-200" />

            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 transition-colors duration-200 text-left"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-slate-800">Export Gambar</div>
                  <div className="text-xs text-slate-600">Pilih rentang tanggal</div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>

            {showDatePicker && (
              <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                  <p className="text-xs text-blue-700">
                    📅 Default: Hari ini ({new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })})
                  </p>
                </div>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => handleQuickDate('today')}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={() => handleQuickDate('week')}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    7 Hari
                  </button>
                  <button
                    onClick={() => handleQuickDate('month')}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    30 Hari
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => updateDateRange(e.target.value, endDate)}
                    max={endDate}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => updateDateRange(startDate, e.target.value)}
                    min={startDate}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => {
                    resetToToday();
                    const today = format(new Date(), 'yyyy-MM-dd');
                    setStartDate(today);
                    setEndDate(today);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 text-xs rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset ke Hari Ini
                </button>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => exportToImage('png')}
                    disabled={exporting || !startDate || !endDate}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Image className="w-4 h-4" />
                    PNG
                  </button>
                  <button
                    onClick={() => exportToImage('jpg')}
                    disabled={exporting || !startDate || !endDate}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Image className="w-4 h-4" />
                    JPG
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
