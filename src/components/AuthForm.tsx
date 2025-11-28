import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Wallet, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { validateEmailDomain, getPasswordStrength } from '../utils/emailValidation';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const { signIn, signUp, resendVerificationEmail } = useAuth();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (email && isSignUp) {
        const validation = await validateEmailDomain(email);
        if (!validation.isValid) {
          setEmailError(validation.error || '');
        } else {
          setEmailError('');
          setEmailWarning(validation.warnings?.join(' ') || '');
        }
      } else {
        setEmailError('');
        setEmailWarning('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, isSignUp]);

  useEffect(() => {
    if (password && isSignUp) {
      const strength = getPasswordStrength(password);
      setPasswordStrength(strength.strength);
    } else {
      setPasswordStrength(null);
    }
  }, [password, isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerificationSent(false);

    if (isSignUp && emailError) {
      setError('Perbaiki email Anda sebelum mendaftar');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error, needsEmailVerification } = await signUp(email, password);

        if (error) {
          if (error.message.includes('User already registered')) {
            setError('Email sudah terdaftar. Silakan login atau gunakan email lain.');
          } else {
            setError(error.message);
          }
        } else if (needsEmailVerification) {
          setVerificationSent(true);
          setVerificationEmail(email);
          setEmail('');
          setPassword('');
        }
      } else {
        const { error } = await signIn(email, password);

        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setError('Email belum diverifikasi. Silakan cek inbox Anda dan klik link verifikasi.');
            setVerificationEmail(email);
          } else if (error.message.includes('Invalid login credentials')) {
            setError('Email atau password salah.');
          } else {
            setError(error.message);
          }
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl mb-4">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">BU</h1>
            <p className="text-lg font-semibold text-emerald-600 mb-1">Budgeting Uang</p>
            <p className="text-slate-600 text-center">
              Kelola keuangan Anda dengan mudah dan efisien
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    emailError
                      ? 'border-red-300 focus:ring-red-500'
                      : emailWarning
                      ? 'border-yellow-300 focus:ring-yellow-500'
                      : 'border-slate-300 focus:ring-emerald-500'
                  }`}
                  placeholder="nama@email.com"
                />
                {emailError && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}
                {emailWarning && !emailError && (
                  <div className="flex items-center gap-2 mt-2 text-yellow-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{emailWarning}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                placeholder="Minimal 6 karakter"
              />
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    <div className={`h-1 flex-1 rounded ${
                      passwordStrength === 'weak' ? 'bg-red-500' : 'bg-slate-200'
                    }`} />
                    <div className={`h-1 flex-1 rounded ${
                      passwordStrength === 'medium' || passwordStrength === 'strong' ? 'bg-yellow-500' : 'bg-slate-200'
                    }`} />
                    <div className={`h-1 flex-1 rounded ${
                      passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} />
                  </div>
                  <p className={`text-xs ${
                    passwordStrength === 'weak' ? 'text-red-600' :
                    passwordStrength === 'medium' ? 'text-yellow-600' :
                    'text-emerald-600'
                  }`}>
                    Password {passwordStrength === 'weak' ? 'lemah' : passwordStrength === 'medium' ? 'cukup kuat' : 'kuat'}
                  </p>
                </div>
              )}
            </div>

            {verificationSent && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Email verifikasi telah dikirim!</p>
                    <p className="text-xs mb-2">
                      Silakan cek inbox email Anda ({verificationEmail}) dan klik link verifikasi untuk mengaktifkan akun.
                      Jika tidak menerima email, periksa folder spam.
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        setLoading(true);
                        const { error } = await resendVerificationEmail(verificationEmail);
                        if (error) {
                          setError('Gagal mengirim ulang email. Silakan coba lagi.');
                        } else {
                          setError('');
                          alert('Email verifikasi telah dikirim ulang!');
                        }
                        setLoading(false);
                      }}
                      disabled={loading}
                      className="text-xs font-semibold underline hover:text-emerald-800 disabled:opacity-50"
                    >
                      Kirim ulang email verifikasi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <p>{error}</p>
                {verificationEmail && error.includes('Email belum diverifikasi') && (
                  <button
                    type="button"
                    onClick={async () => {
                      setLoading(true);
                      const { error: resendError } = await resendVerificationEmail(verificationEmail);
                      if (resendError) {
                        setError('Gagal mengirim ulang email. Silakan coba lagi.');
                      } else {
                        setError('');
                        setVerificationSent(true);
                      }
                      setLoading(false);
                    }}
                    disabled={loading}
                    className="mt-2 text-xs font-semibold underline hover:text-red-800 disabled:opacity-50"
                  >
                    Kirim ulang email verifikasi
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Loading...</span>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isSignUp ? 'Daftar Akun' : 'Masuk'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setEmailError('');
                setEmailWarning('');
                setVerificationSent(false);
              }}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors duration-200"
            >
              {isSignUp ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
            </button>
          </div>

          {isSignUp && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-start gap-2 text-xs text-blue-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Keamanan Akun</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-600">
                    <li>Email akan diverifikasi sebelum dapat masuk</li>
                    <li>Gunakan email yang valid dan aktif</li>
                    <li>Password minimal 6 karakter</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Aplikasi keuangan pribadi yang aman dan mudah digunakan
        </p>
      </div>
    </div>
  );
}
