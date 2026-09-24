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
  Search,
  QrCode,
  Camera,
  Tv,
  Clock,
  Check,
  FileText,
  Shield,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { VisitorQRScannerModal } from '../modals/VisitorQRScannerModal';
import { ServiceOrder } from '../../types';

export const LoginScreen: React.FC = () => {
  const { login, loginAsGuest, employees, services } = useWorkshop();

  // Mode: 'visitor' (Portal Pengunjung/Pelanggan) vs 'admin' (Portal Admin & Staf Bengkel)
  const [activePortal, setActivePortal] = useState<'visitor' | 'admin'>('visitor');

  // Visitor Form State
  const [visitorPlate, setVisitorPlate] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Admin Form State
  const [email, setEmail] = useState('nurularif629@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Active services for quick sample selection
  const activeServiceSamples = services.slice(0, 4);

  // Handle Admin Login
  const handleAdminSubmit = (e: React.FormEvent) => {
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

  // Handle Quick Login for staff roles
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

  // Handle Visitor Login
  const handleVisitorSubmit = (e?: React.FormEvent, plateToUse?: string) => {
    if (e) e.preventDefault();
    const targetPlate = plateToUse !== undefined ? plateToUse : visitorPlate;
    
    if (targetPlate.trim()) {
      try {
        sessionStorage.setItem('motorad_search_plate', targetPlate.trim().toUpperCase());
      } catch {}
    }
    loginAsGuest();
  };

  // Handle QR Scan completion
  const handleScannedService = (service: ServiceOrder) => {
    try {
      sessionStorage.setItem('motorad_search_plate', service.plateNumber);
    } catch {}
    setIsScannerOpen(false);
    loginAsGuest();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-blue-100 dark:from-slate-950 dark:via-[#0c1427] dark:to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors duration-200">
      
      {/* Top Floating Bar with Theme Toggle */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeToggle showLabel />
      </div>

      {/* Decorative Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-500/10 dark:bg-sky-500/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl relative z-10 my-4">
        
        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-600 text-white shadow-[0_0_25px_rgba(14,165,233,0.45)] border-2 border-white/20 mb-3 ring-4 ring-sky-500/20">
            <Wrench className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <span>MotoRAD</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 font-mono text-xl sm:text-2xl">
              ENGINE
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
            Sistem Manajemen Terpadu Bengkel & Garasi Motor Berbasis RAD
          </p>
        </div>

        {/* ========================================================================= */}
        {/* MAIN DUAL-PORTAL SEGMENTED SWITCHER (PENGUNJUNG VS ADMIN DI PISAH)       */}
        {/* ========================================================================= */}
        <div className="flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 mb-5 shadow-sm backdrop-blur-md">
          {/* Tab 1: Portal Pengunjung */}
          <button
            type="button"
            onClick={() => setActivePortal('visitor')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activePortal === 'visitor'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-1 ring-emerald-400/40'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="h-4 w-4 shrink-0" />
            <span>Portal Pengunjung</span>
            <span className="hidden xs:inline text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-white/20">
              Pelanggan
            </span>
          </button>

          {/* Tab 2: Portal Admin */}
          <button
            type="button"
            onClick={() => setActivePortal('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activePortal === 'admin'
                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md ring-1 ring-sky-400/40'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Portal Admin & Staf</span>
            <span className="hidden xs:inline text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-white/20">
              Karyawan
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: PORTAL PENGUNJUNG / PELANGGAN                                     */}
        {/* ========================================================================= */}
        {activePortal === 'visitor' && (
          <div className="rounded-3xl border-2 border-emerald-300/80 dark:border-emerald-500/30 bg-white/95 dark:bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Portal Pengunjung */}
            <div className="flex items-start justify-between mb-5 border-b border-emerald-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-400/40 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Pelanggan Bengkel</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Tanpa Perlu Password</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Lacak Status Servis Motor Anda
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pantau tahapan pengerjaan di Pit 1-4, estimasi selesai, dan nota digital secara real-time.
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm">
                <Search className="h-5 w-5" />
              </div>
            </div>

            {/* Input Plat Nomor Kendaraan Pelanggan */}
            <form onSubmit={handleVisitorSubmit} className="space-y-4">
              <div>
                <label htmlFor="visitorPlateInput" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Masukkan Nomor Plat Motor Anda:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Bisa dikosongkan untuk lihat semua</span>
                </label>

                {/* Indonesian Motor Plate Form Input Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <div className="px-2 py-0.5 rounded bg-slate-900 dark:bg-slate-950 border border-slate-700 text-[10px] font-mono font-bold text-white tracking-widest shadow-xs">
                      RI
                    </div>
                  </div>
                  <input
                    id="visitorPlateInput"
                    type="text"
                    value={visitorPlate}
                    onChange={(e) => setVisitorPlate(e.target.value.toUpperCase())}
                    placeholder="CONTOH: B 4192 EAB"
                    className="w-full pl-16 pr-4 py-3 rounded-2xl border-2 border-emerald-300 dark:border-emerald-500/40 bg-slate-50/80 dark:bg-slate-800/80 text-base sm:text-lg font-mono font-bold tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 shadow-inner uppercase transition-all"
                  />
                </div>
              </div>

              {/* Main Submit & QR Scanner Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Lacak Motor Sekarang</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* QR Scanner modal trigger button */}
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-600/50 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold py-3 px-4 text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Pindai Stiker QR Nota</span>
                </button>
              </div>
            </form>

            {/* Quick Sample Clicker: Motor yang sedang diservis hari ini */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Uji Coba Cepat (Motor Sedang Servis):</span>
                </span>
                <span className="text-[10px] text-slate-400">Klik untuk langsung lacak</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activeServiceSamples.map(sample => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleVisitorSubmit(undefined, sample.plateNumber)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-left transition-all cursor-pointer group"
                  >
                    <div className="font-mono font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                      {sample.plateNumber}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {sample.motorModel.split(' ')[0]} {sample.motorModel.split(' ')[1] || ''}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        {sample.status}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        Pit {sample.bayNumber}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3 Step Visual Guide */}
            <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-3.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block mb-2">
                Alur Transparan Pelacakan Motor Pengunjung:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="block font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">1. Plat / QR</span>
                  <span>Ketik nomor plat atau scan stiker nota</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="block font-bold text-sky-600 dark:text-sky-400 mb-0.5">2. Pantau Pit</span>
                  <span>Lihat live 6-tahap pengerjaan montir</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="block font-bold text-purple-600 dark:text-purple-400 mb-0.5">3. Ambil di Kasir</span>
                  <span>Unduh nota & siap diambil saat selesai</span>
                </div>
              </div>
            </div>

            {/* Switch to Admin Portal Button */}
            <div className="mt-5 pt-3 text-center border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActivePortal('admin')}
                className="text-xs font-semibold text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Anda Karyawan atau Administrator Bengkel?</span>
                <strong className="text-sky-600 dark:text-sky-400 underline">Masuk ke Portal Admin & Staf →</strong>
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: PORTAL ADMIN & STAF BENGKEL                                       */}
        {/* ========================================================================= */}
        {activePortal === 'admin' && (
          <div className="rounded-3xl border-2 border-sky-300/80 dark:border-sky-500/30 bg-white/95 dark:bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Portal Admin */}
            <div className="flex items-start justify-between mb-5 border-b border-sky-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-1 rounded-full bg-sky-500/15 dark:bg-sky-500/25 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-800 dark:text-sky-300 border border-sky-400/40 uppercase tracking-wider">
                    <Shield className="h-3 w-3 text-sky-600" />
                    <span>Akses Khusus Internal</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Terotentikasi & RBAC</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Login Admin & Karyawan Bengkel
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Masuk ke pusat kontrol manajemen servis, suku cadang, dan finansial.
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm">
                <Lock className="h-5 w-5" />
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 rounded-xl bg-rose-500/15 border border-rose-500/40 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Email atau Akun Karyawan</span>
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
                  Petunjuk Demo: Gunakan <code className="text-sky-600 dark:text-sky-300 font-mono font-bold">admin123</code> atau <code className="text-sky-600 dark:text-sky-300 font-mono font-bold">bengkel123</code>.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold py-3 text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <span>Memverifikasi Hak Akses...</span>
                ) : (
                  <>
                    <span>Masuk ke Dashboard Admin & Staf</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Selection (Grouped by Role) */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Pilih Cepat Akun Demo (1-Klik):</span>
                </span>
                <span className="text-[10px] text-slate-400">Klik langsung untuk login</span>
              </div>

              <div className="space-y-2">
                {/* 1. Super Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('nurularif629@gmail.com', 'admin123')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-amber-300 dark:border-amber-400/40 bg-amber-50/80 dark:bg-amber-500/10 hover:bg-amber-100/80 dark:hover:bg-amber-500/20 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white font-bold text-xs shadow-xs">
                      <Crown className="h-4 w-4 fill-amber-200" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Nurul Arif</span>
                        <span className="rounded bg-amber-200 dark:bg-amber-400/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-400/30">
                          Super Admin
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-900 dark:text-amber-200/80">
                        Wewenang Penuh: Kelola Karyawan, Finansial & Inventaris
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 group-hover:translate-x-0.5 transition-transform">
                    Login Admin →
                  </span>
                </button>

                {/* 2. Kepala Bengkel */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('agus.santoso@motobengkel.id', 'bengkel123')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-600/30 text-sky-700 dark:text-sky-300 font-bold text-xs border border-sky-300 dark:border-sky-500/30">
                      A
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Agus Santoso</span>
                        <span className="rounded bg-sky-100 dark:bg-sky-500/20 px-1.5 py-0.2 text-[9px] font-bold text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-400/20">
                          Kepala Bengkel
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Monitoring Pit, Approval Suku Cadang & Penugasan
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-transform">
                    Login Staf →
                  </span>
                </button>

                {/* 3. Kasir & Front Desk */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('rina.safitri@motobengkel.id', 'bengkel123')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-600/30 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-300 dark:border-purple-500/30">
                      R
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Rina Safitri</span>
                        <span className="rounded bg-purple-100 dark:bg-purple-500/20 px-1.5 py-0.2 text-[9px] font-bold text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-400/20">
                          Kasir & Front Desk
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Penerimaan Servis Baru & Pembayaran Nota Kasir
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-transform">
                    Login Kasir →
                  </span>
                </button>
              </div>
            </div>

            {/* Switch to Visitor Portal Button */}
            <div className="mt-5 pt-3 text-center border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActivePortal('visitor')}
                className="text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Bukan staf bengkel? Ingin lacak motor?</span>
                <strong className="text-emerald-600 dark:text-emerald-400 underline">Buka Portal Pengunjung →</strong>
              </button>
            </div>

          </div>
        )}

        {/* Global Footer info */}
        <div className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
          <span>MotoRAD Workshop Engine © 2026</span>
          <span>•</span>
          <span>Metodologi RAD</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">2 Portal Terpisah</span>
        </div>

      </div>

      {/* Direct QR Scanner Modal for Visitors */}
      <VisitorQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectService={handleScannedService}
      />

    </div>
  );
};
