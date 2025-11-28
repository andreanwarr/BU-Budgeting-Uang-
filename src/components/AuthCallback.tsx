import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export function AuthCallback() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Memverifikasi email Anda...');

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the hash from URL (contains access_token and other params)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        // Check if this is an email verification callback
        if (type === 'signup' && accessToken) {
          // Exchange the token for a session
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            throw error;
          }

          if (data.session?.user?.email_confirmed_at) {
            setStatus('success');
            setMessage('Email berhasil diverifikasi! Anda akan diarahkan ke aplikasi...');

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            throw new Error('Verifikasi email gagal');
          }
        } else if (user?.email_confirmed_at) {
          // User is already verified and logged in
          setStatus('success');
          setMessage('Anda sudah terverifikasi. Mengarahkan ke aplikasi...');

          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          // No valid verification token
          setStatus('error');
          setMessage('Link verifikasi tidak valid atau sudah kedaluwarsa.');
        }
      } catch (error: any) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Terjadi kesalahan saat memverifikasi email.');
      }
    };

    handleEmailVerification();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          {status === 'loading' && (
            <>
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Loader className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Memverifikasi Email</h2>
              <p className="text-slate-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="bg-emerald-100 p-4 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-800 mb-2">Verifikasi Berhasil!</h2>
              <p className="text-slate-600 mb-4">{message}</p>
              <div className="w-full bg-emerald-100 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="bg-red-100 p-4 rounded-full mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-800 mb-2">Verifikasi Gagal</h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white py-3 px-4 rounded-xl font-semibold hover:from-slate-800 hover:to-slate-950 transition-all duration-200"
              >
                Kembali ke Halaman Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
