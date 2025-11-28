import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { CategoryManager } from './CategoryManager';
import { KasbonManager } from './KasbonManager';
import { Charts } from './Charts';

export function MainLayout() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Dashboard />;
      case 'categories':
        return <CategoryManager />;
      case 'kasbon':
        return <KasbonManager />;
      case 'reports':
        return <Charts />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Pengaturan</h2>
              <p className="text-sm text-slate-600 mt-1">Kelola preferensi aplikasi Anda</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <p className="text-slate-600">Fitur pengaturan akan segera hadir.</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
