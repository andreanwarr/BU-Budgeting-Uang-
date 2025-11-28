import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, FolderPlus, TrendingUp, TrendingDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import { supabase, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesUpdate: () => void;
  onClose?: () => void;
}

const AVAILABLE_ICONS = [
  'circle', 'square', 'star', 'heart', 'home', 'car', 'plane', 'coffee',
  'shopping-bag', 'gift', 'music', 'book', 'camera', 'phone', 'laptop',
  'shirt', 'pizza', 'utensils', 'dumbbell', 'briefcase', 'banknote'
];

export function CategoryManager({ categories, onCategoriesUpdate, onClose }: CategoryManagerProps) {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    icon: 'circle'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const userCategories = categories.filter(c => c.user_id === user?.id);
  const incomeCategories = userCategories.filter(c => c.type === 'income');
  const expenseCategories = userCategories.filter(c => c.type === 'expense');
  const defaultCategories = categories.filter(c => c.is_default);
  const defaultIncomeCategories = defaultCategories.filter(c => c.type === 'income');
  const defaultExpenseCategories = defaultCategories.filter(c => c.type === 'expense');

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'expense', icon: 'circle' });
    setError('');
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setError('Nama kategori harus diisi');
      return;
    }

    const duplicate = categories.find(
      c => c.name.toLowerCase() === formData.name.trim().toLowerCase() && c.type === formData.type
    );
    if (duplicate) {
      setError('Kategori dengan nama ini sudah ada');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('categories')
        .insert([{
          user_id: user?.id,
          name: formData.name.trim(),
          type: formData.type,
          icon: formData.icon,
          is_default: false
        }]);

      if (insertError) throw insertError;

      showSuccess('Kategori berhasil ditambahkan');
      resetForm();
      setShowCreateModal(false);
      onCategoriesUpdate();
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (category: Category) => {
    if (!formData.name.trim()) {
      setError('Nama kategori harus diisi');
      return;
    }

    const duplicate = categories.find(
      c => c.id !== category.id &&
      c.name.toLowerCase() === formData.name.trim().toLowerCase() &&
      c.type === formData.type
    );
    if (duplicate) {
      setError('Kategori dengan nama ini sudah ada');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('categories')
        .update({
          name: formData.name.trim(),
          icon: formData.icon
        })
        .eq('id', category.id);

      if (updateError) throw updateError;

      showSuccess('Kategori berhasil diperbarui');
      setEditingId(null);
      resetForm();
      onCategoriesUpdate();
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    setLoading(true);
    setError('');

    try {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (deleteError) throw deleteError;

      showSuccess('Kategori berhasil dihapus');
      setShowDeleteModal(null);
      onCategoriesUpdate();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus kategori');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon
    });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowCreateModal(false);
    resetForm();
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-./g, x => x[1].toUpperCase())];
    return IconComponent || Icons.Circle;
  };

  const renderCategoryCard = (category: Category) => {
    const IconComp = getIconComponent(category.icon);
    const isEditing = editingId === category.id;

    return (
      <div
        key={category.id}
        className="p-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:shadow-md transition-all duration-200"
      >
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Kategori</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                placeholder="Masukkan nama kategori"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Icon</label>
              <div className="grid grid-cols-7 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                {AVAILABLE_ICONS.map((iconName) => {
                  const IconCompSelect = getIconComponent(iconName);
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: iconName })}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        formData.icon === iconName
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <IconCompSelect className="w-5 h-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200 font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleUpdate(category)}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                <Save className="w-4 h-4" />
                Simpan
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${
                category.type === 'income'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-rose-100 dark:bg-rose-900/30'
              }`}>
                <IconComp className={`w-6 h-6 ${
                  category.type === 'income'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`} />
              </div>
              <div>
                <div className="font-medium text-slate-800 dark:text-white">{category.name}</div>
                {category.is_default && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">Kategori Bawaan</div>
                )}
              </div>
            </div>
            {!category.is_default && (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(category)}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors duration-200"
                  title="Edit kategori"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(category.id)}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors duration-200"
                  title="Hapus kategori"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage('')} className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Kelola Kategori</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Kelola kategori pemasukan dan pengeluaran Anda
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Tambah Kategori
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Income Categories Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                  Kategori Pemasukan
                </h3>
                <span className="ml-auto text-sm font-medium text-slate-600 dark:text-slate-400">
                  {incomeCategories.length} kategori
                </span>
              </div>

              <div className="space-y-3">
                {incomeCategories.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                    <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Belum ada kategori pemasukan kustom
                    </p>
                  </div>
                ) : (
                  incomeCategories.map(category => renderCategoryCard(category))
                )}
              </div>

              {defaultIncomeCategories.length > 0 && (
                <>
                  <div className="pt-4">
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                      Kategori Bawaan
                    </h4>
                    <div className="space-y-3">
                      {defaultIncomeCategories.map(category => renderCategoryCard(category))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Expense Categories Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                  Kategori Pengeluaran
                </h3>
                <span className="ml-auto text-sm font-medium text-slate-600 dark:text-slate-400">
                  {expenseCategories.length} kategori
                </span>
              </div>

              <div className="space-y-3">
                {expenseCategories.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                    <TrendingDown className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Belum ada kategori pengeluaran kustom
                    </p>
                  </div>
                ) : (
                  expenseCategories.map(category => renderCategoryCard(category))
                )}
              </div>

              {defaultExpenseCategories.length > 0 && (
                <>
                  <div className="pt-4">
                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                      Kategori Bawaan
                    </h4>
                    <div className="space-y-3">
                      {defaultExpenseCategories.map(category => renderCategoryCard(category))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FolderPlus className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Tambah Kategori Baru</h3>
              </div>
              <button
                type="button"
                onClick={cancelEdit}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tipe Kategori
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      formData.type === 'income'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      formData.type === 'expense'
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Pengeluaran
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Gaji, Belanja, dll"
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Icon
                </label>
                <div className="grid grid-cols-7 gap-2 max-h-40 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  {AVAILABLE_ICONS.map((iconName) => {
                    const IconComp = getIconComponent(iconName);
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconName })}
                        className={`p-2.5 rounded-lg transition-all duration-200 ${
                          formData.icon === iconName
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <IconComp className="w-5 h-5 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 font-medium"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md"
                >
                  <Save className="w-5 h-5" />
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-red-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Konfirmasi Hapus</h3>
            </div>

            <div className="p-6">
              <p className="text-slate-700 dark:text-slate-300 mb-6">
                Yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 font-medium"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(showDeleteModal)}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-lg hover:from-rose-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
