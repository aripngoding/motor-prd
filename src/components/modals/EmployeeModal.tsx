import React, { useState, useEffect } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { X, Users, ShieldCheck, Check, Star } from 'lucide-react';
import { Employee, EmployeeRole, EmployeePermissions } from '../../types';

interface EmployeeModalProps {
  isOpen: boolean;
  employeeToEdit: Employee | null;
  onClose: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ 
  isOpen, 
  employeeToEdit, 
  onClose 
}) => {
  const { addEmployee, updateEmployee } = useWorkshop();

  const [name, setName] = useState('');
  const [role, setRole] = useState<EmployeeRole>('Mekanik Senior');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('Injeksi & Kelistrikan Motor');
  const [status, setStatus] = useState<'Bertugas' | 'Aktif' | 'Cuti'>('Aktif');
  
  const [permissions, setPermissions] = useState<EmployeePermissions>({
    canManageInventory: true,
    canManageServices: true,
    canExportReports: false,
    canManageEmployees: false,
    canConfigureRAD: false
  });

  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name);
      setRole(employeeToEdit.role);
      setEmail(employeeToEdit.email);
      setPhone(employeeToEdit.phone);
      setSpecialization(employeeToEdit.specialization);
      setStatus(employeeToEdit.status);
      setPermissions(employeeToEdit.permissions);
    } else {
      setName('');
      setRole('Mekanik Lapangan');
      setEmail('');
      setPhone('');
      setSpecialization('Tune Up & Servis Rutin');
      setStatus('Aktif');
      setPermissions({
        canManageInventory: false,
        canManageServices: true,
        canExportReports: false,
        canManageEmployees: false,
        canConfigureRAD: false
      });
    }
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: EmployeeRole) => {
    setRole(newRole);
    if (newRole === 'Super Admin') {
      setPermissions({
        canManageInventory: true,
        canManageServices: true,
        canExportReports: true,
        canManageEmployees: true,
        canConfigureRAD: true
      });
    } else if (newRole === 'Kepala Bengkel') {
      setPermissions({
        canManageInventory: true,
        canManageServices: true,
        canExportReports: true,
        canManageEmployees: true,
        canConfigureRAD: true
      });
    } else if (newRole === 'Kasir & Front Desk') {
      setPermissions({
        canManageInventory: false,
        canManageServices: true,
        canExportReports: true,
        canManageEmployees: false,
        canConfigureRAD: false
      });
    } else {
      // Mekanik
      setPermissions({
        canManageInventory: true,
        canManageServices: true,
        canExportReports: false,
        canManageEmployees: false,
        canConfigureRAD: false
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Nama karyawan wajib diisi!');
      return;
    }

    if (employeeToEdit) {
      updateEmployee(employeeToEdit.id, {
        name,
        role,
        email,
        phone,
        specialization,
        status,
        permissions
      });
    } else {
      addEmployee({
        name,
        role,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@motorad.id`,
        phone: phone || '0812-xxxx-xxxx',
        specialization,
        status,
        rating: 4.8,
        completedJobs: 0,
        permissions
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-sky-300 bg-white/95 p-5 sm:p-6 shadow-[0_25px_60px_rgba(14,165,233,0.2)] backdrop-blur-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 border border-sky-300 text-sky-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {employeeToEdit ? 'Edit Karyawan & Wewenang Akses' : 'Tambah Karyawan Bengkel Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Pengaturan peran, spesialisasi mekanik, dan izin modul (RBAC)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap <span className="text-sky-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Dedi Kurniawan"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Peran / Jabatan
              </label>
              <select
                value={role}
                onChange={e => handleRoleChange(e.target.value as EmployeeRole)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Kepala Bengkel">Kepala Bengkel</option>
                <option value="Mekanik Senior">Mekanik Senior</option>
                <option value="Mekanik Lapangan">Mekanik Lapangan</option>
                <option value="Kasir & Frontdesk">Kasir & Frontdesk</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Tugas
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              >
                <option value="Bertugas">Bertugas di Bay</option>
                <option value="Aktif">Aktif / Standby</option>
                <option value="Cuti">Cuti / Izin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="dedi@motorad.id"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No. Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0813-xxxx-xxxx"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Spesialisasi Keahlian Teknis
            </label>
            <input
              type="text"
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              placeholder="Contoh: Setting ECU Injeksi, Reset Throttle, Overhaul CVT"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
            />
          </div>

          {/* Matriks Hak Akses (Permissions) */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3 text-xs">
            <span className="text-[10px] text-sky-800 font-bold uppercase tracking-wider block mb-2">
              Hak Akses Wewenang Sistem (RBAC)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'canManageInventory', label: 'Kelola Suku Cadang & Restock' },
                { key: 'canManageServices', label: 'Buat & Kelola Tiket Servis' },
                { key: 'canExportReports', label: 'Ekspor Laporan Keuangan' },
                { key: 'canManageEmployees', label: 'Kelola Akses Karyawan Lain' }
              ].map(item => {
                const checked = permissions[item.key as keyof EmployeePermissions];
                return (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setPermissions((prev: EmployeePermissions) => ({
                        ...prev,
                        [item.key]: !prev[item.key as keyof EmployeePermissions]
                      }))}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-[11px] text-slate-700 font-medium">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 px-5 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.35)] transition-all"
            >
              <Check className="h-4 w-4" />
              <span>Simpan Karyawan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
