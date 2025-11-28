import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { CategoryManagerView } from './CategoryManagerView';
import { CategoryCRUD } from './CategoryCRUD';
import { KasbonManager } from './KasbonManager';
import { Charts } from './Charts';
import { Settings } from './Settings';

export function MainLayout() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Dashboard />;
      case 'categories':
        return <CategoryManagerView />;
      case 'category-crud':
        return <CategoryCRUD />;
      case 'kasbon':
        return <KasbonManager />;
      case 'reports':
        return <Charts />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
