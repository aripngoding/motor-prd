import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { 
  X, 
  Bell, 
  Check, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotification,
    triggerPushNotification,
    setActiveView
  } = useWorkshop();

  if (!isOpen) return null;

  const handleSimulateCriticalStock = () => {
    triggerPushNotification(
      'Simulasi: Stok Kritis Kampas Rem Belakang',
      'Stok Kampas Rem Belakang Tromol AHM tersisa 1 set di Rak B-02 (Batas minimum: 8 set). Segera reorder supplier!',
      'critical_stock'
    );
  };

  const handleSimulateServiceArrival = () => {
    triggerPushNotification(
      'Simulasi: Booking Servis Baru Masuk',
      'Pelanggan Ahmad Fauzi mendaftarkan Honda ADV 160 (B 4991 TZX) untuk Overhaul CVT & Tune Up.',
      'service_update'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-sky-200 bg-white/95 p-5 shadow-[0_20px_60px_rgba(14,165,233,0.2)] backdrop-blur-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 border border-sky-300 text-sky-600">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Pusat Notifikasi Real-Time
                <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-300">
                  {notifications.filter(n => !n.read).length} Baru
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Peringatan otomatis stok menipis & pergerakan servis motor</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Simulation Bar */}
        <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50/60 p-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 mb-1.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Pengujian Cepat (RAD Simulator)
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSimulateCriticalStock}
              className="rounded-lg bg-amber-500/15 border border-amber-300 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-500/25 transition-colors"
            >
              + Trigger Notif Stok Kritis
            </button>
            <button
              onClick={handleSimulateServiceArrival}
              className="rounded-lg bg-sky-500/15 border border-sky-300 px-2.5 py-1 text-[11px] font-semibold text-sky-800 hover:bg-sky-500/25 transition-colors"
            >
              + Trigger Notif Servis Baru
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="text-slate-500 font-medium">Total {notifications.length} pemberitahuan</span>
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Tandai Semua Dibaca</span>
          </button>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Tidak ada notifikasi saat ini.
            </div>
          ) : (
            notifications.map((n) => {
              const isCritical = n.type === 'critical_stock';
              return (
                <div
                  key={n.id}
                  className={`group relative rounded-xl border p-3 transition-all ${
                    !n.read 
                      ? 'border-sky-300 bg-white shadow-sm' 
                      : 'border-slate-200 bg-slate-50/70 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                        isCritical 
                          ? 'bg-amber-100 text-amber-600 border border-amber-300' 
                          : 'bg-sky-100 text-sky-600 border border-sky-300'
                      }`}>
                        {isCritical ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className={`text-xs font-bold ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {n.title}
                          </h4>
                          {!n.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{n.timestamp}</span>
                          {isCritical && (
                            <button
                              onClick={() => {
                                setActiveView('inventory');
                                onClose();
                              }}
                              className="text-sky-600 font-semibold hover:underline flex items-center gap-0.5"
                            >
                              Buka Gudang <ExternalLink className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <button
                          onClick={() => markNotificationAsRead(n.id)}
                          className="p-1 text-slate-400 hover:text-sky-600"
                          title="Tandai dibaca"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => clearNotification(n.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 border-t border-slate-100 pt-3 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
