import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { 
  Wrench, 
  LayoutDashboard, 
  CalendarClock, 
  Boxes, 
  Users, 
  FileSpreadsheet, 
  Cpu, 
  Bell, 
  ShieldCheck, 
  ChevronDown,
  Menu,
  X,
  AlertTriangle,
  Navigation,
  Crown,
  Sparkles,
  Settings,
  Lock,
  LogOut,
  CreditCard,
  Search
} from 'lucide-react';
import { ThemeToggle } from './common/ThemeToggle';
import { startAdminTour } from '../utils/interactiveTour';

interface TopNavProps {
  onOpenNotifications: () => void;
  onOpenAdminProfile?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenNotifications, onOpenAdminProfile }) => {
  const { 
    activeView, 
    setActiveView, 
    notifications, 
    currentEmployee, 
    employees, 
    switchCurrentEmployee,
    setMeAsSuperAdmin,
    lowStockCount,
    isAdmin,
    isGuestVisitor,
    loginAsGuest,
    logout
  } = useWorkshop();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Dynamic role-based navigation tabs tailored to each persona
  const navItems = React.useMemo(() => {
    if (isGuestVisitor) {
      return [
        { id: 'dashboard' as const, label: 'Lacak Servis Saya', icon: Search }
      ];
    }

    if (currentEmployee.role === 'Mekanik Senior' || currentEmployee.role === 'Mekanik Lapangan') {
      return [
        { id: 'dashboard' as const, label: 'Konsol Pit Mekanik', icon: Wrench },
        { id: 'services' as const, label: 'Antrean Servis', icon: CalendarClock }
      ];
    }

    if (currentEmployee.role === 'Kasir & Front Desk') {
      return [
        { id: 'dashboard' as const, label: 'Meja Kasir & Servis', icon: CreditCard },
        { id: 'services' as const, label: 'Antrean & Panggilan', icon: CalendarClock },
        { id: 'couriers' as const, label: 'Kurir Jemput-Bola', icon: Navigation }
      ];
    }

    // Super Admin & Kepala Bengkel
    return [
      { id: 'dashboard' as const, label: 'Dashboard Admin', icon: LayoutDashboard },
      { id: 'services' as const, label: 'Servis & Antrean', icon: CalendarClock },
      { id: 'couriers' as const, label: 'Kurir Jemput-Bola', icon: Navigation },
      { id: 'inventory' as const, label: 'Gudang & Stok', icon: Boxes, alertCount: lowStockCount },
      { id: 'employees' as const, label: 'Tim Karyawan', icon: Users, isLocked: !isAdmin },
      { id: 'reports' as const, label: 'Laporan Bulanan', icon: FileSpreadsheet },
      { id: 'rad' as const, label: 'Metode RAD', icon: Cpu }
    ];
  }, [isGuestVisitor, currentEmployee.role, lowStockCount, isAdmin]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl shadow-xs transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.35)] group-hover:bg-sky-600 transition-all duration-200">
              <Wrench className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Moto<span className="text-sky-600 dark:text-sky-400">RAD</span> 
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-300/60 dark:border-sky-500/30">
                  RAD Engine
                </span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav id="tour-top-navigation" className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isLocked = 'isLocked' in item && Boolean(item.isLocked);

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`relative flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
                  isActive 
                    ? 'text-sky-700 dark:text-sky-300 bg-sky-500/15 dark:bg-sky-500/20 border border-sky-300 dark:border-sky-500/40 font-semibold shadow-xs' 
                    : isLocked
                    ? 'text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50/60 dark:hover:bg-amber-950/20 border border-transparent'
                    : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50/70 dark:hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-sky-600 dark:text-sky-400' : isLocked ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
                {isLocked && (
                  <span className="flex items-center gap-0.5 rounded bg-amber-100 dark:bg-amber-950/40 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                    <Lock className="h-2.5 w-2.5" />
                    <span>Admin</span>
                  </span>
                )}
                {'alertCount' in item && item.alertCount && item.alertCount > 0 ? (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500/15 dark:bg-amber-500/25 px-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-400/40">
                    {item.alertCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions (Notification trigger, Theme Toggle & Role Switcher) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme Mode Selector (OS Auto / Light / Dark) */}
          <ThemeToggle />

          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50/60 dark:hover:bg-slate-800/80 transition-all duration-150 focus:outline-none shadow-xs"
            title="Pemberitahuan Sistem & Stok"
            aria-label="Buka notifikasi"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(14,165,233,0.5)]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Quick Tour Button for Staff/Admin */}
          {!isGuestVisitor && (
            <button
              onClick={() => {
                setActiveView('dashboard');
                setTimeout(() => {
                  startAdminTour(true);
                }, 150);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/80 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:border-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-all duration-150 focus:outline-none shadow-xs"
              title="Panduan Tur Dasbor Interaktif (driver.js)"
              aria-label="Panduan Tur Dasbor"
            >
              <Sparkles className="h-4 w-4 text-sky-500 animate-pulse" />
            </button>
          )}

          {/* User / Role Switcher Dropdown */}
          <div id="tour-profile-nav" className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-all duration-150 focus:outline-none shadow-xs ${
                isGuestVisitor
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/90 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200'
                  : currentEmployee.role === 'Super Admin'
                  ? 'border-sky-300 dark:border-sky-800 bg-sky-50/90 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 hover:border-sky-400'
                  : 'border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:border-sky-400 hover:bg-sky-50/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-[11px] border ${
                isGuestVisitor
                  ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 border-emerald-300'
                  : currentEmployee.role === 'Super Admin'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-sky-500/15 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700'
              }`}>
                {isGuestVisitor ? '👤' : currentEmployee.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <span className="max-w-[100px] truncate">{isGuestVisitor ? 'Pengunjung' : currentEmployee.name}</span>
                  {isGuestVisitor ? (
                    <span className="rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-1 py-0.2 text-[9px] font-bold">Tamu</span>
                  ) : currentEmployee.role === 'Super Admin' ? (
                    <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="h-3 w-3 text-sky-600 dark:text-sky-400 shrink-0" />
                  )}
                </div>
                <div className="text-[10px] text-sky-700 dark:text-sky-400 font-mono font-medium">{isGuestVisitor ? 'Portal Pelanggan' : currentEmployee.role}</div>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {roleDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 rounded-xl border border-sky-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-2.5 shadow-2xl backdrop-blur-2xl z-50 text-xs"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{isGuestVisitor ? 'Pengunjung Bengkel' : currentEmployee.name}</span>
                    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold border ${
                      isGuestVisitor
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                        : currentEmployee.role === 'Super Admin'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-sky-100 text-sky-800 border-sky-300'
                    }`}>
                      {isGuestVisitor ? 'Mode Tamu' : currentEmployee.role === 'Super Admin' ? <Crown className="h-3 w-3 text-amber-600 fill-amber-400" /> : null}
                      {isGuestVisitor ? 'Pengunjung' : currentEmployee.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isGuestVisitor ? 'Pelacakan Status Servis Motor Pengunjung' : currentEmployee.email}
                  </div>

                  {isGuestVisitor && (
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          logout();
                        }}
                        className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-2 px-2.5 text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>Login sebagai Staf / Admin</span>
                      </button>
                    </div>
                  )}

                  {/* Open Admin Profile & Tour Buttons */}
                  {!isGuestVisitor && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {onOpenAdminProfile && (
                        <button
                          type="button"
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            onOpenAdminProfile();
                          }}
                          className="w-full rounded-lg border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 py-1.5 px-2 text-[11px] font-bold text-sky-800 dark:text-sky-300 text-center transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Settings className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                          <span>Pusat Kontrol Admin</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          setActiveView('dashboard');
                          setTimeout(() => {
                            startAdminTour(true);
                          }, 150);
                        }}
                        className="w-full rounded-lg border border-sky-300 dark:border-sky-700 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/60 dark:to-blue-950/60 hover:from-sky-100 hover:to-blue-100 dark:hover:from-sky-900 dark:hover:to-blue-900 py-1.5 px-2 text-[11px] font-bold text-sky-800 dark:text-sky-300 text-center transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Sparkles className="h-3 w-3 text-sky-500" />
                        <span>🎯 Panduan Tur Dasbor</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Direct 1-Click "Jadikan Saya Admin" if not already Super Admin and not guest */}
                {!isGuestVisitor && currentEmployee.role !== 'Super Admin' && (
                  <div className="mb-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMeAsSuperAdmin('Nurul Arif', 'nurularif629@gmail.com');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-1.5 px-2.5 text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Crown className="h-3.5 w-3.5 fill-amber-200" />
                      <span>Aktifkan Hak Super Admin</span>
                    </button>
                  </div>
                )}

                <div className="px-1 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Ganti Akun Simulasi Karyawan:
                </div>

                <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
                  {employees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        switchCurrentEmployee(emp.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors ${
                        currentEmployee.id === emp.id 
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold border border-sky-200 dark:border-sky-800' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="truncate">
                        <div className="text-slate-900 dark:text-slate-100 font-medium flex items-center gap-1">
                          <span>{emp.name}</span>
                          {emp.role === 'Super Admin' && (
                            <Crown className="h-3 w-3 text-amber-500 fill-amber-400" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{emp.role}</div>
                      </div>
                      {currentEmployee.id === emp.id && (
                        <div className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_6px_#0284c7]"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Logout Button */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Keluar Akun (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 lg:hidden focus:outline-none"
            aria-label="Menu navigasi"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Tray */}
      {mobileMenuOpen && (
        <div className="border-b border-sky-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 py-3 backdrop-blur-xl lg:hidden shadow-md">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const isLocked = 'isLocked' in item && Boolean(item.isLocked);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    isActive 
                      ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40 font-semibold' 
                      : isLocked
                      ? 'text-slate-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-transparent'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-sky-600 dark:text-sky-400' : isLocked ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                  {isLocked && (
                    <span className="ml-auto rounded bg-amber-100 dark:bg-amber-950/40 px-1 py-0.2 text-[9px] font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                      Admin
                    </span>
                  )}
                  {'alertCount' in item && item.alertCount && item.alertCount > 0 ? (
                    <span className="ml-auto rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-700 dark:text-amber-400 border border-amber-400">
                      {item.alertCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Mobile Tray Logout & Switch */}
          <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Login:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentEmployee.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                isAdmin ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700' : 'bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800'
              }`}>
                {isAdmin ? 'Admin' : 'Karyawan'}
              </span>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
