import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DatePreferencesProvider } from './contexts/DatePreferencesContext';
import { AuthForm } from './components/AuthForm';
import { MainLayout } from './components/MainLayout';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent mb-4"></div>
          <p className="text-white text-lg">Memuat...</p>
        </div>
      </div>
    );
  }

  return user ? <MainLayout /> : <AuthForm />;
}

function App() {
  return (
    <AuthProvider>
      <DatePreferencesProvider>
        <AppContent />
      </DatePreferencesProvider>
    </AuthProvider>
  );
}

export default App;
