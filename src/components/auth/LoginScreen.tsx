import React, { useState } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Crown, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Users,
  ShieldAlert,
  Boxes,
  Navigation
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ThemeToggle } from '../common/ThemeToggle';

export const LoginScreen: React.FC = () => {
  const { login, employees, setMeAsSuperAdmin } = useWorkshop();

  const [email, setEmail] = useState('nurularif629@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setErrorMessage(res.message);
      }
      setIsLoading(false);
    }, 350);
  };

  const handleQuickLogin = (userEmail: string, defaultPass = 'admin123') => {
    setEmail(userEmail);
    setPassword(defaultPass);
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      login(userEmail, defaultPass);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-blue-100 dark:from-slate-900 dark:via-sky-950 dark:to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors duration-200">
      
      {/* Top Floating Bar with Theme Toggle */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggle showLabel />
      </div>

      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md sm:max-w-lg relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-[0_0_30px_rgba(14,165,233,0.5)] border-2 border-white/20 mb-3 ring-4 ring-sky-500/20">
            <Wrench className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <span>MotoRAD</span>
            <span className="text-sky-600 dark:text-sky-400 font-mono text-xl sm:text-2xl">ENGINE</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto">
            Sistem Manajemen Terpadu Operasional Bengkel & Garasi Motor Berbasis Metodologi RAD
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl border border-sky-200/90 dark:border-sky-400/25 bg-white/90 dark:bg-slate-900/85 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-sky-500/10 dark:ring-white/10 transition-colors">
          
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span>Masuk ke Akun Anda</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pilih akun Admin atau Karyawan untuk menguji pemisahan hak akses
              </p>
            </div>
            <span className="rounded-full bg-sky-500/15 border border-sky-400/30 px-2.5 py-1 text-[10px] font-mono font-bold text-sky-700 dark:text-sky-300">
              v2.4 Live
            </span>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-rose-500/15 border border-rose-500/40 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>Email atau Username Akun</span>
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nurularif629@gmail.com"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/90 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400/20 font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>Kata Sandi (Password)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/90 px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400/20 font-mono transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                Petunjuk: Akun demo dapat menggunakan kata sandi apa saja (misal: <code className="text-sky-600 dark:text-sky-300 font-mono font-bold">admin123</code> atau <code className="text-sky-600 dark:text-sky-300 font-mono font-bold">bengkel123</code>).
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-2.5 text-xs shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <span>Memverifikasi Hak Akses...</span>
              ) : (
                <>
                  <span>Masuk ke Sistem Bengkel</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Account Selector (Demo Credentials) */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Pilih Akun Demo 1-Klik:</span>
              </span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400">Klik langsung untuk login</span>
            </div>

            <div className="space-y-2">
              {/* Option 1: Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('nurularif629@gmail.com', 'admin123')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-amber-300 dark:border-amber-400/40 bg-amber-50/80 dark:bg-amber-500/10 hover:bg-amber-100/80 dark:hover:bg-amber-500/20 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white font-bold text-xs shadow-xs">
                    <Crown className="h-4 w-4 fill-amber-200" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Nurul Arif</span>
                      <span className="rounded bg-amber-200 dark:bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-400/30">
                        Super Admin
                      </span>
                    </div>
                    <div className="text-[10px] text-amber-900 dark:text-amber-200/80">
                      Hak Akses Penuh Termasuk Manajemen Karyawan
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 group-hover:translate-x-0.5 transition-transform">
                  Login Admin →
                </span>
              </button>

              {/* Option 2: Employee - Kepala Bengkel */}
              <button
                type="button"
                onClick={() => handleQuickLogin('agus.santoso@motobengkel.id', 'bengkel123')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-600/30 text-sky-700 dark:text-sky-300 font-bold text-xs border border-sky-300 dark:border-sky-500/30">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Agus Santoso</span>
                      <span className="rounded bg-sky-100 dark:bg-sky-500/20 px-1.5 py-0.2 text-[10px] font-bold text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-400/20">
                        Karyawan
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Kepala Bengkel — Fitur Manajemen Karyawan Terkunci
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-transform">
                  Login Karyawan →
                </span>
              </button>

              {/* Option 3: Employee - Kasir & Front Desk */}
              <button
                type="button"
                onClick={() => handleQuickLogin('rina.safitri@motobengkel.id', 'bengkel123')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-500/30">
                    R
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Rina Safitri</span>
                      <span className="rounded bg-emerald-100 dark:bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-400/20">
                        Karyawan
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Kasir & Front Desk — Fitur Manajemen Karyawan Terkunci
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-transform">
                  Login Karyawan →
                </span>
              </button>
            </div>
          </div>

          {/* Info Role Differences */}
          <div className="mt-5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/40 p-3 text-[11px] text-slate-700 dark:text-slate-300">
            <div className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1 mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>Perbedaan Hak Akses Berbasis Peran:</span>
            </div>
            <ul className="space-y-0.5 list-disc list-inside text-[10.5px] text-slate-600 dark:text-slate-400">
              <li><strong className="text-amber-800 dark:text-amber-300">Akun Admin:</strong> Hak akses penuh ke seluruh sistem termasuk modul Tambah, Edit, dan Konfigurasi Karyawan (RBAC).</li>
              <li><strong className="text-sky-700 dark:text-sky-300">Akun Karyawan:</strong> Akses tiket servis, stok barang, & tracking kurir. Modul Manajemen Karyawan otomatis dilindungi & dibatasi.</li>
            </ul>
          </div>

        </div>

        {/* Footer Info */}
        <div className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400">
          MotoRAD Workshop Engine © 2026 • Prototyping Cepat Metodologi RAD
        </div>

      </div>
    </div>
  );
};
