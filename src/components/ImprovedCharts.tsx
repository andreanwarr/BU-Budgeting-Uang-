import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { EnhancedReportBar } from './EnhancedReportBar';
import { CategoryDetailView } from './CategoryDetailView';
import { EnhancedDateRangePicker } from './EnhancedDateRangePicker';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
  title: string;
  description?: string;
  transaction_date: string;
  category: {
    id: string;
    name: string;
    icon: string;
    type: string;
  };
}

interface CategoryReport {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  transactions: Array<{
    id: string;
    title: string;
    description?: string;
    amount: number;
    date: string;
  }>;
}

const CATEGORY_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#a855f7', // purple
  '#6366f1', // indigo
  '#84cc16', // lime
];

export function ImprovedCharts() {
  const { user } = useAuth();
  const { theme } = useSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedCategory, setSelectedCategory] = useState<{
    category: CategoryReport;
    type: 'income' | 'expense';
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user, dateRange]);

  const loadTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', user.id)
      .gte('transaction_date', dateRange.startDate)
      .lte('transaction_date', dateRange.endDate)
      .order('transaction_date', { ascending: false });

    if (!error && data) {
      setTransactions(data as Transaction[]);
    }
  };

  const reportData = useMemo(() => {
    const incomeByCategory: Record<string, CategoryReport> = {};
    const expenseByCategory: Record<string, CategoryReport> = {};

    transactions.forEach(t => {
      const categoryId = t.category_id;
      const categoryName = t.category?.name || 'Lainnya';

      const transactionDetail = {
        id: t.id,
        title: t.title,
        description: t.description,
        amount: Number(t.amount),
        date: t.transaction_date
      };

      if (t.type === 'income') {
        if (!incomeByCategory[categoryId]) {
          incomeByCategory[categoryId] = {
            id: categoryId,
            name: categoryName,
            amount: 0,
            percentage: 0,
            color: CATEGORY_COLORS[Object.keys(incomeByCategory).length % CATEGORY_COLORS.length],
            transactions: []
          };
        }
        incomeByCategory[categoryId].amount += Number(t.amount);
        incomeByCategory[categoryId].transactions.push(transactionDetail);
      } else {
        if (!expenseByCategory[categoryId]) {
          expenseByCategory[categoryId] = {
            id: categoryId,
            name: categoryName,
            amount: 0,
            percentage: 0,
            color: CATEGORY_COLORS[Object.keys(expenseByCategory).length % CATEGORY_COLORS.length],
            transactions: []
          };
        }
        expenseByCategory[categoryId].amount += Number(t.amount);
        expenseByCategory[categoryId].transactions.push(transactionDetail);
      }
    });

    const incomeCategories = Object.values(incomeByCategory);
    const expenseCategories = Object.values(expenseByCategory);

    const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.amount, 0);
    const totalExpense = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0);

    incomeCategories.forEach(cat => {
      cat.percentage = totalIncome > 0 ? (cat.amount / totalIncome) * 100 : 0;
    });

    expenseCategories.forEach(cat => {
      cat.percentage = totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0;
    });

    return {
      incomeCategories,
      expenseCategories,
      totalIncome,
      totalExpense
    };
  }, [transactions]);

  const handleCategoryClick = (category: CategoryReport, type: 'income' | 'expense') => {
    setSelectedCategory({ category, type });
  };

  const handleDateChange = (start: string, end: string) => {
    setDateRange({ startDate: start, endDate: end });
  };

  const handleExportCategory = (category: CategoryReport, type: 'income' | 'expense') => {
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    };

    const summaryData = [
      ['DETAIL KATEGORI'],
      [''],
      ['Kategori', category.name],
      ['Tipe', type === 'income' ? 'Pemasukan' : 'Pengeluaran'],
      ['Total', formatCurrency(category.amount)],
      ['Jumlah Transaksi', category.transactions.length],
      ['Periode', `${dateRange.startDate} s/d ${dateRange.endDate}`],
      [''],
      ['']
    ];

    const transactionData = [
      ['DAFTAR TRANSAKSI'],
      [''],
      ['No', 'Tanggal', 'Judul', 'Deskripsi', 'Jumlah']
    ];

    category.transactions.forEach((t, index) => {
      transactionData.push([
        (index + 1).toString(),
        format(new Date(t.date), 'dd/MM/yyyy'),
        t.title,
        t.description || '',
        formatCurrency(t.amount)
      ]);
    });

    const allData = [...summaryData, ...transactionData];
    const ws = XLSX.utils.aoa_to_sheet(allData);

    ws['!cols'] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 30 },
      { wch: 40 },
      { wch: 20 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, category.name);

    const fileName = `${category.name}_${dateRange.startDate}_${dateRange.endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleDownloadAll = () => {
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    };

    const summaryData = [
      ['RINGKASAN LAPORAN'],
      [''],
      ['Periode', `${dateRange.startDate} s/d ${dateRange.endDate}`],
      ['Total Pemasukan', formatCurrency(reportData.totalIncome)],
      ['Total Pengeluaran', formatCurrency(reportData.totalExpense)],
      ['Saldo', formatCurrency(reportData.totalIncome - reportData.totalExpense)],
      [''],
      ['']
    ];

    const categoryData = [
      ['RINGKASAN PER KATEGORI'],
      [''],
      ['Tipe', 'Kategori', 'Jumlah Transaksi', 'Total', 'Persentase']
    ];

    reportData.expenseCategories.forEach(cat => {
      categoryData.push([
        'Pengeluaran',
        cat.name,
        cat.transactions.length.toString(),
        formatCurrency(cat.amount),
        `${cat.percentage.toFixed(1)}%`
      ]);
    });

    reportData.incomeCategories.forEach(cat => {
      categoryData.push([
        'Pemasukan',
        cat.name,
        cat.transactions.length.toString(),
        formatCurrency(cat.amount),
        `${cat.percentage.toFixed(1)}%`
      ]);
    });

    const transactionData = [
      [''],
      [''],
      ['DETAIL TRANSAKSI'],
      [''],
      ['Tanggal', 'Tipe', 'Kategori', 'Judul', 'Deskripsi', 'Jumlah']
    ];

    transactions.forEach(t => {
      transactionData.push([
        format(new Date(t.transaction_date), 'dd/MM/yyyy'),
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        t.category?.name || 'Lainnya',
        t.title,
        t.description || '',
        formatCurrency(Number(t.amount))
      ]);
    });

    const allData = [...summaryData, ...categoryData, ...transactionData];
    const ws = XLSX.utils.aoa_to_sheet(allData);

    ws['!cols'] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 18 },
      { wch: 30 },
      { wch: 40 },
      { wch: 20 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Lengkap');

    const fileName = `Laporan_Lengkap_${dateRange.startDate}_${dateRange.endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Laporan Keuangan
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Analisis detail per kategori dengan visualisasi interaktif
          </p>
        </div>

        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Download Semua
        </button>
      </div>

      {/* Date Range Picker */}
      <EnhancedDateRangePicker
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onDateChange={handleDateChange}
        onDownload={handleDownloadAll}
        showDownload={true}
      />

      {/* Report Bar */}
      <EnhancedReportBar
        incomeCategories={reportData.incomeCategories}
        expenseCategories={reportData.expenseCategories}
        totalIncome={reportData.totalIncome}
        totalExpense={reportData.totalExpense}
        onCategoryClick={handleCategoryClick}
      />

      {/* Category Detail Modal */}
      {selectedCategory && (
        <CategoryDetailView
          categoryName={selectedCategory.category.name}
          categoryColor={selectedCategory.category.color}
          type={selectedCategory.type}
          totalAmount={selectedCategory.category.amount}
          percentage={selectedCategory.category.percentage}
          transactions={selectedCategory.category.transactions}
          dateRange={{ start: dateRange.startDate, end: dateRange.endDate }}
          onClose={() => setSelectedCategory(null)}
          onExport={() => handleExportCategory(selectedCategory.category, selectedCategory.type)}
        />
      )}
    </div>
  );
}
