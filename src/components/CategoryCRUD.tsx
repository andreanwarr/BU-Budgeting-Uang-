/**
 * Category CRUD Management System
 *
 * Complete CRUD (Create, Read, Update, Delete) system for managing
 * transaction categories in the Finance Tracker application.
 *
 * Features:
 * - View all categories with statistics
 * - Create new categories with validation
 * - Update existing categories
 * - Delete categories with safety checks
 * - Search and filter functionality
 * - User-friendly error handling
 *
 * Technology Stack:
 * - Database: Supabase (PostgreSQL)
 * - Frontend: React + TypeScript
 * - Styling: Tailwind CSS
 */

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Database,
  Filter
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  is_default: boolean;
  user_id: string | null;
  created_at: string;
  transaction_count?: number;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface CRUDStats {
  totalCategories: number;
  incomeCategories: number;
  expenseCategories: number;
  defaultCategories: number;
  customCategories: number;
  categoriesWithTransactions: number;
}

// ============================================================================
// AVAILABLE ICONS
// ============================================================================

const AVAILABLE_ICONS = [
  'circle', 'square', 'star', 'heart', 'home', 'car', 'plane', 'coffee',
  'shopping-bag', 'gift', 'music', 'book', 'camera', 'phone', 'laptop',
  'shirt', 'pizza', 'utensils', 'dumbbell', 'briefcase', 'banknote',
  'trending-up', 'trending-down', 'wallet', 'credit-card'
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CategoryCRUD() {
  const { user } = useAuth();

  // State Management
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [defaultFilter, setDefaultFilter] = useState<'all' | 'default' | 'custom'>('all');

  // CRUD Operation State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeleteingCategory] = useState<Category | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    icon: 'circle',
    is_default: false
  });

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, typeFilter, defaultFilter, categories]);

  /**
   * READ: Load all categories from database with transaction counts
   */
  const loadCategories = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      // Get transaction counts for each category
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          const { count } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);

          return {
            ...category,
            transaction_count: count || 0
          };
        })
      );

      setCategories(categoriesWithCounts);
      showSuccessMessage('Categories loaded successfully');
    } catch (err: any) {
      showErrorMessage(`Failed to load categories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply filters and search to categories
   */
  const applyFilters = () => {
    let filtered = [...categories];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(search) ||
        cat.id.toLowerCase().includes(search)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(cat => cat.type === typeFilter);
    }

    // Default/Custom filter
    if (defaultFilter === 'default') {
      filtered = filtered.filter(cat => cat.is_default);
    } else if (defaultFilter === 'custom') {
      filtered = filtered.filter(cat => !cat.is_default);
    }

    setFilteredCategories(filtered);
  };

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validate category name for duplicates and format
   */
  const validateCategoryName = (name: string, type: 'income' | 'expense', excludeId?: string): ValidationResult => {
    // Check empty name
    if (!name.trim()) {
      return { isValid: false, error: 'Category name is required' };
    }

    // Check length
    if (name.trim().length < 2) {
      return { isValid: false, error: 'Category name must be at least 2 characters' };
    }

    if (name.trim().length > 50) {
      return { isValid: false, error: 'Category name must not exceed 50 characters' };
    }

    // Check for duplicate
    const duplicate = categories.find(cat =>
      cat.name.toLowerCase() === name.trim().toLowerCase() &&
      cat.type === type &&
      cat.id !== excludeId
    );

    if (duplicate) {
      return { isValid: false, error: `Category "${name}" already exists for ${type}` };
    }

    return { isValid: true };
  };

  // ============================================================================
  // CREATE OPERATION
  // ============================================================================

  /**
   * CREATE: Add new category to database
   */
  const handleCreate = async () => {
    setError('');
    setSuccess('');

    // Validate input
    const validation = validateCategoryName(formData.name, formData.type);
    if (!validation.isValid) {
      showErrorMessage(validation.error!);
      return;
    }

    setLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from('categories')
        .insert([{
          name: formData.name.trim(),
          type: formData.type,
          icon: formData.icon,
          is_default: formData.is_default,
          user_id: formData.is_default ? null : user?.id
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      showSuccessMessage(`Category "${formData.name}" created successfully`);
      resetForm();
      setShowCreateForm(false);
      loadCategories();
    } catch (err: any) {
      showErrorMessage(`Failed to create category: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // UPDATE OPERATION
  // ============================================================================

  /**
   * UPDATE: Modify existing category
   */
  const handleUpdate = async () => {
    if (!editingCategory) return;

    setError('');
    setSuccess('');

    // Validate input
    const validation = validateCategoryName(formData.name, formData.type, editingCategory.id);
    if (!validation.isValid) {
      showErrorMessage(validation.error!);
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('categories')
        .update({
          name: formData.name.trim(),
          icon: formData.icon,
          // Cannot change type or is_default for existing categories
        })
        .eq('id', editingCategory.id);

      if (updateError) throw updateError;

      showSuccessMessage(`Category "${formData.name}" updated successfully`);
      setEditingCategory(null);
      resetForm();
      loadCategories();
    } catch (err: any) {
      showErrorMessage(`Failed to update category: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // DELETE OPERATION
  // ============================================================================

  /**
   * DELETE: Remove category with safety checks
   */
  const handleDelete = async () => {
    if (!deletingCategory) return;

    setError('');
    setSuccess('');

    // Check if category has transactions
    if (deletingCategory.transaction_count && deletingCategory.transaction_count > 0) {
      showErrorMessage(
        `Cannot delete category "${deletingCategory.name}". ` +
        `It has ${deletingCategory.transaction_count} transaction(s). ` +
        `Please reassign or delete those transactions first.`
      );
      setDeleteingCategory(null);
      return;
    }

    // Prevent deletion of default categories
    if (deletingCategory.is_default) {
      showErrorMessage('Cannot delete default categories. They are required for the application.');
      setDeleteingCategory(null);
      return;
    }

    setLoading(true);

    try {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', deletingCategory.id);

      if (deleteError) throw deleteError;

      showSuccessMessage(`Category "${deletingCategory.name}" deleted successfully`);
      setDeleteingCategory(null);
      loadCategories();
    } catch (err: any) {
      showErrorMessage(`Failed to delete category: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      icon: 'circle',
      is_default: false
    });
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon,
      is_default: category.is_default
    });
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setShowCreateForm(false);
    resetForm();
    setError('');
    setSuccess('');
  };

  const showErrorMessage = (message: string) => {
    setError(message);
    setSuccess('');
    setTimeout(() => setError(''), 5000);
  };

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[
      iconName.charAt(0).toUpperCase() +
      iconName.slice(1).replace(/-./g, x => x[1].toUpperCase())
    ];
    return IconComponent || Icons.Circle;
  };

  // ============================================================================
  // STATISTICS CALCULATION
  // ============================================================================

  const calculateStats = (): CRUDStats => {
    return {
      totalCategories: categories.length,
      incomeCategories: categories.filter(c => c.type === 'income').length,
      expenseCategories: categories.filter(c => c.type === 'expense').length,
      defaultCategories: categories.filter(c => c.is_default).length,
      customCategories: categories.filter(c => !c.is_default).length,
      categoriesWithTransactions: categories.filter(c => c.transaction_count && c.transaction_count > 0).length
    };
  };

  const stats = calculateStats();

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Category Database Management
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Complete CRUD system for managing transaction categories
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="flex-1">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="flex-1">{success}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Total Categories</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalCategories}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-xl">
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Income</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.incomeCategories}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-xl">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Expense</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.expenseCategories}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 p-4 rounded-xl">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Default</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.defaultCategories}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-4 rounded-xl">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Custom</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.customCategories}</p>
        </div>
        <div className="bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800 p-4 rounded-xl">
          <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mb-1">In Use</p>
          <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{stats.categoriesWithTransactions}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowCreateForm(true);
              setEditingCategory(null);
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create New Category
          </button>
          <button
            onClick={loadCategories}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filters:</span>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="income">Income Only</option>
          <option value="expense">Expense Only</option>
        </select>

        <select
          value={defaultFilter}
          onChange={(e) => setDefaultFilter(e.target.value as any)}
          className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        >
          <option value="all">All Categories</option>
          <option value="default">Default Only</option>
          <option value="custom">Custom Only</option>
        </select>

        <span className="text-sm text-slate-600 dark:text-slate-400">
          Showing {filteredCategories.length} of {categories.length} categories
        </span>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingCategory) && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
            {editingCategory ? 'Update Category' : 'Create New Category'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Groceries, Salary"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type * {editingCategory && '(cannot be changed)'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!!editingCategory}
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`py-2 px-3 rounded-xl font-medium transition-all duration-200 ${
                    formData.type === 'income'
                      ? 'bg-green-500 text-white'
                      : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                  } ${editingCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Income
                </button>
                <button
                  type="button"
                  disabled={!!editingCategory}
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`py-2 px-3 rounded-xl font-medium transition-all duration-200 ${
                    formData.type === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                  } ${editingCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Expense
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Icon *
              </label>
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 max-h-40 overflow-y-auto p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-600">
                {AVAILABLE_ICONS.map((iconName) => {
                  const IconComp = getIconComponent(iconName);
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: iconName })}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        formData.icon === iconName
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                      title={iconName}
                    >
                      <IconComp className="w-5 h-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>

            {!editingCategory && (
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Make this a default category (visible to all users)
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={cancelEdit}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={editingCategory ? handleUpdate : handleCreate}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Icon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Transactions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">ID</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-600 dark:text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-600 dark:text-slate-400">
                    No categories found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => {
                  const IconComp = getIconComponent(category.icon);
                  return (
                    <tr key={category.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          category.type === 'income'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 dark:text-white">{category.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.type === 'income'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {category.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.is_default
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        }`}>
                          {category.is_default ? 'Default' : 'Custom'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {category.transaction_count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(category.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {category.id.substring(0, 8)}...
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => startEdit(category)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteingCategory(category)}
                            disabled={category.is_default}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={category.is_default ? 'Cannot delete default category' : 'Delete category'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                  Delete Category
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Are you sure you want to delete "{deletingCategory.name}"?
                </p>
                {deletingCategory.transaction_count && deletingCategory.transaction_count > 0 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium">
                    Warning: This category has {deletingCategory.transaction_count} transaction(s).
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteingCategory(null)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
