import { useState, useEffect } from 'react';
import { LayoutDashboard, Receipt, FolderOpen, HandCoins, BarChart3, Settings, LogOut, Menu, X, Wallet, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { signOut, user } = useAuth();
  const { theme, setTheme, t } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadUserProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }

    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadUserProfile();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [user]);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'categories', label: t('categories'), icon: FolderOpen },
    { id: 'kasbon', label: t('kasbon'), icon: HandCoins },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    onViewChange(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg transition-all duration-200 active:scale-95"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Mobile: 80% width with proper iOS Safari scroll support */}
      <aside
        className={`fixed lg:sticky top-0 left-0 inset-y-0 max-h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'
        } w-[80%] sm:w-72`}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header - Fixed at top */}
          <div className="shrink-0 p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('appName')}</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">{t('appFullName')}</p>
              </div>
            </div>
          </div>

          {/* User Info - Fixed below header */}
          <div className="shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                handleItemClick('settings');
                setTimeout(() => {
                  const profileTab = document.querySelector('[data-tab="profile"]') as HTMLElement;
                  if (profileTab) profileTab.click();
                }, 100);
              }}
              className="w-full flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors duration-200"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{user?.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('activeUser')}</p>
              </div>
              <User className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Navigation Menu - Scrollable middle section */}
          <nav className="flex-1 overflow-y-auto px-4 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Theme Toggle & Logout - Fixed at bottom */}
          <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="font-medium">{theme === 'light' ? (t('language') === 'English' ? 'Dark Mode' : 'Mode Gelap') : (t('language') === 'English' ? 'Light Mode' : 'Mode Terang')}</span>
            </button>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t('logout')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
