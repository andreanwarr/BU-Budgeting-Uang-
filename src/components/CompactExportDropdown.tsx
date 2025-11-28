import { useState } from 'react';
import { Download, ChevronDown, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toPng, toJpeg } from 'html-to-image';
import { Transaction, Category } from '../lib/supabase';
import { createRoot } from 'react-dom/client';
import { SimpleExportView } from './SimpleExportView';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface CompactExportDropdownProps {
  transactions: Transaction[];
  categories: Category[];
  stats: {
    income: number;
    expense: number;
    balance: number;
  };
  currentFilters?: {
    startDate: string;
    endDate: string;
  };
}

export function CompactExportDropdown({
  transactions,
  categories,
  stats,
  currentFilters
}: CompactExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const extractDateFromUI = (): { startDate: string; endDate: string; displayDate: string } => {
    if (currentFilters?.startDate && currentFilters?.endDate) {
      const start = currentFilters.startDate;
      const end = currentFilters.endDate;

      if (start === end) {
        const parsedDate = new Date(start);
        const displayDate = format(parsedDate, 'dd/MM/yyyy', { locale: id });
        return { startDate: start, endDate: end, displayDate };
      } else {
        const startFormatted = format(new Date(start), 'dd/MM/yyyy', { locale: id });
        const endFormatted = format(new Date(end), 'dd/MM/yyyy', { locale: id });
        return {
          startDate: start,
          endDate: end,
          displayDate: `${startFormatted} - ${endFormatted}`
        };
      }
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const displayToday = format(new Date(), 'dd/MM/yyyy', { locale: id });
    return { startDate: today, endDate: today, displayDate: displayToday };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getAutoFilename = (format: string): string => {
    const { displayDate } = extractDateFromUI();
    const cleanDate = displayDate.replace(/\//g, '-').replace(/ /g, '_');
    const timestamp = Date.now();
    return `Laporan_${cleanDate}_${timestamp}.${format}`;
  };

  const exportToExcel = () => {
    setExporting(true);
    setIsOpen(false);
    try {
      const { displayDate, startDate, endDate } = extractDateFromUI();

      const summaryData = [
        ['LAPORAN KEUANGAN'],
        [`Periode: ${displayDate}`],
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

      const filteredTransactions = transactions.filter(
        t => (!startDate || t.transaction_date >= startDate) &&
             (!endDate || t.transaction_date <= endDate)
      );

      filteredTransactions.forEach((t) => {
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

      const fileName = getAutoFilename('xlsx');
      XLSX.writeFile(wb, fileName);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengexport ke Excel');
    } finally {
      setExporting(false);
    }
  };

  const exportToImage = async (formatType: 'png' | 'jpg') => {
    setExporting(true);
    setIsOpen(false);
    try {
      const { startDate, endDate } = extractDateFromUI();

      const filteredTransactions = transactions.filter(
        t => (!startDate || t.transaction_date >= startDate) &&
             (!endDate || t.transaction_date <= endDate)
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
      const dataUrl = formatType === 'png'
        ? await toPng(exportElement, { quality: 1.0, pixelRatio: 2 })
        : await toJpeg(exportElement, { quality: 0.95, pixelRatio: 2 });

      root.unmount();
      document.body.removeChild(container);

      const link = document.createElement('a');
      link.download = getAutoFilename(formatType);
      link.href = dataUrl;
      link.click();

    } catch (error) {
      console.error(`Error exporting to ${formatType.toUpperCase()}:`, error);
      alert(`Gagal mengexport ke ${formatType.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  };

  const { displayDate } = extractDateFromUI();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl font-medium hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md group w-full sm:w-auto justify-center sm:justify-start"
      >
        <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="text-sm">Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-2xl border-2 border-slate-200 z-20 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b border-emerald-100">
              <p className="text-xs font-semibold text-slate-700">Export Laporan</p>
              <p className="text-xs text-slate-600 mt-0.5">Periode: {displayDate}</p>
            </div>

            <div className="p-3 space-y-2">
              <button
                onClick={exportToExcel}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md active:scale-98"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold">Excel</div>
                  <div className="text-xs opacity-90">Format .xlsx</div>
                </div>
              </button>

              <button
                onClick={() => exportToImage('png')}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md active:scale-98"
              >
                <ImageIcon className="w-5 h-5" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold">PNG</div>
                  <div className="text-xs opacity-90">Format gambar</div>
                </div>
              </button>

              <button
                onClick={() => exportToImage('jpg')}
                disabled={exporting}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md active:scale-98"
              >
                <ImageIcon className="w-5 h-5" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold">JPG</div>
                  <div className="text-xs opacity-90">Format gambar</div>
                </div>
              </button>
            </div>

            {exporting && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
                  <span>Mengexport...</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
