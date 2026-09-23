import React from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Crown, 
  ArrowLeft, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  Users,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Employee } from '../../types';

interface EmployeeAccessDeniedProps {
  currentEmployee: Employee;
  onBackToDashboard: () => void;
  onSwitchToAdmin: () => void;
  onLogout: () => void;
}

export const EmployeeAccessDenied: React.FC<EmployeeAccessDeniedProps> = ({
  currentEmployee,
  onBackToDashboard,
  onSwitchToAdmin,
  onLogout
}) => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="rounded-3xl border border-amber-300 bg-white/95 p-6 sm:p-9 shadow-xl backdrop-blur-xl text-center relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Lock Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-xl shadow-amber-500/30 mb-5 border-4 border-white ring-4 ring-amber-300/40">
          <Lock className="h-10 w-10 text-white" />
        </div>

        {/* Main Badge & Title */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300 mb-3">
          <ShieldAlert className="h-4 w-4 text-amber-700" />
          <span>Akses Terbatas: Khusus Hak Akses Administrator</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
          Halaman Manajemen Karyawan Dikunci
        </h2>

        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Fitur penambahan staf, pengubahan data teknisi, dan konfigurasi wewenang sistem (RBAC) hanya dapat dikelola oleh akun pemilik bengkel berstatus <strong>Super Admin</strong>.
        </p>

        {/* Current Active Account Card */}
        <div className="my-6 max-w-lg mx-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Identitas Akun Aktif Saat Ini:
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 font-bold text-sm border border-sky-200">
                {currentEmployee.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span>{currentEmployee.name}</span>
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                    Karyawan
                  </span>
                </div>
                <div className="text-xs text-slate-500">{currentEmployee.email}</div>
                <div className="text-[11px] font-mono font-medium text-sky-700 mt-0.5">
                  Jabatan: {currentEmployee.role}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-800 border border-rose-300">
                <XCircle className="h-3.5 w-3.5 text-rose-600" />
                <span>Admin Izin: Nonaktif</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hak Akses Breakdown Table */}
        <div className="my-6 max-w-lg mx-auto rounded-2xl border border-slate-200/80 bg-white p-4 text-left text-xs">
          <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>Matriks Batasan Hak Akses:</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-700 py-1 border-b border-slate-100">
              <span>Mengelola Antrean & Tiket Servis Motor</span>
              <span className="flex items-center gap-1 font-bold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Diizinkan
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700 py-1 border-b border-slate-100">
              <span>Melihat Inventaris Suku Cadang Bengkel</span>
              <span className="flex items-center gap-1 font-bold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Diizinkan
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700 py-1 border-b border-slate-100">
              <span>Pelacakan Armada Kurir Jemput-Bola</span>
              <span className="flex items-center gap-1 font-bold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Diizinkan
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700 py-1 bg-rose-50/50 px-2 rounded-lg">
              <span className="font-semibold text-rose-900">Manajemen Karyawan, Gaji & RBAC</span>
              <span className="flex items-center gap-1 font-bold text-rose-600">
                <XCircle className="h-3.5 w-3.5" /> Khusus Admin
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onSwitchToAdmin}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-5 py-2.5 text-xs shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Crown className="h-4 w-4 fill-amber-200" />
            <span>Login Sebagai Super Admin (Nurul Arif)</span>
          </button>

          <button
            type="button"
            onClick={onBackToDashboard}
            className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Dashboard</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full sm:w-auto rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-4 py-2.5 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Akun</span>
          </button>
        </div>

      </div>
    </div>
  );
};
