import { useState } from 'react';
import { Settings as SettingsIcon, Globe, DollarSign, Info, Sun, Moon, Check, User } from 'lucide-react';
import { useSettings, Language, Currency } from '../contexts/SettingsContext';
import { ProfileManager } from './ProfileManager';

export function Settings() {
  const { language, currency, theme, setLanguage, setCurrency, setTheme } = useSettings();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'preferences' | 'profile'>('preferences');

  const handleLanguageChange = async (newLanguage: Language) => {
    setSaving(true);
    await setLanguage(newLanguage);
    setSaving(false);
  };

  const handleCurrencyChange = async (newCurrency: Currency) => {
    setSaving(true);
    await setCurrency(newCurrency);
    setSaving(false);
  };

  const handleThemeChange = async () => {
    setSaving(true);
    await setTheme(theme === 'light' ? 'dark' : 'light');
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {language === 'en' ? 'Settings' : 'Pengaturan'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {language === 'en' ? 'Manage your app preferences and profile' : 'Kelola preferensi aplikasi dan profil Anda'}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'preferences'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          {language === 'en' ? 'Preferences' : 'Preferensi'}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          data-tab="profile"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          <User className="w-5 h-5" />
          {language === 'en' ? 'Profile' : 'Profil'}
        </button>
      </div>

      {activeTab === 'profile' ? (
        <ProfileManager />
      ) : (
        <div className="grid gap-6">
        {/* Theme Setting */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              {theme === 'light' ? (
                <Sun className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              ) : (
                <Moon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                {language === 'en' ? 'Theme' : 'Tema'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {language === 'en'
                  ? 'Choose between light and dark mode'
                  : 'Pilih antara mode terang dan gelap'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleThemeChange}
                  disabled={saving}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    theme === 'light'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Sun className="w-5 h-5" />
                  <span>{language === 'en' ? 'Light' : 'Terang'}</span>
                  {theme === 'light' && <Check className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleThemeChange}
                  disabled={saving}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Moon className="w-5 h-5" />
                  <span>{language === 'en' ? 'Dark' : 'Gelap'}</span>
                  {theme === 'dark' && <Check className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Language Setting */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                {language === 'en' ? 'Language' : 'Bahasa'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {language === 'en'
                  ? 'Select your preferred language'
                  : 'Pilih bahasa yang Anda inginkan'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleLanguageChange('en')}
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    language === 'en'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <span>English</span>
                  {language === 'en' && <Check className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => handleLanguageChange('id')}
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    language === 'id'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <span>Bahasa Indonesia</span>
                  {language === 'id' && <Check className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Setting */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                {language === 'en' ? 'Currency' : 'Mata Uang'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {language === 'en'
                  ? 'Choose your currency format'
                  : 'Pilih format mata uang Anda'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCurrencyChange('USD')}
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    currency === 'USD'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <span>USD ($)</span>
                  {currency === 'USD' && <Check className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => handleCurrencyChange('IDR')}
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    currency === 'IDR'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <span>IDR (Rp)</span>
                  {currency === 'IDR' && <Check className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Info className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                {language === 'en' ? 'About' : 'Tentang'}
              </h3>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {language === 'en' ? 'BU - Budgeting Uang' : 'BU - Budgeting Uang'}
                  </p>
                  <p className="mt-1">
                    {language === 'en' ? 'Version 2.0.0' : 'Versi 2.0.0'}
                  </p>
                </div>
                <p>
                  {language === 'en'
                    ? 'A comprehensive financial management application to help you track income, expenses, and manage your budget efficiently.'
                    : 'Aplikasi manajemen keuangan yang komprehensif untuk membantu Anda melacak pemasukan, pengeluaran, dan mengelola anggaran Anda secara efisien.'}
                </p>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {language === 'en' ? 'Features:' : 'Fitur:'}
                  </p>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>{language === 'en' ? 'Transaction tracking' : 'Pelacakan transaksi'}</li>
                    <li>{language === 'en' ? 'Category management' : 'Manajemen kategori'}</li>
                    <li>{language === 'en' ? 'Financial reports' : 'Laporan keuangan'}</li>
                    <li>{language === 'en' ? 'Loan management (Kasbon)' : 'Manajemen kasbon'}</li>
                    <li>{language === 'en' ? 'Multi-currency support' : 'Dukungan multi-mata uang'}</li>
                    <li>{language === 'en' ? 'Dark mode' : 'Mode gelap'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {saving && (
          <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg">
            {language === 'en' ? 'Saving...' : 'Menyimpan...'}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
