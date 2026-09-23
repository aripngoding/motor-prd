import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Wrench, 
  X, 
  ArrowRight,
  Radio
} from 'lucide-react';

export const PushNotificationBanner: React.FC = () => {
  const { activeBannerNotification, dismissBanner, setActiveView } = useWorkshop();

  if (!activeBannerNotification) return null;

  const getIcon = () => {
    switch (activeBannerNotification.type) {
      case 'critical_stock':
        return <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />;
      case 'service_update':
        return <CheckCircle2 className="h-5 w-5 text-sky-500" />;
      case 'mechanic_alert':
        return <Wrench className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-sky-500" />;
    }
  };

  const handleAction = () => {
    if (activeBannerNotification.type === 'critical_stock') {
      setActiveView('inventory');
    } else if (activeBannerNotification.type === 'service_update' || activeBannerNotification.type === 'mechanic_alert') {
      setActiveView('services');
    }
    dismissBanner();
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-sky-300 bg-white/95 p-4 shadow-[0_10px_35px_-5px_rgba(14,165,233,0.18)] backdrop-blur-xl transition-all duration-300">
      {/* Subtle glowing accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400"></div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 border border-sky-200">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                <Radio className="h-3 w-3 animate-pulse text-sky-500" />
                Push Notification Real-Time
              </span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">{activeBannerNotification.timestamp}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
              {activeBannerNotification.title}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
              {activeBannerNotification.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={handleAction}
            className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-600 transition-all duration-150 shadow-[0_0_12px_rgba(14,165,233,0.35)]"
          >
            <span>Akses Cepat</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          
          <button
            onClick={dismissBanner}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Tutup notifikasi ini"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
