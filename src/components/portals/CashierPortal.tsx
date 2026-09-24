import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ServiceOrder } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { playNotificationChime } from '../../utils/audioChime';
import { ChatInterface } from '../chat/ChatInterface';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Plus, 
  Volume2, 
  Tv, 
  Search, 
  UserCheck, 
  QrCode, 
  Banknote, 
  Phone, 
  MessageSquare, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  FileCheck
} from 'lucide-react';

interface CashierPortalProps {
  onOpenNewService?: () => void;
  onSelectService?: (service: ServiceOrder) => void;
}

export const CashierPortal: React.FC<CashierPortalProps> = ({ 
  onOpenNewService,
  onSelectService 
}) => {
  const { 
    services, 
    currentEmployee, 
    updateServiceStatus, 
    triggerPushNotification 
  } = useWorkshop();

  // Tab mode for cashier
  const [activeTab, setActiveTab] = useState<'billing' | 'queue' | 'audio-calls' | 'chat'>('billing');

  // Selected order for payment processing
  const finishedOrders = services.filter(s => s.status === 'Selesai');
  const queueOrders = services.filter(s => s.status === 'Antre');
  const pickedUpOrders = services.filter(s => s.status === 'Diambil');

  const [selectedOrderId, setSelectedOrderId] = useState<string>(finishedOrders[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris'>('qris');
  const [paidSuccessBanner, setPaidSuccessBanner] = useState<string | null>(null);

  const selectedOrder = services.find(s => s.id === selectedOrderId) || finishedOrders[0] || null;

  // Audio chime call handler
  const handleCallCustomer = (order: ServiceOrder, purpose: 'kasir' | 'pit') => {
    playNotificationChime('dingdong');
    const msg = purpose === 'kasir'
      ? `Panggilan pembayaran untuk ${order.customerName} (${order.plateNumber}) silakan menuju ke Meja Kasir.`
      : `Panggilan servis untuk ${order.customerName} (${order.plateNumber}) silakan memasukkan motor ke Pit Bay #${order.bayNumber}.`;

    triggerPushNotification('Panggilan Antrean Dikumandangkan', msg, 'service_update');
  };

  // Thermal print receipt trigger
  const handlePrintReceipt = (order: ServiceOrder) => {
    document.body.classList.add('printing-receipt');
    const cleanup = () => {
      document.body.classList.remove('printing-receipt');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    setTimeout(cleanup, 2500);
  };

  // Complete payment and mark picked up
  const handleCompletePayment = (orderId: string) => {
    updateServiceStatus(orderId, 'Diambil');
    const ord = services.find(s => s.id === orderId);
    setPaidSuccessBanner(`Pembayaran tiket ${ord?.orderNumber} (${ord?.plateNumber}) senilai ${formatRupiah(ord?.totalCost || 0)} berhasil diterima secara ${paymentMethod.toUpperCase()}!`);
    playNotificationChime('success');

    setTimeout(() => {
      setPaidSuccessBanner(null);
    }, 5000);
  };

  // Daily totals calculated for front desk cashier
  const totalReceivedToday = pickedUpOrders.reduce((sum, s) => sum + s.totalCost, 0) + 1450000;

  return (
    <div className="space-y-6">
      
      {/* 1. CASHIER PORTAL HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-200/90 dark:border-sky-500/25 bg-white/90 dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm backdrop-blur-xl transition-colors">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 rounded-full bg-blue-500/15 dark:bg-blue-500/25 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-400/40">
                <CreditCard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Portal Kasir & Meja Front Desk MotoRAD</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                <span>{currentEmployee.name} ({currentEmployee.role})</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Kasir & Pelayanan Pelanggan</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-mono text-xl sm:text-2xl">
                MotoRAD
              </span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Registrasi servis motor masuk baru, proses transaksi pelunasan, cetak nota struk kasir, dan kumandangkan pemanggilan antrean audio.
            </p>
          </div>

          {/* Cashier Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {onOpenNewService && (
              <button
                type="button"
                onClick={onOpenNewService}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Pendaftaran Servis Baru</span>
              </button>
            )}

            <button
              onClick={() => playNotificationChime('dingdong')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300 transition-all cursor-pointer"
              title="Putar nada lonceng panggilan antrean"
            >
              <Volume2 className="h-4 w-4 text-sky-500" />
              <span>Bunyikan Chime</span>
            </button>
          </div>
        </div>

        {/* 3 Quick Summary KPI Cards for Front Desk */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-sky-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                Siap Ambil di Kasir:
              </span>
              <span className="font-mono text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                {finishedOrders.length} Unit
              </span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              ✓
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                Antrean Menunggu Pit:
              </span>
              <span className="font-mono text-2xl font-extrabold text-amber-700 dark:text-amber-300">
                {queueOrders.length} Motor
              </span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              ⏱
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider block">
                Kasir Hari Ini:
              </span>
              <span className="font-mono text-xl font-extrabold text-sky-700 dark:text-sky-300">
                {formatRupiah(totalReceivedToday)}
              </span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
              Rp
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Meja Kasir & Pelunasan ({finishedOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Antrean Masuk & Pemanggilan ({queueOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Chat Front Desk
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {paidSuccessBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>{paidSuccessBanner}</span>
          </div>
          <button onClick={() => setPaidSuccessBanner(null)} className="text-white hover:underline text-xs">
            Tutup
          </button>
        </div>
      )}

      {/* 2. TAB 1: BILLING & PAYMENT PROCESSING */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: List of Finished Units (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Daftar Motor Siap Bayar di Kasir ({finishedOrders.length} Unit)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Pilih untuk memproses</span>
            </div>

            {finishedOrders.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <FileCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Semua unit servis yang selesai telah dilunasi dan diserahkan ke pelanggan.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {finishedOrders.map(order => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedOrder?.id === order.id
                        ? 'border-blue-500 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                        {order.plateNumber}
                      </span>
                      <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                        {formatRupiah(order.totalCost)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>{order.motorModel} • {order.customerName}</span>
                      <span className="text-[11px] text-emerald-600 font-bold">Siap Bayar</span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Mekanik: {order.mechanicName}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallCustomer(order, 'kasir');
                        }}
                        className="text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1 hover:underline"
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>Panggil Suara</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Payment & Receipt Panel (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            {selectedOrder ? (
              <div className="rounded-3xl border border-sky-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">Proses Pembayaran Kasir:</span>
                    <span className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
                      {selectedOrder.plateNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(selectedOrder)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Cetak Nota</span>
                  </button>
                </div>

                {/* Customer Details */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nama Pelanggan:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedOrder.customerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. Telepon / WA:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{selectedOrder.customerPhone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipe Motor:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedOrder.motorModel}</strong>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Biaya Jasa Servis</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatRupiah(selectedOrder.laborCost)}</span>
                  </div>
                  {selectedOrder.partsUsed.map((p, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>{p.quantity}x {p.name}</span>
                      <span className="font-mono">{formatRupiah(p.price * p.quantity)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Total Tagihan:</span>
                    <span className="font-mono text-xl font-extrabold text-blue-600 dark:text-blue-400">
                      {formatRupiah(selectedOrder.totalCost)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Metode Pembayaran:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qris')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'qris'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      <QrCode className="h-4 w-4" />
                      <span>QRIS Dinamis</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('tunai')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'tunai'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      <Banknote className="h-4 w-4" />
                      <span>Tunai (Cash)</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleCompletePayment(selectedOrder.id)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Terima Pelunasan & Serahkan Motor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCallCustomer(selectedOrder, 'kasir')}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-sky-500" />
                    <span>Panggil Ulang Konsumen ke Kasir</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">Pilih salah satu motor yang siap bayar di kolom kiri untuk memproses tagihan kasir.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. TAB 2: QUEUE & CALLS */}
      {activeTab === 'queue' && (
        <div className="rounded-3xl border border-sky-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Antrean Servis Masuk & Panggilan Pelanggan
              </h3>
              <span className="text-xs text-slate-500">
                Panggil konsumen saat Pit Bay siap digunakan untuk pengerjaan servis.
              </span>
            </div>
            {onOpenNewService && (
              <button
                type="button"
                onClick={onOpenNewService}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                + Servis Baru
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {queueOrders.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                      {order.plateNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      ({order.motorModel})
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {order.customerName} • Alokasi Pit Bay #{order.bayNumber} • Masuk: {order.createdAt}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCallCustomer(order, 'pit')}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Panggil Masuk Bay #{order.bayNumber}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB 3: CHAT FRONT DESK */}
      {activeTab === 'chat' && (
        <div className="rounded-3xl border border-sky-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm backdrop-blur-xl">
          <ChatInterface variant="full" initialChannel="#front-desk" />
        </div>
      )}

    </div>
  );
};
