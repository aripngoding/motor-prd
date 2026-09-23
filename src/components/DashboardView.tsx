import React, { useState, useMemo } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { 
  DollarSign, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Boxes, 
  Activity, 
  CalendarClock, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Plus,
  PieChart as PieIcon,
  BarChart3,
  Flame,
  Layers,
  ShoppingBag,
  Navigation
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { formatRupiah } from '../utils/formatters';
import { ServiceOrder } from '../types';

interface DashboardViewProps {
  onOpenNewService: () => void;
  onSelectService: (service: ServiceOrder) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onOpenNewService, 
  onSelectService 
}) => {
  const { 
    services, 
    inventory, 
    lowStockCount, 
    criticalParts, 
    getMonthlySummary, 
    getBayStatus, 
    setActiveView 
  } = useWorkshop();

  // State for Daily Trend Chart
  const [trendMetric, setTrendMetric] = useState<'volume' | 'breakdown' | 'revenue'>('volume');

  // State for Category Chart View Mode
  const [categoryViewType, setCategoryViewType] = useState<'bar' | 'donut'>('bar');

  const summary = getMonthlySummary();
  const bays = getBayStatus();
  const activeOrders = services.filter(s => s.status === 'Pengerjaan' || s.status === 'Diagnosa');
  const queueOrders = services.filter(s => s.status === 'Antre');

  // 1. Data Tren Servis Harian (7 Hari Terakhir)
  const dailyData = useMemo(() => [
    { day: 'Sen', fullDate: '17 Sep 2026', totalServis: 14, servisRutin: 9, perbaikanBerat: 5, revenue: 3200000 },
    { day: 'Sel', fullDate: '18 Sep 2026', totalServis: 18, servisRutin: 12, perbaikanBerat: 6, revenue: 4150000 },
    { day: 'Rab', fullDate: '19 Sep 2026', totalServis: 16, servisRutin: 10, perbaikanBerat: 6, revenue: 3800000 },
    { day: 'Kam', fullDate: '20 Sep 2026', totalServis: 22, servisRutin: 15, perbaikanBerat: 7, revenue: 5600000 },
    { day: 'Jum', fullDate: '21 Sep 2026', totalServis: 19, servisRutin: 13, perbaikanBerat: 6, revenue: 4900000 },
    { day: 'Sab', fullDate: '22 Sep 2026', totalServis: 28, servisRutin: 18, perbaikanBerat: 10, revenue: 7400000 },
    { day: 'Min', fullDate: '23 Sep 2026 (Hari Ini)', totalServis: 24, servisRutin: 16, perbaikanBerat: 8, revenue: 6150000 }
  ], []);

  const totalWeeklyServices = dailyData.reduce((acc, d) => acc + d.totalServis, 0);
  const avgDailyServices = (totalWeeklyServices / dailyData.length).toFixed(1);
  const peakDay = dailyData.reduce((prev, curr) => (curr.totalServis > prev.totalServis ? curr : prev), dailyData[0]);

  // 2. Data Kategori Suku Cadang yang Paling Sering Digunakan
  const partCategoryData = useMemo(() => {
    // Base monthly cumulative distribution
    const baseCategoryCounts: Record<string, { count: number; totalValue: number }> = {
      'Oli & Pelumas': { count: 36, totalValue: 4850000 },
      'Transmisi & CVT': { count: 24, totalValue: 3120000 },
      'Sistem Pengereman': { count: 21, totalValue: 2730000 },
      'Filter & Cairan': { count: 18, totalValue: 1250000 },
      'Mesin & Pengapian': { count: 14, totalValue: 1820000 },
      'Ban & Roda': { count: 8, totalValue: 3280000 },
      'Kelistrikan & Aki': { count: 6, totalValue: 1950000 }
    };

    // Map inventory categories
    const partMap = new Map<string, { category: string; price: number }>();
    inventory.forEach(p => {
      partMap.set(p.id, { category: p.category, price: p.sellPrice });
      partMap.set(p.sku, { category: p.category, price: p.sellPrice });
      partMap.set(p.name, { category: p.category, price: p.sellPrice });
    });

    // Add actual parts from active & recorded service orders
    services.forEach(order => {
      order.partsUsed.forEach(part => {
        const info = partMap.get(part.partId) || partMap.get(part.sku) || partMap.get(part.name);
        let cat = info?.category;
        if (!cat) {
          const lower = part.name.toLowerCase();
          if (lower.includes('oli') || lower.includes('pelumas')) cat = 'Oli & Pelumas';
          else if (lower.includes('rem') || lower.includes('pad')) cat = 'Sistem Pengereman';
          else if (lower.includes('cvt') || lower.includes('roller') || lower.includes('belt')) cat = 'Transmisi & CVT';
          else if (lower.includes('filter')) cat = 'Filter & Cairan';
          else if (lower.includes('busi')) cat = 'Mesin & Pengapian';
          else if (lower.includes('ban')) cat = 'Ban & Roda';
          else if (lower.includes('aki')) cat = 'Kelistrikan & Aki';
          else cat = 'Lain-lain';
        }

        if (!baseCategoryCounts[cat]) {
          baseCategoryCounts[cat] = { count: 0, totalValue: 0 };
        }
        baseCategoryCounts[cat].count += (part.quantity || 1);
        baseCategoryCounts[cat].totalValue += (part.price * (part.quantity || 1));
      });
    });

    const totalQuantity = Object.values(baseCategoryCounts).reduce((acc, c) => acc + c.count, 0);

    const colors = [
      '#0284c7', // Sky-600
      '#0ea5e9', // Sky-500
      '#38bdf8', // Sky-400
      '#2563eb', // Blue-600
      '#6366f1', // Indigo-500
      '#10b981', // Emerald-500
      '#f59e0b', // Amber-500
      '#8b5cf6'  // Purple-500
    ];

    return Object.entries(baseCategoryCounts)
      .map(([category, val], idx) => ({
        category,
        quantity: val.count,
        totalValue: val.totalValue,
        percentage: totalQuantity > 0 ? Math.round((val.count / totalQuantity) * 100) : 0,
        color: colors[idx % colors.length]
      }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [services, inventory]);

  const totalPartsUsed = partCategoryData.reduce((acc, p) => acc + p.quantity, 0);
  const topCategory = partCategoryData[0];

  // Custom Tooltip for Daily Service Trend
  const CustomDailyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-sky-200 bg-white/95 px-3 py-2 shadow-xl backdrop-blur-xl text-xs z-50">
          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1.5 flex items-center justify-between gap-3">
            <span>{data.fullDate || label}</span>
            <span className="font-mono text-[11px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
              {data.totalServis} Unit Total
            </span>
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`entry-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-slate-900">
                {entry.dataKey === 'revenue' 
                  ? formatRupiah(entry.value) 
                  : `${entry.value} Unit`}
              </span>
            </div>
          ))}
          {trendMetric !== 'revenue' && (
            <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Estimasi Omset:</span>
              <span className="font-mono font-bold text-emerald-600">{formatRupiah(data.revenue)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Category Chart
  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-sky-200 bg-white/95 px-3 py-2 shadow-xl backdrop-blur-xl text-xs z-50">
          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1.5 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: data.color }} />
            {data.category}
          </p>
          <div className="flex items-center justify-between gap-4 py-0.5">
            <span className="text-slate-600 font-medium">Total Pemakaian:</span>
            <span className="font-mono font-bold text-sky-700">{data.quantity} Pcs / Unit</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-0.5">
            <span className="text-slate-600 font-medium">Nilai Transaksi:</span>
            <span className="font-mono font-bold text-emerald-600">{formatRupiah(data.totalValue)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-0.5 text-[11px] text-slate-400">
            <span>Pangsa Kategori:</span>
            <span className="font-mono font-semibold text-slate-700">{data.percentage}% dari total</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome / Hero Banner with Bright Glassmorphism & High-tech photo */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
        {/* Background Image with Light Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/workshop_bay_hero_1790188051466.jpg"
            alt="Bengkel Motor Modern MotoRAD"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center opacity-15 filter saturate-150 contrast-105"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-sky-50/70"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-bold text-sky-700 border border-sky-300 shadow-xs">
                <Activity className="h-3 w-3 animate-pulse text-sky-600" />
                Live Workshop Operations
              </span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-slate-600 font-medium">Rapid Application Development (RAD) Cycle 4</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Bengkel Motor <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">MotoRAD Engine</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Monitoring real-time alur servis, pemotongan stok otomatis suku cadang, dan analitik produktivitas bengkel dengan visualisasi data interaktif.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveView('couriers')}
              className="flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50/80 hover:bg-sky-100 px-3.5 py-2 text-xs font-bold text-sky-800 shadow-xs backdrop-blur-md transition-all"
            >
              <Navigation className="h-4 w-4 text-sky-600 animate-pulse" />
              <span>Pantau Kurir Jemput</span>
            </button>
            <button
              onClick={() => setActiveView('reports')}
              className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white/90 hover:bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-700 shadow-xs backdrop-blur-md transition-all"
            >
              <TrendingUp className="h-4 w-4 text-sky-600" />
              <span>Laporan Bulanan</span>
            </button>
            <button
              onClick={onOpenNewService}
              className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.35)] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>+ Booking Servis Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Monthly Revenue */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Omset Bulan Ini</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {formatRupiah(summary.totalRevenue)}
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Laba kotor: {formatRupiah(summary.grossProfit)}</span>
          </div>
        </div>

        {/* Metric 2: Active & Queue Orders */}
        <div 
          onClick={() => setActiveView('services')}
          className="glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sedang Dikerjakan</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {activeOrders.length} <span className="text-sm font-normal text-slate-500">Unit</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">({queueOrders.length} antre)</span>
          </div>
          <div className="mt-2 text-xs text-sky-700 font-medium flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>Rata-rata 42 menit / unit</span>
          </div>
        </div>

        {/* Metric 3: Critical Low Stock */}
        <div 
          onClick={() => setActiveView('inventory')}
          className="glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stok Kritis / Menipis</span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
              lowStockCount > 0 
                ? 'bg-amber-100 border-amber-300 text-amber-700 animate-pulse' 
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono tabular-nums ${
              lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}>
              {lowStockCount} <span className="text-sm font-normal text-slate-500">Komponen</span>
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-700 group-hover:text-amber-800 font-semibold flex items-center justify-between">
            <span>Perlu restock segera</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Metric 4: Customer Satisfaction */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kepuasan Pelanggan</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {summary.averageSatisfaction} <span className="text-sm text-sky-600">/ 5.0</span>
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Berdasarkan 96 ulasan servis bulan ini
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RECHARTS DATA VISUALIZATION SECTION (DUAL ANALYTICS HUB)                   */}
      {/* 1. Tren Jumlah Servis Harian & 2. Kategori Suku Cadang Terlaris/Terbanyak  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART 1 (7 COLS): TREN JUMLAH SERVIS HARIAN (Recharts AreaChart / BarChart) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 flex flex-col justify-between border border-sky-200/80 shadow-xs">
          <div>
            {/* Header with Segmented Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-sky-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-sky-600" />
                  Tren Jumlah Servis Harian
                </h3>
                <p className="text-xs text-slate-500">
                  Visualisasi volume pengerjaan motor dan ritme operasional 7 hari terakhir
                </p>
              </div>

              {/* Metric Toggle Buttons */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs">
                <button
                  type="button"
                  onClick={() => setTrendMetric('volume')}
                  className={`px-2.5 py-1 font-semibold rounded-lg transition-all ${
                    trendMetric === 'volume' 
                      ? 'bg-white text-sky-700 font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Total Unit
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMetric('breakdown')}
                  className={`px-2.5 py-1 font-semibold rounded-lg transition-all ${
                    trendMetric === 'breakdown' 
                      ? 'bg-white text-sky-700 font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rutin vs Berat
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMetric('revenue')}
                  className={`px-2.5 py-1 font-semibold rounded-lg transition-all ${
                    trendMetric === 'revenue' 
                      ? 'bg-white text-sky-700 font-bold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pendapatan
                </button>
              </div>
            </div>

            {/* Quick KPI stats bar */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-xl bg-sky-50/70 border border-sky-200/70 p-2.5">
                <span className="text-[10px] text-slate-500 block font-medium">Total 7 Hari</span>
                <span className="font-mono text-base font-bold text-sky-700">{totalWeeklyServices} Unit</span>
              </div>
              <div className="rounded-xl bg-sky-50/70 border border-sky-200/70 p-2.5">
                <span className="text-[10px] text-slate-500 block font-medium">Rata-rata Harian</span>
                <span className="font-mono text-base font-bold text-slate-800">{avgDailyServices} Unit/hari</span>
              </div>
              <div className="rounded-xl bg-sky-50/70 border border-sky-200/70 p-2.5">
                <span className="text-[10px] text-slate-500 block font-medium">Puncak Antrean</span>
                <span className="font-mono text-base font-bold text-amber-700">{peakDay.day} ({peakDay.totalServis} Unit)</span>
              </div>
            </div>

            {/* Recharts Component: Daily Service Trend AreaChart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {trendMetric === 'revenue' ? (
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 10 }} 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `${val / 1000000} jt`}
                    />
                    <Tooltip content={<CustomDailyTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Pendapatan (Rp)" 
                      stroke="#0284c7" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#gradientRevenue)" 
                    />
                  </AreaChart>
                ) : trendMetric === 'breakdown' ? (
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradRutin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gradBerat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 10 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomDailyTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={32} 
                      iconType="circle"
                      formatter={(val) => <span className="text-xs font-semibold text-slate-700">{val}</span>} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="servisRutin" 
                      name="Servis Rutin / Ringan" 
                      stroke="#0284c7" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#gradRutin)" 
                      stackId="1"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="perbaikanBerat" 
                      name="Perbaikan Berat & CVT" 
                      stroke="#6366f1" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#gradBerat)" 
                      stackId="1"
                    />
                  </AreaChart>
                ) : (
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 10 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomDailyTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="totalServis" 
                      name="Total Servis (Unit)" 
                      stroke="#0284c7" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#gradientTotal)" 
                      dot={{ r: 4, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 3 }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-slate-600">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              Rekomendasi RAD: Tambah 1 asisten mekanik di hari Sabtu & Minggu
            </span>
            <button
              onClick={() => setActiveView('services')}
              className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
            >
              Lihat Riwayat Lengkap
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* CHART 2 (5 COLS): KATEGORI SUKU CADANG PALING SERING DIGUNAKAN (Recharts BarChart / PieChart) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 flex flex-col justify-between border border-sky-200/80 shadow-xs">
          <div>
            {/* Header with Bar / Donut Toggle */}
            <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-sky-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-sky-600" />
                  Kategori Suku Cadang Terpopuler
                </h3>
                <p className="text-xs text-slate-500">
                  Ranking pemakaian komponen paling sering dipasang
                </p>
              </div>

              {/* View Switch: Bar vs Donut */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setCategoryViewType('bar')}
                  className={`p-1 rounded-lg transition-colors ${
                    categoryViewType === 'bar' 
                      ? 'bg-white text-sky-700 shadow-xs' 
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Tampilan Diagram Batang"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryViewType('donut')}
                  className={`p-1 rounded-lg transition-colors ${
                    categoryViewType === 'donut' 
                      ? 'bg-white text-sky-700 shadow-xs' 
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Tampilan Diagram Lingkaran"
                >
                  <PieIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Top Category Highlight Banner */}
            <div className="rounded-xl bg-gradient-to-r from-sky-50 to-blue-50/70 border border-sky-200 p-2.5 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-white shadow-xs">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-sky-700 font-bold uppercase tracking-wider block">
                    Paling Banyak Digunakan:
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    {topCategory?.category} ({topCategory?.quantity} Pcs · {topCategory?.percentage}%)
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-sky-700 bg-white/90 border border-sky-200 px-2 py-0.5 rounded-lg shadow-xs">
                {totalPartsUsed} Pcs Total
              </span>
            </div>

            {/* Recharts Visualization */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {categoryViewType === 'bar' ? (
                  <BarChart
                    data={partCategoryData.slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis 
                      type="number" 
                      tick={{ fill: '#64748b', fontSize: 10 }} 
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="category" 
                      tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }} 
                      axisLine={false}
                      tickLine={false}
                      width={95}
                    />
                    <Tooltip content={<CustomCategoryTooltip />} />
                    <Bar 
                      dataKey="quantity" 
                      name="Jumlah Terpakai (Pcs)" 
                      radius={[0, 6, 6, 0]}
                    >
                      {partCategoryData.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Tooltip content={<CustomCategoryTooltip />} />
                    <Pie
                      data={partCategoryData}
                      dataKey="quantity"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {partCategoryData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      iconSize={8}
                      formatter={(value) => <span className="text-[10px] text-slate-600 font-medium">{value}</span>}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>

          </div>

          {/* Footer Navigation */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-medium">
              Otomatis terpotong saat pengerjaan servis
            </span>
            <button
              onClick={() => setActiveView('inventory')}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Kelola Suku Cadang
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Workshop Bay Live Grid */}
      <div className="rounded-2xl border border-sky-200/80 bg-white/80 p-5 backdrop-blur-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-600" />
              Status Real-Time 4 Bay Servis Bengkel
            </h3>
            <p className="text-xs text-slate-500">Pengerjaan di setiap hidrolik lift & pit diagnosa mekanik</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
              Sedang Dikerjakan
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium ml-3">
              <span className="h-2 w-2 rounded-full bg-slate-300"></span>
              Standby / Siap Antrean
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bays.map((bay) => {
            const order = bay.currentOrder;
            const isWorking = !!order;
            return (
              <div
                key={bay.bay}
                className={`group relative rounded-xl border p-4 transition-all duration-200 ${
                  isWorking
                    ? 'border-sky-300 bg-white shadow-md'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/15 font-mono text-xs font-bold text-sky-700 border border-sky-300">
                      B{bay.bay}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Bay {bay.bay}
                    </span>
                  </div>
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold ${
                    isWorking 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {isWorking ? order?.status : 'Standby'}
                  </span>
                </div>

                {isWorking && order ? (
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {order.motorModel}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono font-bold text-sky-700">{order.plateNumber}</span>
                        <span className="truncate max-w-[90px]">{order.customerName}</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-sky-50/70 p-2 border border-sky-100 text-[11px] text-slate-600">
                      <span className="text-[10px] text-sky-700 block font-bold">Mekanik:</span>
                      <span className="font-medium text-slate-800">{order.mechanicName.split('(')[0]}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400">Durasi est:</span>
                      <span className="font-mono font-bold text-sky-700">{order.estimatedMinutes} menit</span>
                    </div>

                    <button
                      onClick={() => onSelectService(order)}
                      className="w-full mt-2 rounded-lg bg-sky-50 border border-sky-300 py-1.5 text-center text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors"
                    >
                      Buka Pengerjaan
                    </button>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <span className="text-xs text-slate-400 block mb-3">Siap untuk antrean berikutnya</span>
                    <button
                      onClick={onOpenNewService}
                      className="rounded-lg border border-dashed border-sky-300 bg-sky-50/60 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors"
                    >
                      + Masukkan Motor
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Section: Critical Low Stock Quick Monitor & Recent Services Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Col: Critical Low Stock Quick Panel */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Stok Kritis Real-Time</h3>
              </div>
              <span className="rounded bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-800 font-mono">
                {lowStockCount} Item
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Komponen yang berada pada atau di bawah ambang batas minimum otomatis memicu notifikasi push:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {criticalParts.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                  Semua stok suku cadang dalam status aman.
                </div>
              ) : (
                criticalParts.map((part) => (
                  <div
                    key={part.id}
                    className="rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 transition-colors hover:border-amber-300"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="font-bold text-slate-900 text-xs truncate max-w-[180px]">
                          {part.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {part.sku} · {part.shelfLocation}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-amber-700">
                          {part.stock} {part.unit}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-medium">Min: {part.minStock}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveView('inventory')}
            className="mt-4 flex items-center justify-center gap-1.5 w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white py-2 text-xs font-bold shadow-sm transition-colors"
          >
            <span>Buka & Restock di Gudang</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right 2 Cols: Active & Recent Services Queue */}
        <div className="lg:col-span-2 rounded-2xl border border-sky-200/80 bg-white/80 p-5 backdrop-blur-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-sky-600" />
                  Antrean & Progres Pengerjaan Servis Terkini
                </h3>
                <p className="text-xs text-slate-500">Daftar kendaraan yang sedang dikerjakan mekanik hari ini</p>
              </div>
              <button
                onClick={() => setActiveView('services')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                Lihat Semua Antrean ({services.length})
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2.5 font-bold">No. Order</th>
                    <th className="pb-2.5 font-bold">Kendaraan / Plat</th>
                    <th className="pb-2.5 font-bold">Pelanggan</th>
                    <th className="pb-2.5 font-bold">Mekanik & Bay</th>
                    <th className="pb-2.5 font-bold">Status</th>
                    <th className="pb-2.5 font-bold text-right">Total Biaya</th>
                    <th className="pb-2.5 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.slice(0, 5).map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-sky-50/50 transition-colors group cursor-pointer"
                      onClick={() => onSelectService(order)}
                    >
                      <td className="py-2.5 font-mono font-bold text-sky-700">
                        {order.orderNumber}
                      </td>
                      <td className="py-2.5 font-semibold text-slate-900">
                        <div className="truncate max-w-[130px]">{order.motorModel}</div>
                        <span className="font-mono text-[10px] text-slate-500">{order.plateNumber}</span>
                      </td>
                      <td className="py-2.5 text-slate-700">
                        <div className="truncate max-w-[110px]">{order.customerName}</div>
                      </td>
                      <td className="py-2.5 text-slate-700">
                        <div className="truncate max-w-[110px]">{order.mechanicName.split(' ')[0]}</div>
                        <span className="text-[10px] text-sky-600 font-mono font-semibold">Bay {order.bayNumber}</span>
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold ${
                          order.status === 'Selesai' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : order.status === 'Pengerjaan' 
                            ? 'bg-sky-100 text-sky-800 border border-sky-300' 
                            : order.status === 'Diagnosa' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-sky-700 tabular-nums">
                        {formatRupiah(order.totalCost)}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectService(order);
                          }}
                          className="rounded-lg bg-sky-50 border border-sky-300 px-2 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-100"
                        >
                          Rincian
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
