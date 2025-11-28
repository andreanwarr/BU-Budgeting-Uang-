import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, FolderPlus } from 'lucide-react';
import * as Icons from 'lucide-react';
import { supabase, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesUpdate: () => void;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  'circle', 'square', 'star', 'heart', 'home', 'car', 'plane', 'coffee',
  'shopping-bag', 'gift', 'music', 'book', 'camera', 'phone', 'laptop',
  'shirt', 'pizza', 'utensils', 'dumbbell', 'briefcase', 'banknote'
];

export function CategoryManager({ categories, onCategoriesUpdate, onClose }: CategoryManagerProps) {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    icon: 'circle'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userCategories = categories.filter(c => c.user_id === user?.id);

  const handleAdd = async () => {
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

      setFormData({ name: '', type: 'expense', icon: 'circle' });
      setAdding(false);
      onCategoriesUpdate();
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (category: Category) => {
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

      setEditingId(null);
      setFormData({ name: '', type: 'expense', icon: 'circle' });
      onCategoriesUpdate();
    } catch (err: any) {
      setError(err.message || 'Gagal mengupdate kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Transaksi yang menggunakan kategori ini tidak akan bisa dihapus.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (deleteError) throw deleteError;

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
    setAdding(false);
    setFormData({ name: '', type: 'expense', icon: 'circle' });
    setError('');
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-./g, x => x[1].toUpperCase())];
    return IconComponent || Icons.Circle;
  };

  const isModal = onClose && typeof onClose === 'function';

  const content = (
    <>
      {isModal && (
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FolderPlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Kelola Kategori</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      )}

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Tambah Kategori Baru
            </button>
          </div>

          {adding && (
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-3">Kategori Baru</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipe</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFormData({ ...formData, type: 'income' })}
                      className={`py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
                        formData.type === 'income'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Pemasukan
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, type: 'expense' })}
                      className={`py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
                        formData.type === 'expense'
                          ? 'bg-rose-500 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Pengeluaran
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nama Kategori</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Hobi"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                  <div className="grid grid-cols-7 gap-2 max-h-32 overflow-y-auto p-2 bg-white rounded-lg border border-slate-300">
                    {AVAILABLE_ICONS.map((iconName) => {
                      const IconComp = getIconComponent(iconName);
                      return (
                        <button
                          key={iconName}
                          onClick={() => setFormData({ ...formData, icon: iconName })}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            formData.icon === iconName
                              ? 'bg-emerald-500 text-white'
                              : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <IconComp className="w-5 h-5 mx-auto" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={cancelEdit}
                    className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Kategori Saya ({userCategories.length})</h3>
              {userCategories.length === 0 ? (
                <p className="text-slate-600 text-sm text-center py-8 bg-slate-50 rounded-lg">
                  Belum ada kategori custom. Klik tombol di atas untuk menambah.
                </p>
              ) : (
                <div className="space-y-2">
                  {userCategories.map((category) => {
                    const IconComp = getIconComponent(category.icon);
                    const isEditing = editingId === category.id;

                    return (
                      <div
                        key={category.id}
                        className="p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow duration-200"
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <div>
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <div className="grid grid-cols-7 gap-2 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg">
                                {AVAILABLE_ICONS.map((iconName) => {
                                  const IconCompSelect = getIconComponent(iconName);
                                  return (
                                    <button
                                      key={iconName}
                                      onClick={() => setFormData({ ...formData, icon: iconName })}
                                      className={`p-2 rounded transition-all duration-200 ${
                                        formData.icon === iconName
                                          ? 'bg-emerald-500 text-white'
                                          : 'hover:bg-slate-200 text-slate-600'
                                      }`}
                                    >
                                      <IconCompSelect className="w-4 h-4 mx-auto" />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={cancelEdit}
                                className="flex-1 px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => handleEdit(category)}
                                disabled={loading}
                                className="flex-1 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                              >
                                Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                category.type === 'income' ? 'bg-emerald-100' : 'bg-rose-100'
                              }`}>
                                <IconComp className={`w-5 h-5 ${
                                  category.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                }`} />
                              </div>
                              <div>
                                <div className="font-medium text-slate-800">{category.name}</div>
                                <div className="text-xs text-slate-600">
                                  {category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => startEdit(category)}
                                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(category.id)}
                                className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
    </>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
      {content}
    </div>
  );
}
