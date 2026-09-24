import React, { useState, useMemo, useEffect } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ServiceOrder } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ChatInterface } from '../chat/ChatInterface';
import { startAdminTour, isTourCompleted } from '../../utils/interactiveTour';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  Shield, 
  Crown, 
  RotateCcw, 
  Sparkles, 
  Plus, 
  Boxes, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Wrench, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Tv, 
  Search,
  MessageSquare,
  Activity
} from 'lucide-react';

interface SuperAdminDashboardProps {
  onOpenNewService?: () => void;
  onSelectService?: (service: ServiceOrder) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onOpenNewService,
  onSelectService
}) => {
  const { 
    services, 
    inventory, 
    lowStockCount, 
    criticalParts, 
    getMonthlySummary, 
    setActiveView,
    currentEmployee,
    employees 
  } = useWorkshop();

  // Mode tab for Super Admin: 'command-center' vs 'chat-fullscreen' vs 'lounge-tv'
  const [adminTab, setAdminTab] = useState<'command-center' | 'chat-fullscreen' | 'lounge-tv'>('command-center');
  const [trendMetric, setTrendMetric] = useState<'volume' | 'revenue'>('volume');
  const [syncSeconds, setSyncSeconds] = useState<number>(3);

  // Live seconds sync indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncSeconds(prev => (prev <= 1 ? 5 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-launch driver.js interactive tour on first admin login
  useEffect(() => {
    if (!isTourCompleted()) {
      const timer = setTimeout(() => {
        startAdminTour();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Launch interactive tour manually
  const handleLaunchTour = () => {
    startAdminTour(true);
  };

  const summary = useMemo(() => getMonthlySummary(), [getMonthlySummary]);
  const activeOrders = services.filter(s => s.status === 'Pengerjaan' || s.status === 'Diagnosa');
  const queueOrders = services.filter(s => s.status === 'Antre');
  const finishedOrders = services.filter(s => s.status === 'Selesai');

  // 7-day trend data
  const dailyData = useMemo(() => {
    return [
      { day: 'Sen', totalServis: 14, revenue: 1450000 },
      { day: 'Sel', totalServis: 19, revenue: 2150000 },
      { day: 'Rab', totalServis: 16, revenue: 1850000 },
      { day: 'Kam', totalServis: 22, revenue: 2650000 },
      { day: 'Jum', totalServis: 18, revenue: 2100000 },
      { day: 'Sab', totalServis: 31, revenue: 3900000 },
      { day: 'Min', totalServis: 28, revenue: 3450000 }
    ];
  }, []);

  return (
    <div className="space-y-6">
      
      {/* 1. ADMIN HEADER & TOUR TRIGGER */}
      <div id="tour-admin-header" className="relative overflow-hidden rounded-3xl border border-sky-200/90 dark:border-sky-500/25 bg-white/90 dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm backdrop-blur-xl transition-colors">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 rounded-full bg-sky-500/15 dark:bg-sky-500/25 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300 border border-sky-400/40">
                <Shield className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>Pusat Komando Super Admin & Manajemen</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Crown className="h-3 w-3 text-amber-500" />
                <span>{currentEmployee.name} ({currentEmployee.role})</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <RotateCcw className="h-3 w-3 text-sky-500 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Sinkronisasi {syncSeconds}s lalu</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <button
                type="button"
                onClick={handleLaunchTour}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-500/15 to-blue-500/15 hover:from-sky-500/25 hover:to-blue-500/25 text-sky-700 dark:text-sky-300 border border-sky-400/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Mulai Panduan Tur Interaktif Fitur Dasbor"
              >
                <Sparkles className="h-3 w-3 text-sky-500" />
                <span>Panduan Tur Dasbor</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Dashboard Admin & Operasional</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 font-mono text-xl sm:text-2xl">
                MotoRAD
              </span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              Pusat kontrol operasional bengkel, monitoring 4 Pit Bay, stok suku cadang, performa finansial, dan obrolan real-time tim.
            </p>
          </div>

          {/* Mode Switcher Tabs for Admin */}
          <div id="tour-mode-switcher" className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start lg:self-auto">
            <button
              onClick={() => setAdminTab('command-center')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                adminTab === 'command-center'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-200 dark:border-sky-500/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>Pusat Kendali Admin</span>
            </button>

            <button
              onClick={() => setAdminTab('chat-fullscreen')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                adminTab === 'chat-fullscreen'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-200 dark:border-sky-500/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>Chat Staf Layar Penuh</span>
            </button>

            <button
              onClick={() => setAdminTab('lounge-tv')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                adminTab === 'lounge-tv'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200 dark:border-emerald-500/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Tv className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Monitor Antrean TV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CHAT FULLSCREEN VIEW */}
      {adminTab === 'chat-fullscreen' && (
        <div className="rounded-3xl border border-sky-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm backdrop-blur-xl">
          <ChatInterface variant="full" initialChannel="#general" />
        </div>
      )}

      {/* 3. LOUNGE TV VIEW */}
      {adminTab === 'lounge-tv' && (
        <div className="rounded-3xl border border-sky-200 dark:border-slate-800 bg-slate-950 text-white p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Tv className="h-7 w-7 text-sky-400" />
              <div>
                <h2 className="text-xl font-bold">Layar Monitor Antrean TV MotoRAD</h2>
                <span className="text-xs text-slate-400 font-mono">Tampilan Display Khusus Ruang Tunggu Pit Lounge</span>
              </div>
            </div>
            <button
              onClick={() => setAdminTab('command-center')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
            >
              ← Kembali ke Dasbor Admin
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(bayNum => {
              const bayOrder = services.find(s => s.bayNumber === bayNum && (s.status === 'Pengerjaan' || s.status === 'Diagnosa'));
              return (
                <div key={bayNum} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-sky-400">PIT BAY #{bayNum}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bayOrder ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400'}`}>
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

      {/* 4. MAIN COMMAND CENTER VIEW */}
      {adminTab === 'command-center' && (
        <div className="space-y-6">
          
          {/* Admin Quick Action Toolbar */}
          <div id="tour-quick-actions" className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-indigo-500/10 border border-sky-200/90 dark:border-sky-500/30">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Aksi Cepat Manajemen Bengkel
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Akses langsung pembuatan tiket pengerjaan, inventaris & koordinasi tim
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenNewService && (
                <button
                  type="button"
                  onClick={onOpenNewService}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Servis Masuk Baru</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveView('inventory')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300 transition-all cursor-pointer"
              >
                <Boxes className="h-3.5 w-3.5 text-sky-600" />
                <span>Kelola Stok</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('employees')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300 transition-all cursor-pointer"
              >
                <Users className="h-3.5 w-3.5 text-purple-600" />
                <span>Tim Karyawan</span>
              </button>

              <button
                type="button"
                onClick={handleLaunchTour}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500/15 to-blue-500/15 hover:from-sky-500/25 hover:to-blue-500/25 border border-sky-300 dark:border-sky-600 text-sky-700 dark:text-sky-300 transition-all cursor-pointer shadow-xs"
                title="Mulai Panduan Tur Dasbor Interaktif (driver.js)"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                <span>Panduan Tur</span>
              </button>
            </div>
          </div>

          {/* 4 Key Metrics Overview Cards */}
          <div id="tour-kpi-metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Metric 1: Monthly Revenue */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-sky-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Omset Bulan Ini</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                  {formatRupiah(summary.totalRevenue)}
                </span>
              </div>
              <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Laba kotor: {formatRupiah(summary.grossProfit)}</span>
              </div>
            </div>

            {/* Metric 2: Active & Queue Orders */}
            <div 
              onClick={() => setActiveView('services')}
              className="glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer group border border-sky-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sedang Dikerjakan</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                  <Wrench className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                  {activeOrders.length} <span className="text-sm font-normal text-slate-500">Unit</span>
                </span>
                <span className="text-xs text-slate-500 font-medium">({queueOrders.length} antre)</span>
              </div>
              <div className="mt-2 text-xs text-sky-700 dark:text-sky-400 font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Rata-rata 42 menit / unit</span>
              </div>
            </div>

            {/* Metric 3: Critical Low Stock */}
            <div 
              onClick={() => setActiveView('inventory')}
              className="glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer group border border-sky-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stok Kritis / Menipis</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                  lowStockCount > 0 
                    ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 animate-pulse' 
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className={`text-2xl font-extrabold font-mono tabular-nums ${
                  lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {lowStockCount} <span className="text-sm font-normal text-slate-500">Komponen</span>
                </span>
              </div>
              <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 group-hover:text-amber-800 font-semibold flex items-center justify-between">
                <span>Perlu restock segera</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>

            {/* Metric 4: Customer Satisfaction */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-sky-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kepuasan Pelanggan</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                  {summary.averageSatisfaction} <span className="text-sm text-sky-600">/ 5.0</span>
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Berdasarkan 96 ulasan servis bulan ini
              </div>
            </div>

          </div>

          {/* MAIN TWO-COLUMN WORKSHOP OPERATIONS & CHAT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: 4 Pit Bays, Queues & Analytics Charts (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Status 4 Pit Bay Servis Real-Time */}
              <div id="tour-pit-bays" className="rounded-3xl border border-sky-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Status 4 Pit Servis Aktif (Bay 1 - 4)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {activeOrders.length} Pit Terisi • {4 - activeOrders.length} Pit Siap
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[1, 2, 3, 4].map((bayNum) => {
                    const bayOrder = services.find(s => s.bayNumber === bayNum && (s.status === 'Pengerjaan' || s.status === 'Diagnosa'));

                    return (
                      <div
                        key={bayNum}
                        className={`rounded-2xl border p-4 transition-all ${
                          bayOrder
                            ? 'border-sky-300 dark:border-sky-600/50 bg-sky-50/40 dark:bg-sky-950/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                            PIT BAY #{bayNum}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            bayOrder
                              ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-400/40'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {bayOrder ? bayOrder.status : 'SIAP PAKAI'}
                          </span>
                        </div>

                        {bayOrder ? (
                          <div className="space-y-2 text-xs">
                            <div className="flex items-baseline justify-between">
                              <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white tracking-wider">
                                {bayOrder.plateNumber}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                ~{bayOrder.estimatedMinutes} mnt
                              </span>
                            </div>
                            <div className="font-medium text-slate-700 dark:text-slate-300 truncate">
                              {bayOrder.motorModel}
                            </div>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                              <span>Mekanik: <strong className="text-slate-700 dark:text-slate-300">{bayOrder.mechanicName.split(' ')[0]}</strong></span>
                              {onSelectService && (
                                <button
                                  type="button"
                                  onClick={() => onSelectService(bayOrder)}
                                  className="text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                                >
                                  Detail →
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 text-center text-xs text-slate-400">
                            Pit kosong siap digunakan
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Antrean Menunggu Pit vs Unit Selesai */}
              <div id="tour-queues" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Antrean */}
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-amber-200/60 dark:border-amber-900/40 pb-2">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span>Antrean Menunggu Pit</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                      {queueOrders.length} Motor
                    </span>
                  </div>

                  <div className="space-y-2">
                    {queueOrders.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">Tidak ada antrean tertunda</p>
                    ) : (
                      queueOrders.slice(0, 3).map((q) => (
                        <div key={q.id} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-950 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-slate-900 dark:text-white block">{q.plateNumber}</span>
                            <span className="text-[10px] text-slate-500">{q.motorModel}</span>
                          </div>
                          <span className="text-[10px] text-amber-600 font-mono">Bay #{q.bayNumber}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Selesai / Siap Ambil */}
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-emerald-200/60 dark:border-emerald-900/40 pb-2">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Selesai Siap Kasir</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {finishedOrders.length} Motor
                    </span>
                  </div>

                  <div className="space-y-2">
                    {finishedOrders.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">Semua motor selesai telah diserahkan</p>
                    ) : (
                      finishedOrders.slice(0, 3).map((f) => (
                        <div key={f.id} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-slate-900 dark:text-white block">{f.plateNumber}</span>
                            <span className="text-[10px] text-slate-500">{f.motorModel}</span>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-mono font-bold">{formatRupiah(f.totalCost)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Trend Performa Servis & Pendapatan Harian */}
              <div className="rounded-3xl border border-sky-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-sm backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-sky-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-sky-600" />
                    <span>Tren Performa 7 Hari Terakhir</span>
                  </span>

                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setTrendMetric('volume')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        trendMetric === 'volume' ? 'bg-white dark:bg-slate-700 text-sky-600 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      Total Unit
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrendMetric('revenue')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        trendMetric === 'revenue' ? 'bg-white dark:bg-slate-700 text-sky-600 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      Pendapatan
                    </button>
                  </div>
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAdminServis" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey={trendMetric === 'revenue' ? 'revenue' : 'totalServis'} 
                        stroke="#0284c7" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorAdminServis)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Real-Time ChatInterface, Stock Alert & Team Roster (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* 1. EMBEDDED REAL-TIME CHAT INTERFACE */}
              <div id="tour-chat-interface" className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-sky-600" />
                    <span>Komunikasi Karyawan Real-Time</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdminTab('chat-fullscreen')}
                    className="text-[11px] text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                  >
                    Buka Layar Penuh →
                  </button>
                </div>

                <ChatInterface variant="embedded" />
              </div>

              {/* 2. Critical Stock Alert Panel */}
              <div className="rounded-3xl border border-amber-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-amber-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Peringatan Stok Suku Cadang Kritis</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveView('inventory')}
                    className="text-[11px] text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    Lihat Semua ({lowStockCount})
                  </button>
                </div>

                <div className="space-y-2">
                  {criticalParts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">Semua stok suku cadang dalam kondisi aman.</p>
                  ) : (
                    criticalParts.slice(0, 3).map(part => (
                      <div key={part.id} className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{part.name}</span>
                          <span className="text-[10px] text-slate-500">Rak: {part.location}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-amber-600">{part.stock} {part.unit}</span>
                          <span className="text-[10px] text-slate-400 block">Batas: {part.minStock}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 3. Team Roster Overview */}
              <div className="rounded-3xl border border-sky-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-sky-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>Roster Teknisi & Staf Bertugas</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveView('employees')}
                    className="text-[11px] text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                  >
                    Kelola Tim ({employees.length})
                  </button>
                </div>

                <div className="space-y-2">
                  {employees.slice(0, 4).map(emp => (
                    <div key={emp.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{emp.name}</span>
                        <span className="text-[10px] text-slate-500">{emp.role}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        emp.status === 'Bertugas' 
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' 
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {emp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
