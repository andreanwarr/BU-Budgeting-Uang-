import { useState } from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toPng, toJpeg } from 'html-to-image';
import { Transaction, Category } from '../lib/supabase';
import { createRoot } from 'react-dom/client';
import { SimpleExportView } from './SimpleExportView';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface SimplifiedExportMenuProps {
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

export function SimplifiedExportMenu({
  transactions,
  categories,
  stats,
  currentFilters
}: SimplifiedExportMenuProps) {
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

    const dateElements = document.querySelectorAll('[style*="text-decoration: underline"], .text-red-500, [class*="underline"]');

    for (const element of Array.from(dateElements)) {
      const text = element.textContent || '';
      const dateMatch = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);

      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        const isoDate = `${year}-${month}-${day}`;
        const displayDate = `${day}/${month}/${year}`;
        return { startDate: isoDate, endDate: isoDate, displayDate };
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" />
            Export Laporan
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Periode: <span className="font-medium text-emerald-600">{displayDate}</span>
          </p>
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-3 bg-blue-50 border border-blue-200 rounded-lg p-2">
        <p className="flex items-center gap-1">
          <span className="font-medium">✨ Auto-detect:</span>
          <span>Tanggal otomatis terdeteksi dari filter aktif</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={exportToExcel}
          disabled={exporting}
          className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6"/>
            <path d="M8 13h8M8 17h8M8 9h2"/>
          </svg>
          <span className="text-xs">Excel</span>
        </button>

        <button
          onClick={() => exportToImage('png')}
          disabled={exporting}
          className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
        >
          <ImageIcon className="w-6 h-6" />
          <span className="text-xs">PNG</span>
        </button>

        <button
          onClick={() => exportToImage('jpg')}
          disabled={exporting}
          className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
        >
          <ImageIcon className="w-6 h-6" />
          <span className="text-xs">JPG</span>
        </button>
      </div>

      {exporting && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
          <span>Mengexport...</span>
        </div>
      )}
    </div>
  );
}
