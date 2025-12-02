import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                Terjadi Kesalahan
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Mohon maaf, terjadi kesalahan saat memuat halaman. Silakan muat ulang halaman.
              </p>
              {this.state.error && (
                <details className="mb-6 w-full text-left">
                  <summary className="cursor-pointer text-sm text-slate-500 dark:text-slate-400 mb-2">
                    Detail error (untuk debugging)
                  </summary>
                  <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded-lg overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
              >
                <RefreshCw className="w-5 h-5" />
                Muat Ulang Halaman
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
