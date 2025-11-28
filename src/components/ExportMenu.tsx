import { useState } from 'react';
import { Download, FileSpreadsheet, Image, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toPng, toJpeg } from 'html-to-image';
import { Transaction, Category } from '../lib/supabase';
import { createRoot } from 'react-dom/client';
import { SimpleExportView } from './SimpleExportView';

interface ExportMenuProps {
  transactions: Transaction[];
  categories: Category[];
  stats: {
    income: number;
    expense: number;
    balance: number;
  };
}

export function ExportMenu({ transactions, categories, stats }: ExportMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

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
    setExporting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayTransactions = transactions.filter(
        t => t.transaction_date === today
      );

      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(
        <SimpleExportView
          transactions={todayTransactions}
          categories={categories}
          startDate={today}
          endDate={today}
        />
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      const exportElement = container.firstChild as HTMLElement;
      const dataUrl = format === 'png'
        ? await toPng(exportElement, { quality: 1.0, pixelRatio: 2 })
        : await toJpeg(exportElement, { quality: 0.95, pixelRatio: 2 });

      root.unmount();
      document.body.removeChild(container);

      const link = document.createElement('a');
      link.download = `Laporan_${today}.${format}`;
      link.href = dataUrl;
      link.click();

      setShowMenu(false);
    } catch (error) {
      console.error(`Error exporting to ${format.toUpperCase()}:`, error);
      alert(`Gagal mengexport ke ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
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
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 sm:right-0 mt-2 w-full sm:w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-20 overflow-hidden">
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
              onClick={() => exportToImage('png')}
              disabled={exporting}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors duration-200 text-left disabled:opacity-50"
            >
              <Image className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-slate-800">PNG Image</div>
                <div className="text-xs text-slate-600">Laporan hari ini</div>
              </div>
            </button>

            <button
              onClick={() => exportToImage('jpg')}
              disabled={exporting}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors duration-200 text-left disabled:opacity-50"
            >
              <Image className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-medium text-slate-800">JPG Image</div>
                <div className="text-xs text-slate-600">Laporan hari ini</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
