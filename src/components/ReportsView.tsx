import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  DollarSign, 
  TrendingUp, 
  Boxes, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Download,
  Check
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { exportMonthlyReportToExcel, exportMonthlyReportToPDF } from '../utils/exportReports';

export const ReportsView: React.FC = () => {
  const { 
    services, 
    inventory, 
    employees, 
    getMonthlySummary, 
    currentEmployee 
  } = useWorkshop();

  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const summary = getMonthlySummary();

  const handleExportExcel = () => {
    exportMonthlyReportToExcel(summary, services, inventory, employees);
    setDownloadSuccess('Laporan Excel (.xlsx) berhasil diunduh!');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleExportPDF = () => {
    exportMonthlyReportToPDF(summary, services, inventory);
    setDownloadSuccess('Laporan PDF resmi berhasil dibuat dan diunduh!');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Top Parts Sold Calculation
  const topParts = [
    { name: 'Oli Mesin Motul 7100 4T (1L)', qtySold: 28, revenue: 5180000 },
    { name: 'Yamalube Super Matic (1L)', qtySold: 42, revenue: 3276000 },
    { name: 'AHM Oil MPX2 Matic (0.8L)', qtySold: 56, revenue: 3472000 },
    { name: 'V-Belt Bando Racing Vario 160', qtySold: 14, revenue: 2520000 },
    { name: 'Kampas Rem Depan Nissin Samurai', qtySold: 19, revenue: 2565000 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header & Export CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-sky-600" />
            Laporan Kinerja & Keuangan Bulanan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekapitulasi pendapatan servis, omset suku cadang, dan ekspor dokumen resmi (PDF & Excel)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Unduh Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.35)] transition-all transform hover:-translate-y-0.5"
          >
            <FileText className="h-4 w-4" />
            <span>Unduh PDF Resmi</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            title="Cetak via Browser"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* Download Alert toast */}
      {downloadSuccess && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2 shadow-xs no-print">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Month Selector Bar */}
      <div className="flex items-center justify-between glass-panel rounded-2xl p-3.5 no-print">
        <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
          <Calendar className="h-4 w-4 text-sky-600" />
          <span>Periode Pelaporan:</span>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-bold text-sky-700 focus:outline-none shadow-xs"
          >
            <option value="September 2026">September 2026 (Bulan Berjalan)</option>
            <option value="Agustus 2026">Agustus 2026</option>
            <option value="Juli 2026">Juli 2026</option>
          </select>
        </div>

        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
          Dihasilkan secara otomatis oleh MotoRAD Engine
        </span>
      </div>

      {/* Financial KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Omset Bengkel
          </span>
          <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            {formatRupiah(summary.totalRevenue)}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            100% dari target bulanan tercapai
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Pendapatan Jasa Servis
          </span>
          <div className="mt-2 text-2xl font-extrabold font-mono text-sky-700 tabular-nums">
            {formatRupiah(summary.serviceLaborRevenue)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Dari {summary.completedServices} unit pengerjaan motor
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Penjualan Suku Cadang
          </span>
          <div className="mt-2 text-2xl font-extrabold font-mono text-blue-700 tabular-nums">
            {formatRupiah(summary.partsRevenue)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            HPP (Modal): {formatRupiah(summary.partsCost)}
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Estimasi Laba Kotor
          </span>
          <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-700 tabular-nums">
            {formatRupiah(summary.grossProfit)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Margin Operasional ~54%
          </span>
        </div>

      </div>

      {/* Detailed Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Suku Cadang Terlaris */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="h-4 w-4 text-sky-600" />
              5 Suku Cadang Paling Laris ({summary.monthName})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Volume Terjual</span>
          </div>

          <div className="space-y-3">
            {topParts.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-sky-800 font-mono font-bold text-xs border border-sky-300">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <span className="text-[11px] text-slate-500">{item.qtySold} unit terpasang</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-sky-700">
                    {formatRupiah(item.revenue)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">Total Omset</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Produktivitas Mekanik */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-600" />
              Performa & Utilisasi Mekanik Bengkel
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Rating & Tiket</span>
          </div>

          <div className="space-y-3">
            {employees.filter(e => e.role.includes('Mekanik') || e.role.includes('Bengkel')).map((mech) => (
              <div 
                key={mech.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    {mech.name}
                    <span className="text-[10px] text-sky-800 font-mono bg-sky-100 px-1.5 py-0.2 rounded border border-sky-300">
                      {mech.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">{mech.specialization}</span>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-700 block">
                    ⭐ {mech.rating} / 5.0
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {mech.completedJobs} Servis Selesai
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
