import { driver, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const ADMIN_TOUR_STORAGE_KEY = 'motorad_admin_tour_completed_v1';
export const ADMIN_TOUR_FORCE_TRIGGER_KEY = 'motorad_trigger_admin_tour';

let activeDriverInstance: Driver | null = null;

export interface TourConfigOptions {
  force?: boolean;
  onComplete?: () => void;
  onStepChange?: (stepIndex: number) => void;
}

export const isTourCompleted = (): boolean => {
  try {
    return localStorage.getItem(ADMIN_TOUR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const markTourCompleted = (): void => {
  try {
    localStorage.setItem(ADMIN_TOUR_STORAGE_KEY, 'true');
    sessionStorage.removeItem(ADMIN_TOUR_FORCE_TRIGGER_KEY);
  } catch {}
};

export const resetTourState = (): void => {
  try {
    localStorage.removeItem(ADMIN_TOUR_STORAGE_KEY);
    sessionStorage.setItem(ADMIN_TOUR_FORCE_TRIGGER_KEY, 'true');
  } catch {}
};

/**
 * Initiates the interactive guided tour of MotoRAD Dashboard using driver.js
 */
export const startAdminTour = (
  param?: boolean | TourConfigOptions,
  optionalCallback?: () => void
): Driver | null => {
  if (typeof window === 'undefined') return null;

  let force = false;
  let onComplete: (() => void) | undefined;

  if (typeof param === 'boolean') {
    force = param;
    onComplete = optionalCallback;
  } else if (param && typeof param === 'object') {
    force = Boolean(param.force);
    onComplete = param.onComplete;
  }

  // Check if tour should run
  const hasCompleted = isTourCompleted();
  const hasSessionForce = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(ADMIN_TOUR_FORCE_TRIGGER_KEY) === 'true';
  
  if (!force && hasCompleted && !hasSessionForce) {
    return null;
  }

  // Destroy previous instance if still active
  if (activeDriverInstance) {
    try {
      activeDriverInstance.destroy();
    } catch {}
    activeDriverInstance = null;
  }

  const driverObj = driver({
    showProgress: true,
    animate: true,
    smoothScroll: true,
    allowClose: true,
    stagePadding: 6,
    stageRadius: 16,
    overlayColor: '#090d16',
    overlayOpacity: 0.72,
    nextBtnText: 'Lanjut →',
    prevBtnText: '← Kembali',
    doneBtnText: 'Selesai & Mulai 🚀',
    progressText: 'Langkah {{current}} dari {{total}}',
    popoverClass: 'motorad-driver-popover',
    steps: [
      {
        element: '#tour-admin-header',
        popover: {
          title: '🛡️ Selamat Datang di Dasbor MotoRAD!',
          description: 'Pusat kendali operasional bengkel motor modern. Pantau sinkronisasi data real-time, status wewenang admin, dan ringkasan kondisi bengkel secara terintegrasi.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-mode-switcher',
        popover: {
          title: '🔄 Pengalih Mode Tampilan Cepat',
          description: 'Beralih instan antara Dasbor Admin (manajemen), Lacak Plat Pengunjung (tamu), Monitor Layar Antrean TV, Chat Karyawan, atau Pemindai QR Nota Fisik.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-quick-actions',
        popover: {
          title: '⚡ Aksi Cepat Manajemen Bengkel',
          description: 'Akses cepat untuk mendaftarkan servis motor masuk baru (+ Servis Masuk Baru), mengelola stok suku cadang gudang, roster teknisi, atau buka panduan tur ini.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-kpi-metrics',
        popover: {
          title: '📊 Kartu Metrik Utama & Finansial',
          description: 'Pantau Omset Bulan Ini dan estimasi laba kotor, unit yang sedang dikerjakan di pit vs antrean, peringatan stok kritis, serta indeks kepuasan pelanggan.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-pit-bays',
        popover: {
          title: '🔧 Monitoring 4 Pit Servis Real-Time',
          description: 'Pantau status pengerjaan teknisi di Bay 1 hingga 4 secara live: plat nomor motor, tipe motor, mekanik bertugas, estimasi menit selesai, dan tombol detail servis.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#tour-queues',
        popover: {
          title: '⏳ Antrean Menunggu & Unit Siap Kasir',
          description: 'Kelola urutan giliran motor yang menunggu masuk pit, serta pantau motor yang sudah rampung diservis dan siap diambil di meja kasir.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#tour-chat-interface',
        popover: {
          title: '💬 Komunikasi Karyawan Real-Time',
          description: 'Saluran obrolan instan antar tim bengkel via WebSocket terhubung ke channel #general, #service-bay, #spareparts, #front-desk dengan indikator status online.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#tour-top-navigation',
        popover: {
          title: '🧭 Navigasi Menu Utama Sistem',
          description: 'Akses seluruh modul operasional: Servis & Antrean, Pelacakan Kurir, Gudang Suku Cadang, Roster Karyawan, Laporan Keuangan, dan Metodologi RAD.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-profile-nav',
        popover: {
          title: '👤 Profil Pengguna & Kontrol Akses',
          description: 'Kelola akun Super Admin, ganti simulasi staf, akses Pusat Kontrol Bengkel, atau jalankan kembali Panduan Tur Interaktif ini kapan saja Anda butuhkan!',
          side: 'bottom',
          align: 'end'
        }
      }
    ],
    onDestroyed: () => {
      markTourCompleted();
      activeDriverInstance = null;
      if (onComplete) {
        onComplete();
      }
    }
  });

  activeDriverInstance = driverObj;
  driverObj.drive();
  return driverObj;
};
