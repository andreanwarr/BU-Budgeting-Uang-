import { useState, useEffect } from 'react';
import { Plus, X, Check, Clock, Pencil, Trash2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { CurrencyInput } from './CurrencyInput';

interface Kasbon {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  loan_date: string;
  due_date?: string;
  status: 'unpaid' | 'paid';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface KasbonFormData {
  name: string;
  amount: string;
  loan_date: string;
  due_date: string;
  status: 'unpaid' | 'paid';
  notes: string;
}

export function KasbonManager() {
  const { user } = useAuth();
  const { currency } = useSettings();
  const [kasbons, setKasbons] = useState<Kasbon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'paid'>('all');
  
  const [formData, setFormData] = useState<KasbonFormData>({
    name: '',
    amount: '',
    loan_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'unpaid',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      loadKasbons();
    }
  }, [user]);

  const loadKasbons = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('kasbon')
      .select('*')
      .eq('user_id', user.id)
      .order('loan_date', { ascending: false });

    if (!error && data) {
      setKasbons(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const kasbonData = {
      user_id: user.id,
      name: formData.name,
      amount: parseFloat(formData.amount),
      loan_date: formData.loan_date,
      due_date: formData.due_date || null,
      status: formData.status,
      notes: formData.notes || null
    };

    if (editingId) {
      const { error } = await supabase
        .from('kasbon')
        .update(kasbonData)
        .eq('id', editingId);

      if (!error) {
        setEditingId(null);
        resetForm();
        loadKasbons();
      }
    } else {
      const { error } = await supabase
        .from('kasbon')
        .insert([kasbonData]);

      if (!error) {
        resetForm();
        loadKasbons();
      }
    }
  };

  const handleEdit = (kasbon: Kasbon) => {
    setFormData({
      name: kasbon.name,
      amount: kasbon.amount.toString(),
      loan_date: kasbon.loan_date,
      due_date: kasbon.due_date || '',
      status: kasbon.status,
      notes: kasbon.notes || ''
    });
    setEditingId(kasbon.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kasbon ini?')) return;

    const { error } = await supabase
      .from('kasbon')
      .delete()
      .eq('id', id);

    if (!error) {
      loadKasbons();
    }
  };

  const handleStatusToggle = async (kasbon: Kasbon) => {
    const newStatus = kasbon.status === 'unpaid' ? 'paid' : 'unpaid';
    
    const { error } = await supabase
      .from('kasbon')
      .update({ status: newStatus })
      .eq('id', kasbon.id);

    if (!error) {
      loadKasbons();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      loan_date: new Date().toISOString().split('T')[0],
      due_date: '',
      status: 'unpaid',
      notes: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredKasbons = kasbons.filter(kasbon => {
    const matchesSearch = kasbon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          kasbon.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || kasbon.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalUnpaid = kasbons
    .filter(k => k.status === 'unpaid')
    .reduce((sum, k) => sum + Number(k.amount), 0);

  const totalPaid = kasbons
    .filter(k => k.status === 'paid')
    .reduce((sum, k) => sum + Number(k.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header & Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Kasbon</h2>
          <p className="text-sm text-slate-600 mt-1">Kelola pinjaman dan pelunasan</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Kasbon
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-orange-700 font-medium">Belum Lunas</p>
              <p className="text-xl font-bold text-orange-900">{formatCurrency(totalUnpaid)}</p>
              <p className="text-xs text-orange-600">{kasbons.filter(k => k.status === 'unpaid').length} kasbon</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-emerald-700 font-medium">Sudah Lunas</p>
              <p className="text-xl font-bold text-emerald-900">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-emerald-600">{kasbons.filter(k => k.status === 'paid').length} kasbon</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Kasbon</p>
              <p className="text-xl font-bold text-blue-900">{formatCurrency(totalUnpaid + totalPaid)}</p>
              <p className="text-xs text-blue-600">{kasbons.length} kasbon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterStatus('unpaid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'unpaid'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
            }`}
          >
            Belum Lunas
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
            }`}
          >
            Lunas
          </button>
        </div>
      </div>

      {/* Kasbon List */}
      <div className="space-y-3">
        {filteredKasbons.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <p className="text-slate-500">Belum ada kasbon</p>
          </div>
        ) : (
          filteredKasbons.map((kasbon) => (
            <div
              key={kasbon.id}
              className={`bg-white p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                kasbon.status === 'unpaid'
                  ? 'border-orange-200 bg-orange-50/30'
                  : 'border-emerald-200 bg-emerald-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{kasbon.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        kasbon.status === 'unpaid'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {kasbon.status === 'unpaid' ? 'Belum Lunas' : 'Lunas'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-2">
                    {formatCurrency(Number(kasbon.amount))}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                    <span>Tanggal: {formatDate(kasbon.loan_date)}</span>
                    {kasbon.due_date && (
                      <span>Jatuh Tempo: {formatDate(kasbon.due_date)}</span>
                    )}
                  </div>
                  {kasbon.notes && (
                    <p className="text-sm text-slate-600 mt-2 italic">{kasbon.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusToggle(kasbon)}
                    className={`p-2 rounded-lg transition-colors ${
                      kasbon.status === 'unpaid'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                    title={kasbon.status === 'unpaid' ? 'Tandai Lunas' : 'Tandai Belum Lunas'}
                  >
                    {kasbon.status === 'unpaid' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(kasbon)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(kasbon.id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? 'Edit Kasbon' : 'Tambah Kasbon'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Pemberi/Penerima *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Contoh: Budi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nominal ({currency === 'IDR' ? 'Rp' : '$'}) *
                </label>
                <CurrencyInput
                  value={formData.amount}
                  onChange={(value) => setFormData({ ...formData, amount: value })}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tanggal Kasbon *
                </label>
                <input
                  type="date"
                  required
                  value={formData.loan_date}
                  onChange={(e) => setFormData({ ...formData, loan_date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tanggal Jatuh Tempo (Opsional)
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'unpaid' | 'paid' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="unpaid">Belum Lunas</option>
                  <option value="paid">Lunas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={3}
                  placeholder="Catatan tambahan..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
