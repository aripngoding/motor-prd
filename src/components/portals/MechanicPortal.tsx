import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ServiceOrder, ServiceStatus, InventoryPart } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ChatInterface } from '../chat/ChatInterface';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Boxes, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Search, 
  AlertTriangle, 
  ChevronRight, 
  Check, 
  Layers, 
  UserCheck, 
  Star,
  PlayCircle,
  PauseCircle,
  PackageCheck
} from 'lucide-react';

interface MechanicPortalProps {
  onSelectService?: (service: ServiceOrder) => void;
}

export const MechanicPortal: React.FC<MechanicPortalProps> = ({ onSelectService }) => {
  const { 
    services, 
    inventory, 
    currentEmployee, 
    updateServiceStatus,
    triggerPushNotification 
  } = useWorkshop();

  // Tab mode for mechanic
  const [activeTab, setActiveTab] = useState<'my-job' | 'queue' | 'inventory-check' | 'chat'>('my-job');

  // Search in sparepart stock
  const [partSearch, setPartSearch] = useState('');

  // Selected active service order assigned to this mechanic
  const assignedServices = services.filter(
    s => s.mechanicId === currentEmployee.id || s.mechanicName.toLowerCase().includes(currentEmployee.name.toLowerCase().split(' ')[0])
  );

  const activeAssignedOrder = assignedServices.find(
    s => s.status === 'Pengerjaan' || s.status === 'Diagnosa' || s.status === 'Menunggu Sparepart'
  ) || assignedServices[0] || services.find(s => s.status === 'Pengerjaan' || s.status === 'Diagnosa') || services[0];

  const [selectedOrderId, setSelectedOrderId] = useState<string>(activeAssignedOrder ? activeAssignedOrder.id : '');

  const currentOrder = services.find(s => s.id === (selectedOrderId || (activeAssignedOrder ? activeAssignedOrder.id : ''))) || activeAssignedOrder;

  // Local checklist state for immediate feedback
  const [checklist, setChecklist] = useState(() => currentOrder ? { ...currentOrder.checklist } : {
    oliMesin: true,
    busiPengapian: true,
    sistemRem: true,
    cvtRantai: true,
    filterUdara: true,
    akiKelistrikan: true,
    tekananBan: true,
    radiatorCoolant: true
  });

  // Keep checklist in sync when changing order
  React.useEffect(() => {
    if (currentOrder) {
      setChecklist({ ...currentOrder.checklist });
    }
  }, [currentOrder?.id]);

  // Handle checklist item toggle
  const handleToggleChecklist = (key: keyof typeof checklist) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    if (currentOrder) {
      currentOrder.checklist = updated;
      triggerPushNotification(
        'Inspeksi Fisik Diperbarui',
        `Item ${key} pada motor ${currentOrder.plateNumber} telah diuji oleh ${currentEmployee.name}.`,
        'system'
      );
    }
  };

  // Change status handler
  const handleChangeStatus = (orderId: string, nextStatus: ServiceStatus) => {
    updateServiceStatus(orderId, nextStatus);
  };

  // Filtered inventory for view-only check
  const filteredParts = inventory.filter(p => 
    p.name.toLowerCase().includes(partSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(partSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(partSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* 1. MECHANIC CONSOLE HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-200/90 dark:border-sky-500/25 bg-white/90 dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm backdrop-blur-xl transition-colors">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 rounded-full bg-sky-500/15 dark:bg-sky-500/25 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300 border border-sky-400/40">
                <Wrench className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>Konsol Kerja Teknisi Pit MotoRAD</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>{currentEmployee.name} ({currentEmployee.role})</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400" />
                <span>Rating {currentEmployee.rating} • {currentEmployee.completedJobs} Servis Selesai</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Konsol Pit Mekanik</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 font-mono text-xl sm:text-2xl">
                MotoRAD
              </span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Kelola pekerjaan servis pit aktif Anda, lakukan pengujian 8-titik inspeksi fisik, perbarui status pengerjaan, dan koordinasi cepat dengan gudang suku cadang.
            </p>
          </div>

          {/* Mechanic Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start lg:self-auto">
            <button
              onClick={() => setActiveTab('my-job')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'my-job'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-200 dark:border-sky-500/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wrench className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>Tugas Pit Saya</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-sm border border-amber-200 dark:border-amber-500/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Antrean Masuk ({services.filter(s => s.status === 'Antre').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory-check')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inventory-check'
                  ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-sm border border-purple-200 dark:border-purple-500/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Boxes className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>Cek Stok Rak Gudang</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200 dark:border-emerald-500/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Chat Pit Crew</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAB 1: MY ACTIVE JOB */}
      {activeTab === 'my-job' && (
        <div className="space-y-6">
          
          {/* Active Job Selector Pills if multiple */}
          {assignedServices.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-slate-500">Pilih Unit Servis:</span>
              {assignedServices.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedOrderId(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    currentOrder?.id === s.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Bay #{s.bayNumber} • {s.plateNumber} ({s.status})
                </button>
              ))}
            </div>
          )}

          {currentOrder ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Bike Info & Checklist (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Active Bike Card */}
                <div className="rounded-3xl border border-sky-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-sky-100 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] font-mono text-sky-600 dark:text-sky-400 font-bold block">
                        PIT BAY #{currentOrder.bayNumber} • TIKET {currentOrder.orderNumber}
                      </span>
                      <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-wider block">
                        {currentOrder.plateNumber}
                      </span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {currentOrder.motorModel} • Pemilik: {currentOrder.customerName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-block shadow-xs ${
                        currentOrder.status === 'Pengerjaan'
                          ? 'bg-sky-500 text-white'
                          : currentOrder.status === 'Selesai'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {currentOrder.status}
                      </span>
                      <span className="text-xs text-slate-400 block mt-1">
                        Estimasi: ~{currentOrder.estimatedMinutes} menit
                      </span>
                    </div>
                  </div>

                  {/* Keluhan Konsumen */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                      Keluhan & Instruksi Pengerjaan:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 italic">
                      "{currentOrder.complaints}"
                    </p>
                  </div>

                  {/* Status Action Buttons for Mechanic */}
                  <div className="mt-5 pt-4 border-t border-sky-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2.5">
                      Perbarui Status Pengerjaan di Pit:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleChangeStatus(currentOrder.id, 'Diagnosa')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                          currentOrder.status === 'Diagnosa'
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                        }`}
                      >
                        1. Diagnosa
                      </button>

                      <button
                        type="button"
                        onClick={() => handleChangeStatus(currentOrder.id, 'Pengerjaan')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                          currentOrder.status === 'Pengerjaan'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                        }`}
                      >
                        2. Kerjakan
                      </button>

                      <button
                        type="button"
                        onClick={() => handleChangeStatus(currentOrder.id, 'Menunggu Sparepart')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                          currentOrder.status === 'Menunggu Sparepart'
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-300'
                        }`}
                      >
                        3. Tunggu Part
                      </button>

                      <button
                        type="button"
                        onClick={() => handleChangeStatus(currentOrder.id, 'Selesai')}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                          currentOrder.status === 'Selesai'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                        }`}
                      >
                        4. Selesai ✓
                      </button>
                    </div>
                  </div>

                </div>

                {/* 8-Point Physical Inspection Checklist */}
                <div className="rounded-3xl border border-sky-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-100 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-sky-600" />
                        <span>Checklist Uji Fisik 8-Titik Motor (Klik untuk Memverifikasi)</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Wajib diverifikasi teknisi sebelum menandai unit servis selesai.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'oliMesin', label: '1. Kondisi Oli Mesin & Filter', desc: 'Volume, kekentalan & warna oli' },
                      { key: 'busiPengapian', label: '2. Busi & Pengapian', desc: 'Celah elektroda & percikan api' },
                      { key: 'sistemRem', label: '3. Kampas & Master Rem', desc: 'Ketebalan kampas & minyak rem' },
                      { key: 'cvtRantai', label: '4. CVT Matic / Rantai Roda', desc: 'Roller, v-belt atau setelan rantai' },
                      { key: 'filterUdara', label: '5. Saringan Filter Udara', desc: 'Kebersihan boks saringan udara' },
                      { key: 'akiKelistrikan', label: '6. Tegangan Aki & Lampu', desc: 'Voltase aki & fungsi sein/klakson' },
                      { key: 'tekananBan', label: '7. Tekanan Angin & Alur Ban', desc: 'Tekanan PSI depan & belakang' },
                      { key: 'radiatorCoolant', label: '8. Air Radiator Coolant', desc: 'Volume tabung reservoir' }
                    ].map((item) => {
                      const isChecked = checklist[item.key as keyof typeof checklist];
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleToggleChecklist(item.key as keyof typeof checklist)}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            isChecked
                              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 hover:border-sky-300'
                          }`}
                        >
                          <div>
                            <span className={`text-xs font-bold block ${isChecked ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
                              {item.label}
                            </span>
                            <span className="text-[10px] text-slate-500">{item.desc}</span>
                          </div>
                          <div className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-all ${
                            isChecked 
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs' 
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent'
                          }`}>
                            <Check className="h-4 w-4" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Suku Cadang Terpasang & Quick Chat (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Parts Used Card */}
                <div className="rounded-3xl border border-sky-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Boxes className="h-4 w-4 text-sky-600" />
                      <span>Suku Cadang Terpasang ({currentOrder.partsUsed.length})</span>
                    </span>
                    <button
                      onClick={() => setActiveTab('inventory-check')}
                      className="text-[11px] font-bold text-sky-600 hover:underline cursor-pointer"
                    >
                      + Cek Stok Gudang
                    </button>
                  </div>

                  {currentOrder.partsUsed.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">Belum ada suku cadang yang ditambahkan ke order ini</p>
                  ) : (
                    <div className="space-y-2">
                      {currentOrder.partsUsed.map((part, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{part.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">SKU: {part.sku}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{part.quantity}x</span>
                            <span className="text-[10px] text-slate-400 block">{formatRupiah(part.price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Biaya Jasa Servis:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{formatRupiah(currentOrder.laborCost)}</span>
                  </div>
                </div>

                {/* Embedded Pit Chat */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    <span>Chat Koordinasi Pit Bay & Sparepart</span>
                  </span>
                  <ChatInterface variant="embedded" initialChannel="#service-bay" />
                </div>

              </div>

            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">Belum ada tugas servis aktif yang ditugaskan ke Anda saat ini.</p>
              <button
                onClick={() => setActiveTab('queue')}
                className="mt-3 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
              >
                Lihat Antrean Bengkel
              </button>
            </div>
          )}

        </div>
      )}

      {/* 3. TAB 2: WORKSHOP QUEUE */}
      {activeTab === 'queue' && (
        <div className="rounded-3xl border border-sky-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daftar Antrean Kendaraan di Bengkel
              </h3>
              <span className="text-xs text-slate-500">
                Pilih motor dalam antrean untuk dimasukkan ke pit bay kerja Anda.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('my-job')}
              className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
            >
              ← Kembali ke Pit Saya
            </button>
          </div>

          <div className="space-y-3">
            {services.filter(s => s.status === 'Antre' || s.status === 'Diagnosa').map(order => (
              <div 
                key={order.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                      {order.plateNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {order.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mt-0.5">
                    {order.motorModel} • {order.customerName} • Masuk: {order.createdAt}
                  </span>
                  <p className="text-xs text-slate-500 italic mt-1">"{order.complaints}"</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    order.mechanicId = currentEmployee.id;
                    order.mechanicName = currentEmployee.name;
                    handleChangeStatus(order.id, 'Pengerjaan');
                    setSelectedOrderId(order.id);
                    setActiveTab('my-job');
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all whitespace-nowrap cursor-pointer"
                >
                  Ambil Tugas Ini ke Pit →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB 3: INVENTORY STOCK CHECK (VIEW-ONLY FOR MECHANIC) */}
      {activeTab === 'inventory-check' && (
        <div className="rounded-3xl border border-sky-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="h-4 w-4 text-purple-600" />
                <span>Pengecekan Ketersediaan Suku Cadang di Rak Gudang</span>
              </h3>
              <span className="text-xs text-slate-500">
                Pencarian cepat stok fisik dan nomor rak penyimpanan suku cadang di gudang bengkel.
              </span>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                placeholder="Cari nama part, busi, oli, rem..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredParts.map(part => (
              <div 
                key={part.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {part.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    part.stock <= part.minStock
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {part.stock} {part.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Rak: <strong className="text-slate-700 dark:text-slate-300">{part.location}</strong></span>
                  <span>SKU: {part.sku}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB 4: CHAT PIT CREW FULL VIEW */}
      {activeTab === 'chat' && (
        <div className="rounded-3xl border border-sky-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm backdrop-blur-xl">
          <ChatInterface variant="full" initialChannel="#service-bay" />
        </div>
      )}

    </div>
  );
};
