import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DatePreferencesProvider } from './contexts/DatePreferencesContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthForm } from './components/AuthForm';
import { AuthCallback } from './components/AuthCallback';
import { MainLayout } from './components/MainLayout';

function AppContent() {
  const { user, loading } = useAuth();

  // Check if this is an auth callback (email verification)
  const isAuthCallback = window.location.pathname === '/auth/callback' ||
                        window.location.hash.includes('access_token');

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

  // Show callback page for email verification
  if (isAuthCallback) {
    return <AuthCallback />;
  }

  return user ? <MainLayout /> : <AuthForm />;
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <DatePreferencesProvider>
          <AppContent />
        </DatePreferencesProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
