import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useWorkshop } from '../../context/WorkshopContext';
import { ServiceOrder } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { playNotificationChime } from '../../utils/audioChime';
import { VisitorQRScannerModal } from '../modals/VisitorQRScannerModal';
import { 
  Search, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  CalendarClock, 
  Phone, 
  Printer, 
  Tv, 
  ShieldCheck, 
  RotateCcw, 
  FileText, 
  Sparkles, 
  Star, 
  HelpCircle, 
  QrCode, 
  Camera, 
  Share2, 
  LogOut, 
  Lock,
  ChevronRight,
  ExternalLink,
  Volume2
} from 'lucide-react';

interface VisitorPortalProps {
  onSelectService?: (service: ServiceOrder) => void;
}

export const VisitorPortal: React.FC<VisitorPortalProps> = ({ onSelectService }) => {
  const { services, logout } = useWorkshop();

  // Active view inside visitor portal: 'tracker' (Default search/status) vs 'lounge-tv' (TV queue display) vs 'history' (Service History)
  const [visitorTab, setVisitorTab] = useState<'tracker' | 'lounge-tv' | 'history'>('tracker');

  // License plate search
  const [searchPlate, setSearchPlate] = useState<string>(() => {
    try {
      return sessionStorage.getItem('motorad_search_plate') || '';
    } catch {
      return '';
    }
  });

  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [qrSlipDataUrl, setQrSlipDataUrl] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [syncSeconds, setSyncSeconds] = useState<number>(3);
  const [copiedFeedback, setCopiedFeedback] = useState<boolean>(false);

  // Review & Rating State
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  // Live timer for data sync
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncSeconds(prev => (prev <= 1 ? 5 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Normalize license plate
  const normalizePlate = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  // Find order by search plate or selected ID
  const matchedService = React.useMemo(() => {
    if (selectedOrderId) {
      const found = services.find(s => s.id === selectedOrderId);
      if (found) return found;
    }
    if (searchPlate.trim()) {
      const cleaned = normalizePlate(searchPlate);
      const found = services.find(s => normalizePlate(s.plateNumber).includes(cleaned));
      if (found) return found;
    }
    // Default to first active order or first finished
    return services.find(s => s.status === 'Pengerjaan' || s.status === 'Diagnosa') || services[0] || null;
  }, [services, searchPlate, selectedOrderId]);

  // Generate QR Code for digital receipt slip
  useEffect(() => {
    if (matchedService) {
      QRCode.toDataURL(`https://motorad.id/track/${matchedService.orderNumber}`, {
        margin: 1,
        width: 140,
        color: { dark: '#0284c7', light: '#ffffff' }
      })
        .then(url => setQrSlipDataUrl(url))
        .catch(() => {});
    }
  }, [matchedService]);

  // Handle thermal print receipt
  const handlePrintReceipt = () => {
    if (!matchedService) return;
    document.body.classList.add('printing-receipt');
    const cleanup = () => {
      document.body.classList.remove('printing-receipt');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 2500);
  };

  // Status step progression calculation
  const getStepProgress = (status: ServiceOrder['status']) => {
    switch (status) {
      case 'Antre':
        return { step: 1, percent: 20, label: 'Menunggu Masuk Pit', color: 'text-amber-500 bg-amber-500' };
      case 'Diagnosa':
        return { step: 2, percent: 45, label: 'Inspeksi & Diagnosa Awal', color: 'text-sky-500 bg-sky-500' };
      case 'Pengerjaan':
        return { step: 3, percent: 70, label: 'Sedang Dikerjakan Mekanik', color: 'text-blue-600 bg-blue-600' };
      case 'Menunggu Sparepart':
        return { step: 3, percent: 65, label: 'Menunggu Suku Cadang', color: 'text-orange-500 bg-orange-500' };
      case 'Selesai':
        return { step: 4, percent: 100, label: 'Pengerjaan Selesai • Menuju Kasir', color: 'text-emerald-500 bg-emerald-500' };
      case 'Diambil':
        return { step: 5, percent: 100, label: 'Unit Telah Diambil Pelanggan', color: 'text-emerald-600 bg-emerald-600' };
      default:
        return { step: 1, percent: 15, label: 'Terdaftar di Sistem', color: 'text-slate-500 bg-slate-500' };
    }
  };

  const progress = matchedService ? getStepProgress(matchedService.status) : null;

  return (
    <div className="space-y-6">
      
      {/* 1. VISITOR HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-200/90 dark:border-sky-500/25 bg-white/90 dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm backdrop-blur-xl transition-colors">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-400/40">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Portal Resmi Pelanggan MotoRAD</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                <RotateCcw className="h-3 w-3 text-sky-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Update Real-time {syncSeconds}s lalu</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Pelacakan Servis Motor Anda</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-emerald-600 dark:from-sky-400 dark:to-emerald-400 font-mono text-xl sm:text-2xl">
                MotoRAD
              </span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Cek progres pengerjaan motor Anda secara transparan. Lihat estimasi waktu selesai, daftar suku cadang yang digunakan, garansi resmi 7 hari, dan nota struk digital.
            </p>
          </div>

          {/* Visitor Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start lg:self-auto">
            <button
              onClick={() => setVisitorTab('tracker')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                visitorTab === 'tracker'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-200 dark:border-sky-500/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Search className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>Lacak Progres Motor</span>
            </button>

            <button
              onClick={() => setVisitorTab('lounge-tv')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                visitorTab === 'lounge-tv'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200 dark:border-emerald-500/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Tv className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Layar TV Antrean</span>
            </button>

            <button
              onClick={() => setVisitorTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                visitorTab === 'history'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm border border-indigo-200 dark:border-indigo-500/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Riwayat Servis Bengkel</span>
            </button>

            <button
              onClick={() => setShowQRScanner(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-xs transition-all cursor-pointer"
              title="Pindai stiker QR pada nota servis fisik Anda"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Scan QR Nota</span>
            </button>
          </div>
        </div>

        {/* Search Bar on Portal */}
        {visitorTab === 'tracker' && (
          <div className="mt-5 pt-4 border-t border-sky-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" />
              <input
                type="text"
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                placeholder="Ketik plat nomor motor Anda (contoh: B 4821 KJF, D 2026 RAD)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sky-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs sm:text-sm font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all uppercase"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Pilihan Plat Cepat:</span>
              {services.slice(0, 3).map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSearchPlate(s.plateNumber);
                    setSelectedOrderId(s.id);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                    matchedService?.id === s.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                  }`}
                >
                  {s.plateNumber}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. TRACKER CONTENT VIEW */}
      {visitorTab === 'tracker' && matchedService && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Live Status Card & Workflow Progress (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Status Card Banner */}
            <div className="rounded-3xl border border-sky-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-widest">
                      {matchedService.plateNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                      Bay #{matchedService.bayNumber}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                    {matchedService.motorModel} • {matchedService.customerName}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-mono text-slate-400 block">No. Tiket Servis:</span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                    {matchedService.orderNumber}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Masuk: {matchedService.createdAt}
                  </div>
                </div>
              </div>

              {/* Progress Steps Visualizer */}
              <div className="py-6">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                    <Sparkles className="h-4 w-4" />
                    <span>Status Saat Ini: <strong>{progress?.label}</strong></span>
                  </span>
                  <span className="font-mono font-extrabold text-sky-600 dark:text-sky-400">
                    {progress?.percent}% Selesai
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 via-blue-600 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-xs"
                    style={{ width: `${progress?.percent || 20}%` }}
                  />
                </div>

                {/* Milestones */}
                <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                  <div className={`p-2 rounded-xl text-[11px] ${progress?.step && progress.step >= 1 ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800' : 'text-slate-400'}`}>
                    1. Antre Masuk
                  </div>
                  <div className={`p-2 rounded-xl text-[11px] ${progress?.step && progress.step >= 2 ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800' : 'text-slate-400'}`}>
                    2. Diagnosa Awal
                  </div>
                  <div className={`p-2 rounded-xl text-[11px] ${progress?.step && progress.step >= 3 ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800' : 'text-slate-400'}`}>
                    3. Pengerjaan Pit
                  </div>
                  <div className={`p-2 rounded-xl text-[11px] ${progress?.step && progress.step >= 4 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800' : 'text-slate-400'}`}>
                    4. Siap Ambil / Kasir
                  </div>
                </div>
              </div>

              {/* Estimated Time & Mechanic in Charge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-sky-100 dark:border-slate-800">
                <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Estimasi Pengerjaan:</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                      ~{matchedService.estimatedMinutes} Menit
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Mekanik yang Menangani:</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate block">
                      {matchedService.mechanicName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Keluhan Pelanggan */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Catatan Keluhan Kendaraan:
                </span>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  "{matchedService.complaints}"
                </p>
              </div>

            </div>

            {/* 8-Point Physical Inspection Checklist Overview */}
            <div className="rounded-3xl border border-sky-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Hasil Pemeriksaan Fisik 8-Titik Standar MotoRAD</span>
                </span>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Standar Uji Aman
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {[
                  { label: 'Oli Mesin', ok: matchedService.checklist.oliMesin },
                  { label: 'Busi Pengapian', ok: matchedService.checklist.busiPengapian },
                  { label: 'Sistem Rem', ok: matchedService.checklist.sistemRem },
                  { label: 'CVT / Rantai', ok: matchedService.checklist.cvtRantai },
                  { label: 'Filter Udara', ok: matchedService.checklist.filterUdara },
                  { label: 'Aki & Kelistrikan', ok: matchedService.checklist.akiKelistrikan },
                  { label: 'Tekanan Ban', ok: matchedService.checklist.tekananBan },
                  { label: 'Air Radiator', ok: matchedService.checklist.radiatorCoolant }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      item.ok 
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-semibold' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`text-xs font-bold ${item.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {item.ok ? '✓ OK' : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review & Feedback Section */}
            <div className="rounded-3xl border border-sky-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Berikan Penilaian & Ulasan Servis Anda
                </h3>
              </div>

              {reviewSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Terima kasih atas ulasan Anda!</span>
                  </div>
                  <p>Penilaian bintang {ratingScore} dari Anda sangat berharga bagi peningkatan mutu layanan mekanik kami.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-600 dark:text-slate-300 mr-2 font-semibold">Tingkat Kepuasan:</span>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingScore(star)}
                        className="p-1 text-lg transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                      >
                        <Star className={`h-6 w-6 ${star <= ratingScore ? 'text-amber-500 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-amber-600 ml-2">{ratingScore}.0 / 5.0</span>
                  </div>

                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tuliskan pengalaman Anda mengenai kecepatan dan ketelitian servis MotoRAD..."
                    rows={2}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setReviewSubmitted(true)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      Kirim Ulasan Pelanggan
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT: Digital Receipt & Financial Transparency (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Digital Receipt Card */}
            <div className="rounded-3xl border border-sky-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-sky-600" />
                  <span>Rincian Biaya & Nota Digital</span>
                </span>
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak Nota</span>
                </button>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Jasa Servis ({matchedService.serviceCategory})</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatRupiah(matchedService.laborCost)}
                  </span>
                </div>

                {matchedService.partsUsed.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Suku Cadang Digunakan:
                    </span>
                    {matchedService.partsUsed.map((part, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="truncate max-w-[200px]">{part.quantity}x {part.name}</span>
                        <span className="font-mono font-semibold">{formatRupiah(part.price * part.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">Total Biaya Servis:</span>
                  <span className="font-mono text-xl font-extrabold text-sky-600 dark:text-sky-400">
                    {formatRupiah(matchedService.totalCost)}
                  </span>
                </div>
              </div>

              {/* QR Code for Tracking */}
              {qrSlipDataUrl && (
                <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <img src={qrSlipDataUrl} alt="QR Code Nota" className="w-28 h-28 mx-auto rounded-xl shadow-2xs mb-2 border border-sky-200 dark:border-slate-700" />
                  <span className="text-[11px] font-mono text-slate-500 block">
                    Stiker QR Nota: {matchedService.orderNumber}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Simpan atau scan QR ini untuk melacak status servis kapan pun
                  </span>
                </div>
              )}

              {/* Warranty Card */}
              <div className="mt-4 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 text-[11px] text-sky-800 dark:text-sky-300 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Garansi Servis Resmi MotoRAD</strong>
                  <span>Garansi jasa & part berlaku selama 7 hari atau 500 KM sejak unit diserahterimakan.</span>
                </div>
              </div>
            </div>

            {/* Workshop Assistance & Location */}
            <div className="rounded-3xl border border-sky-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-sm backdrop-blur-xl space-y-3 text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-sky-600" />
                <span>Bantuan & Informasi Bengkel</span>
              </span>

              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Jam Buka Pit:</span>
                  <strong className="text-slate-900 dark:text-white">Senin - Minggu (08:00 - 17:30)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hotline Ruang Tunggu:</span>
                  <strong className="text-sky-600 dark:text-sky-400">0812-8899-0011</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ruang Tunggu (Lounge):</span>
                  <strong className="text-emerald-600">AC Dingin, Free Wi-Fi & Kopi</strong>
                </div>
              </div>

              <a
                href="https://wa.me/6281288990011"
                target="_blank"
                rel="noreferrer"
                className="w-full mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 text-center flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Hubungi CS / Mekanik via WhatsApp</span>
              </a>
            </div>

          </div>

        </div>
      )}

      {/* 3. LOUNGE TV VIEW */}
      {visitorTab === 'lounge-tv' && (
        <div className="rounded-3xl border border-sky-200 dark:border-slate-800 bg-slate-950 text-white p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.5)]">
                <Tv className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                  <span>MONITOR ANTREAN PIT RUANG TUNGGU</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  Sistem Pemanggilan Digital MotoRAD • Pit Bay 1 - 4
                </span>
              </div>
            </div>

            <button
              onClick={() => setVisitorTab('tracker')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all cursor-pointer"
            >
              ← Kembali ke Pelacak
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(bayNum => {
              const bayOrder = services.find(s => s.bayNumber === bayNum && (s.status === 'Pengerjaan' || s.status === 'Diagnosa'));
              return (
                <div key={bayNum} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-sky-400">PIT BAY #{bayNum}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bayOrder ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-800 text-slate-400'}`}>
                      {bayOrder ? bayOrder.status : 'KOSONG'}
                    </span>
                  </div>
                  {bayOrder ? (
                    <div>
                      <span className="font-mono text-2xl font-black tracking-widest text-white block">
                        {bayOrder.plateNumber}
                      </span>
                      <span className="text-xs text-slate-400 block mt-0.5">{bayOrder.motorModel}</span>
                      <span className="text-[11px] text-sky-400 mt-2 block">Mekanik: {bayOrder.mechanicName}</span>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-500">Pit siap digunakan</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SERVICE HISTORY VIEW */}
      {visitorTab === 'history' && (
        <div className="rounded-3xl border border-sky-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daftar Servis yang Sedang & Telah Dikerjakan
              </h3>
              <span className="text-xs text-slate-500">
                Transparansi status seluruh unit kendaraan di bengkel MotoRAD hari ini.
              </span>
            </div>
            <button
              onClick={() => setVisitorTab('tracker')}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              ← Kembali ke Pencarian
            </button>
          </div>

          <div className="space-y-2">
            {services.map(order => (
              <div
                key={order.id}
                onClick={() => {
                  setSearchPlate(order.plateNumber);
                  setSelectedOrderId(order.id);
                  setVisitorTab('tracker');
                }}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 bg-white dark:bg-slate-850 flex items-center justify-between cursor-pointer transition-all hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                      {order.plateNumber}
                    </span>
                    <span className="text-xs text-slate-500">({order.motorModel})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {order.customerName} • Mekanik: {order.mechanicName} • Bay #{order.bayNumber}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Selesai' || order.status === 'Diambil'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  }`}>
                    {order.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <VisitorQRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={(scannedPlate) => {
          setSearchPlate(scannedPlate);
          setShowQRScanner(false);
        }}
      />

    </div>
  );
};
