import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Shield, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Phone, 
  Mail, 
  Wrench,
  Sparkles,
  Crown,
  Zap,
  Settings
} from 'lucide-react';
import { Employee } from '../types';
import { EmployeeAccessDenied } from './auth/EmployeeAccessDenied';

interface EmployeesViewProps {
  onOpenEmployeeModal: (employee?: Employee) => void;
  onOpenAdminProfile?: () => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({ 
  onOpenEmployeeModal,
  onOpenAdminProfile 
}) => {
  const { 
    employees, 
    currentEmployee, 
    isAdmin,
    switchCurrentEmployee,
    setMeAsSuperAdmin,
    setActiveView,
    logout
  } = useWorkshop();

  // Access Control Guard: Only Admin can access Employee Management
  if (!isAdmin) {
    return (
      <EmployeeAccessDenied
        currentEmployee={currentEmployee}
        onBackToDashboard={() => setActiveView('dashboard')}
        onSwitchToAdmin={() => setMeAsSuperAdmin('Nurul Arif', 'nurularif629@gmail.com')}
        onLogout={logout}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-sky-600" />
            Manajemen Karyawan & Kontrol Hak Akses (RBAC)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengelolaan tugas mekanik, staf administrasi, serta pengaturan hak akses ke modul bengkel
          </p>
        </div>

        <button
          onClick={() => onOpenEmployeeModal()}
          className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.35)] transition-all self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Tambah Karyawan Baru</span>
        </button>
      </div>

      {/* Interactive Role Simulator & Super Admin Control Center */}
      <div className={`rounded-2xl border p-4 backdrop-blur-xl shadow-xs transition-all ${
        currentEmployee.role === 'Super Admin'
          ? 'border-amber-300 bg-gradient-to-r from-amber-50/90 via-sky-50/70 to-blue-50/50'
          : 'border-sky-300 bg-sky-50/70'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs ${
              currentEmployee.role === 'Super Admin'
                ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-amber-500/30'
                : 'bg-sky-500 text-white'
            }`}>
              {currentEmployee.role === 'Super Admin' ? (
                <Crown className="h-6 w-6 text-amber-100 fill-amber-200" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex flex-wrap items-center gap-2">
                <span>{currentEmployee.role === 'Super Admin' ? 'Status Login Anda:' : 'Mode Simulasi Staf:'}</span>
                <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold border flex items-center gap-1 ${
                  currentEmployee.role === 'Super Admin'
                    ? 'bg-amber-100 text-amber-950 border-amber-300'
                    : 'bg-sky-100 text-sky-800 border-sky-300'
                }`}>
                  {currentEmployee.role === 'Super Admin' && <Crown className="h-3.5 w-3.5 text-amber-600 fill-amber-400" />}
                  <span>{currentEmployee.name} ({currentEmployee.role})</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">{currentEmployee.email}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {currentEmployee.role === 'Super Admin'
                  ? 'Anda memegang kendali penuh atas seluruh modul: tiket servis, restock suku cadang, karyawan, laporan laba, & tracking kurir.'
                  : 'Anda sedang berada dalam mode batasan hak akses. Klik tombol di kanan untuk mengaktifkan kembali akun Super Admin Anda.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {currentEmployee.role === 'Super Admin' ? (
              onOpenAdminProfile && (
                <button
                  type="button"
                  onClick={onOpenAdminProfile}
                  className="rounded-xl border border-sky-300 bg-white hover:bg-sky-50 text-sky-800 text-xs font-bold px-3.5 py-2 shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5 text-sky-600" />
                  <span>Kelola Akun Admin</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => setMeAsSuperAdmin('Nurul Arif', 'nurularif629@gmail.com')}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold px-4 py-2 shadow-sm transition-all flex items-center gap-1.5"
              >
                <Crown className="h-4 w-4 fill-amber-200" />
                <span>Jadikan Saya Super Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {employees.map((emp) => {
          const isCurrent = currentEmployee.id === emp.id;
          const isSuperAdmin = emp.role === 'Super Admin';
          return (
            <div
              key={emp.id}
              className={`glass-panel rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 ${
                isSuperAdmin
                  ? 'border-amber-300 ring-1 ring-amber-300/60 bg-gradient-to-b from-amber-50/30 via-white to-white shadow-md'
                  : isCurrent 
                  ? 'border-sky-400 bg-white shadow-md' 
                  : 'hover:border-sky-300 bg-white/85'
              }`}
            >
              <div>
                {/* Top badge & avatar */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`relative h-12 w-12 rounded-xl overflow-hidden border shadow-xs ${
                      isSuperAdmin 
                        ? 'border-amber-300 bg-amber-50 ring-1 ring-amber-200' 
                        : 'border-sky-200 bg-slate-100'
                    }`}>
                      {emp.avatarUrl ? (
                        <img
                          src={emp.avatarUrl}
                          alt={emp.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center font-bold text-base ${
                          isSuperAdmin ? 'text-amber-800' : 'text-sky-700'
                        }`}>
                          {emp.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {emp.name}
                        {isSuperAdmin && (
                          <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-400 shrink-0" />
                        )}
                        {isCurrent && (
                          <span className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_6px_#0284c7]"></span>
                        )}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`inline-block text-[11px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                          isSuperAdmin 
                            ? 'bg-amber-100 text-amber-900 border-amber-300' 
                            : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}>
                          {emp.role}
                        </span>
                        {isSuperAdmin && (
                          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                            Utama
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                    emp.status === 'Bertugas' 
                      ? 'bg-sky-100 text-sky-800 border-sky-300' 
                      : emp.status === 'Aktif' 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {emp.status}
                  </span>
                </div>

                {/* Contact & Specs */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span className="truncate font-medium">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span className="font-mono font-medium">{emp.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1 text-slate-700">
                    <Wrench className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">{emp.specialization}</span>
                  </div>
                </div>

                {/* Rating & Workload */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Rating Kerja</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1 font-mono mt-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      {emp.rating} / 5.0
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Servis Selesai</span>
                    <span className="font-bold font-mono text-sky-700 mt-0.5 block">
                      {emp.completedJobs} Motor
                    </span>
                  </div>
                </div>

                {/* Permissions quick pills */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Otoritas Sistem (Permissions)
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <span className={`flex items-center gap-1 font-medium ${emp.permissions.canManageInventory ? 'text-sky-700' : 'text-slate-300 line-through'}`}>
                      {emp.permissions.canManageInventory ? <CheckCircle2 className="h-3 w-3 text-sky-600" /> : <XCircle className="h-3 w-3" />}
                      Kelola Suku Cadang
                    </span>
                    <span className={`flex items-center gap-1 font-medium ${emp.permissions.canManageServices ? 'text-sky-700' : 'text-slate-300 line-through'}`}>
                      {emp.permissions.canManageServices ? <CheckCircle2 className="h-3 w-3 text-sky-600" /> : <XCircle className="h-3 w-3" />}
                      Servis & Tiket
                    </span>
                    <span className={`flex items-center gap-1 font-medium ${emp.permissions.canExportReports ? 'text-sky-700' : 'text-slate-300 line-through'}`}>
                      {emp.permissions.canExportReports ? <CheckCircle2 className="h-3 w-3 text-sky-600" /> : <XCircle className="h-3 w-3" />}
                      Ekspor Laporan
                    </span>
                    <span className={`flex items-center gap-1 font-medium ${emp.permissions.canManageEmployees ? 'text-sky-700' : 'text-slate-300 line-through'}`}>
                      {emp.permissions.canManageEmployees ? <CheckCircle2 className="h-3 w-3 text-sky-600" /> : <XCircle className="h-3 w-3" />}
                      Akses Admin
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {isSuperAdmin && onOpenAdminProfile ? (
                  <button
                    onClick={onOpenAdminProfile}
                    className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-bold transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-amber-600" />
                    <span>Profil Admin</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenEmployeeModal(emp)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-sky-700 font-semibold transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Akses</span>
                  </button>
                )}

                <button
                  onClick={() => switchCurrentEmployee(emp.id)}
                  disabled={isCurrent}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    isCurrent
                      ? isSuperAdmin
                        ? 'bg-amber-100 text-amber-950 border border-amber-300 cursor-default'
                        : 'bg-sky-50 text-sky-800 border border-sky-300 cursor-default'
                      : isSuperAdmin
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs font-bold'
                      : 'bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 shadow-xs'
                  }`}
                >
                  {isCurrent ? (isSuperAdmin ? '👑 Super Admin Aktif' : 'Profil Aktif') : 'Simulasi Login'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
