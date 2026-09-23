import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { 
  Cpu, 
  Layers, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  RefreshCw, 
  Wrench, 
  Boxes,
  Activity
} from 'lucide-react';

export const RadMethodologyView: React.FC = () => {
  const { addService, triggerPushNotification, resetToDefaultData } = useWorkshop();

  const handleSimulateBurstOrders = () => {
    const burstMotorbikes = [
      { customer: 'Farhan Maulana', phone: '0812-3344-5511', motor: 'Honda PCX 160 ABS', plate: 'B 4412 PXC', cat: 'Servis Berkala', bay: 2 },
      { customer: 'Rizky Pratama', phone: '0857-9988-7711', motor: 'Yamaha NMAX 155', plate: 'B 3918 KMN', cat: 'Sistem Rem & CVT', bay: 3 },
      { customer: 'Anisa Rahma', phone: '0813-1122-8899', motor: 'Honda Beat Street', plate: 'B 5021 BTS', cat: 'Ganti Oli & Tune Up', bay: 4 }
    ] as const;

    burstMotorbikes.forEach((bike, i) => {
      setTimeout(() => {
        addService({
          customerName: bike.customer,
          customerPhone: bike.phone,
          motorModel: bike.motor,
          plateNumber: bike.plate,
          serviceCategory: bike.cat,
          complaints: 'Simulasi RAD: Pengerjaan servis cepat hasil permintaan pengguna langsung.',
          bayNumber: bike.bay,
          mechanicId: 'emp-02',
          mechanicName: 'Agus Santoso (Kepala Mekanik)',
          status: 'Antre',
          estimatedMinutes: 30,
          laborCost: 65000,
          partsUsed: [],
          checklist: {
            oliMesin: false,
            busiPengapian: true,
            sistemRem: true,
            cvtRantai: true,
            filterUdara: true,
            akiKelistrikan: true,
            tekananBan: true,
            radiatorCoolant: true
          }
        });
      }, i * 300);
    });

    triggerPushNotification(
      'Simulasi RAD: 3 Servis Berhasil Ditambahkan',
      'Data antrean masuk secara simultan untuk memvalidasi performa sistem penjadwalan servis.',
      'service_update'
    );
  };

  const radPhases = [
    {
      step: '01',
      title: 'Perencanaan Kebutuhan (Requirements Planning)',
      desc: 'Mengidentifikasi masalah utama bengkel motor: antrean servis tidak terpantau transparan dan stok suku cadang sering terlambat dipesan ulang (kebocoran inventaris).',
      deliverables: 'Scope modul servis, 8-point inspection checklist, dan batas ambang minimum stok.'
    },
    {
      step: '02',
      title: 'Desain Pengguna (User Design Prototyping)',
      desc: 'Iterasi cepat antarmuka glassmorphism modern dengan palet warna putih dan biru terang. Melibatkan langsung Kepala Mekanik dan Kasir untuk tata letak input yang cepat tanpa lag.',
      deliverables: 'Komponen visual 4 Bay Servis, modal booking kilat, dan filter kategori suku cadang.'
    },
    {
      step: '03',
      title: 'Konstruksi Cepat (Construction & Integration)',
      desc: 'Pengembangan logika pemotongan stok otomatis saat servis dikerjakan, pemicu push notification seketika saat stok kritis, serta generator laporan PDF & Excel.',
      deliverables: 'Integrasi state real-time, validasi RBAC karyawan, dan ekspor instan.'
    },
    {
      step: '04',
      title: 'Peralihan & Evaluasi (Cutover / Live Deployment)',
      desc: 'Pengujian operasional langsung di bengkel, uji ketahanan lonjakan antrean, pengumpulan feedback mekanik, dan peluncuran versi produksi stabil.',
      deliverables: 'Sistem operasional aktif, CSAT pelanggan meningkat, zero-downtime inventory.'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-sky-600" />
            Metodologi Rapid Application Development (RAD)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pendekatan siklus hidup pengembangan sistem yang mengutamakan kecepatan iterasi, prototipe fungsional, dan feedback pengguna langsung
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaultData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Data Demo</span>
          </button>
        </div>
      </div>

      {/* Hero RAD Banner with Technical Diagnostic Image */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/motorcycle_schematic_1790188071123.jpg"
            alt="Motorcycle Diagnostic Schematic"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-right opacity-15 filter saturate-150 contrast-105"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800 border border-sky-300">
            <Zap className="h-3.5 w-3.5 text-sky-600" />
            Siklus Pengembangan 65% Lebih Singkat Dibanding Waterfall
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Mengapa RAD Ideal untuk Bengkel Motor Modern?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Dalam bisnis bengkel motor, kebutuhan operasional berubah sangat dinamis: penambahan tipe motor baru, suku cadang substitusi, dan kebutuhan antrean cepat. Dengan metode RAD, fitur inventaris dan penjadwalan dapat langsung dibangun, diuji mekanik di lapangan, dan disempurnakan tanpa menunggu siklus dokumentasi panjang.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulateBurstOrders}
              className="flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_18px_rgba(14,165,233,0.35)] transition-all"
            >
              <Activity className="h-4 w-4" />
              <span>Simulasi Uji Beban: Lonjakan 3 Motor Servis</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Phases of RAD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {radPhases.map((phase) => (
          <div
            key={phase.step}
            className="glass-panel rounded-2xl p-5 border border-sky-200/80 hover:border-sky-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-2xl font-extrabold text-sky-600/40">
                  {phase.step}
                </span>
                <span className="flex items-center gap-1 rounded bg-sky-100 border border-sky-300 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                  <CheckCircle2 className="h-3 w-3" />
                  Terverifikasi
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 mb-2">
                {phase.title}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {phase.desc}
              </p>
            </div>

            <div className="rounded-xl bg-sky-50/70 p-3 border border-sky-100 text-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                Output / Deliverable Terimplementasi:
              </span>
              <span className="text-sky-800 text-[11px] font-semibold mt-0.5 block">
                {phase.deliverables}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* RAD Comparison Table */}
      <div className="rounded-2xl border border-sky-200 bg-white/90 p-5 backdrop-blur-xl shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-sky-600" />
          Perbandingan Kecepatan: Rapid Application Development vs Metode Waterfall
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2.5 font-bold">Aspek Perbandingan</th>
                <th className="pb-2.5 font-bold text-sky-700">Metode RAD (MotoRAD Engine)</th>
                <th className="pb-2.5 font-bold text-slate-500">Metode Tradisional (Waterfall)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 font-bold text-slate-900">Waktu Rilis Fitur Pertama</td>
                <td className="py-2.5 font-bold text-sky-700">2 - 3 Minggu (Iterasi Langsung)</td>
                <td className="py-2.5 text-slate-500">3 - 6 Bulan (Menunggu semua modul)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900">Keterlibatan Pengguna (Mekanik & Kasir)</td>
                <td className="py-2.5 font-bold text-sky-700">Sangat Tinggi (Feedback mingguan)</td>
                <td className="py-2.5 text-slate-500">Rendah (Hanya di awal spesifikasi)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900">Fleksibilitas Perubahan Kebutuhan</td>
                <td className="py-2.5 font-bold text-sky-700">Sangat Adaptif & Cepat Diubah</td>
                <td className="py-2.5 text-slate-500">Kaku dan memerlukan Change Request mahal</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-slate-900">Deteksi Dini Stok & Kebocoran</td>
                <td className="py-2.5 font-bold text-sky-700">Otomatisasi Push Notification Real-Time</td>
                <td className="py-2.5 text-slate-500">Audit manual bulanan (stok selisih)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
