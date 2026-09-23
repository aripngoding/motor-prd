import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Crown, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Sparkles, 
  Lock, 
  Check,
  Zap,
  Layers,
  Wrench,
  FileSpreadsheet,
  Boxes,
  Navigation
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentEmployee, employees, setMeAsSuperAdmin, switchCurrentEmployee } = useWorkshop();

  // Find admin employee if already in list
  const existingAdmin = employees.find(
    e => e.role === 'Super Admin' || e.email === 'nurularif629@gmail.com' || e.name === 'Nurul Arif'
  ) || currentEmployee;

  const [adminName, setAdminName] = useState(existingAdmin?.name || 'Nurul Arif');
  const [adminEmail, setAdminEmail] = useState(existingAdmin?.email || 'nurularif629@gmail.com');
  const [adminPhone, setAdminPhone] = useState(existingAdmin?.phone || '0812-8899-0011');
  const [adminTitle, setAdminTitle] = useState(existingAdmin?.specialization || 'Pemilik & Super Administrator Bengkel MotoRAD');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (existingAdmin) {
      setAdminName(existingAdmin.name);
      setAdminEmail(existingAdmin.email);
      setAdminPhone(existingAdmin.phone);
      setAdminTitle(existingAdmin.specialization || 'Pemilik & Super Administrator Bengkel MotoRAD');
    }
  }, [existingAdmin, isOpen]);

  if (!isOpen) return null;

  const isCurrentSuperAdmin = currentEmployee.role === 'Super Admin';

  const handleActivateSuperAdmin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMeAsSuperAdmin(adminName, adminEmail);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const adminPermissions = [
    {
      title: 'Manajemen Servis & Pit Bay',
      desc: 'Buat, ubah status, diagnosa, dan selesaikan tiket servis di semua Bay 1-4',
      icon: Wrench,
      active: true
    },
    {
      title: 'Kontrol Suku Cadang & Gudang',
      desc: 'Tambah suku cadang, restock, edit harga beli/jual, dan notifikasi stok tipis',
      icon: Boxes,
      active: true
    },
    {
      title: 'Manajemen Karyawan & Hak Akses (RBAC)',
      desc: 'Tambah staf baru, atur shift kerja, ubah spesialisasi mekanik, dan atur izin role',
      icon: User,
      active: true
    },
    {
      title: 'Laporan Keuangan & Omzet',
      desc: 'Akses penuh laporan laba kotor bulanan, omzet jasa, suku cadang, & ekspor cetak/PDF',
      icon: FileSpreadsheet,
      active: true
    },
    {
      title: 'Fleet Tracking Kurir Jemput-Bola',
      desc: 'Pantau kurir secara real-time di peta Leaflet GPS, assign tugas penjemputan motor baru',
      icon: Navigation,
      active: true
    },
    {
      title: 'Arsitektur Metodologi RAD & Sistem',
      desc: 'Akses blueprint prototyping cepat 4-fase RAD, reset dataset demonstrasi, & sistem',
      icon: Layers,
      active: true
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-sky-300 bg-white/95 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl my-6 transition-all">
        
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white shadow-lg shadow-sky-500/25 border-2 border-white ring-2 ring-sky-300">
              <Crown className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Pusat Kontrol Akun Super Admin
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-300">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Wewenang Penuh
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Akun administrator utama sistem manajemen bengkel MotoRAD Engine
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current Active Status Alert Banner */}
        <div className={`mb-5 rounded-xl p-3.5 border transition-all ${
          isCurrentSuperAdmin
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
            : 'bg-amber-50/90 border-amber-300 text-amber-900'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {isCurrentSuperAdmin ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
              )}
              <div className="text-xs">
                <span className="font-bold block">
                  {isCurrentSuperAdmin 
                    ? 'Status: Anda Saat Ini Sudah Login Sebagai Super Admin' 
                    : 'Status: Anda Sedang Dalam Mode Akun Staf / Belum Mengaktifkan Hak Admin'}
                </span>
                <span className="text-[11px] opacity-90">
                  Akun: <strong>{currentEmployee.name}</strong> ({currentEmployee.email}) — Role: <strong>{currentEmployee.role}</strong>
                </span>
              </div>
            </div>

            {!isCurrentSuperAdmin && (
              <button
                type="button"
                onClick={() => handleActivateSuperAdmin()}
                className="shrink-0 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 shadow-sm transition-all flex items-center gap-1"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Jadikan Saya Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Form Profil Admin */}
        <form onSubmit={handleActivateSuperAdmin} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-sky-600" />
                Nama Super Admin
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                placeholder="Nurul Arif"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-sky-600" />
                Email Akun Admin
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="nurularif629@gmail.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-sky-600" />
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={adminPhone}
                onChange={e => setAdminPhone(e.target.value)}
                placeholder="0812-8899-0011"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-sky-600" />
                Jabatan & Otoritas
              </label>
              <input
                type="text"
                value={adminTitle}
                onChange={e => setAdminTitle(e.target.value)}
                placeholder="Pemilik & Super Administrator Bengkel"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Matrix Otoritas Hak Akses Admin (RBAC Overview) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-sky-600" />
                Daftar Hak Akses & Otoritas Super Admin (6/6 Aktif)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                Full Root Access
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {adminPermissions.map((perm, idx) => {
                const Icon = perm.icon;
                return (
                  <div 
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-left"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 mt-0.5">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                        <span>{perm.title}</span>
                        <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                      </div>
                      <div className="text-[10px] text-slate-500 leading-snug mt-0.5">
                        {perm.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-sky-600" />
              <span>Semua data dan perubahan disimpan otomatis ke penyimpanan lokal browser.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
              
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white px-5 py-2 text-xs font-bold shadow-[0_0_15px_rgba(14,165,233,0.35)] transition-all flex items-center gap-1.5"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>Admin Diaktifkan!</span>
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 text-amber-300" />
                    <span>Jadikan & Aktifkan Super Admin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
