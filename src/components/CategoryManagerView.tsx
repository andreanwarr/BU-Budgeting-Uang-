import { useState, useEffect } from 'react';
import { FolderPlus } from 'lucide-react';
import { supabase, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CategoryManager } from './CategoryManager';

export function CategoryManagerView() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    if (!user?.id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`is_default.eq.true,user_id.eq.${user.id}`)
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (!error && data) {
      setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent mb-4"></div>
          <p className="text-slate-600">Memuat kategori...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FolderPlus className="w-8 h-8 text-emerald-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kelola Kategori</h2>
          <p className="text-sm text-slate-600 mt-1">Tambah, edit, atau hapus kategori transaksi Anda</p>
        </div>
      </div>

      <CategoryManager
        categories={categories}
        onCategoriesUpdate={loadCategories}
        onClose={() => {}}
      />
    </div>
  );
}
