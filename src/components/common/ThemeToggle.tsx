import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Laptop, 
  Check, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  showLabel = false,
  className = ''
}) => {
  const { 
    themePreference, 
    resolvedTheme, 
    setThemePreference 
  } = useWorkshop();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const getActiveIcon = () => {
    if (themePreference === 'system') {
      return <Laptop className="h-4 w-4 text-sky-500 dark:text-sky-400" />;
    }
    if (themePreference === 'dark') {
      return <Moon className="h-4 w-4 text-sky-400" />;
    }
    return <Sun className="h-4 w-4 text-amber-500" />;
  };

  const getThemeTitle = () => {
    if (themePreference === 'system') {
      return `Sistem (${resolvedTheme === 'dark' ? 'Gelap' : 'Terang'})`;
    }
    if (themePreference === 'dark') {
      return 'Gelap';
    }
    return 'Terang';
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-2.5 text-slate-700 dark:text-slate-300 hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50/60 dark:hover:bg-slate-800/80 transition-all duration-150 focus:outline-none shadow-xs"
        title={`Tema Tampilan: ${getThemeTitle()}`}
        aria-label="Pilih tema tampilan"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-center">
          {getActiveIcon()}
        </div>

        {showLabel && (
          <span className="text-xs font-semibold hidden md:inline-block">
            {getThemeTitle()}
          </span>
        )}

        {themePreference === 'system' && (
          <span 
            className="flex h-1.5 w-1.5 rounded-full bg-sky-500 shadow-[0_0_6px_#0ea5e9]"
            title="Deteksi Sistem OS Aktif"
          />
        )}

        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-sky-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-2 shadow-2xl backdrop-blur-2xl z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
          
          <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Pilihan Tema Glassmorphism
            </span>
            <span className="flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 font-medium">
              <Sparkles className="h-3 w-3" />
              <span>Auto Sync</span>
            </span>
          </div>

          <div className="space-y-1">
            {/* 1. Sistem OS (Default) */}
            <button
              type="button"
              onClick={() => {
                setThemePreference('system');
                setIsOpen(false);
              }}
              className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                themePreference === 'system'
                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800/60 font-semibold'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 mt-0.5">
                <Laptop className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Sistem Otomatis</span>
                  {themePreference === 'system' && (
                    <Check className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  Sinkron dengan OS ({resolvedTheme === 'dark' ? 'Mode Gelap Aktif' : 'Mode Terang Aktif'})
                </p>
              </div>
            </button>

            {/* 2. Light Mode */}
            <button
              type="button"
              onClick={() => {
                setThemePreference('light');
                setIsOpen(false);
              }}
              className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                themePreference === 'light'
                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 font-semibold'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mt-0.5">
                <Sun className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Mode Terang (Light)</span>
                  {themePreference === 'light' && (
                    <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  Nuansa putih bersih & aksen cyan glassmorphism
                </p>
              </div>
            </button>

            {/* 3. Dark Mode */}
            <button
              type="button"
              onClick={() => {
                setThemePreference('dark');
                setIsOpen(false);
              }}
              className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                themePreference === 'dark'
                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800/60 font-semibold'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 text-sky-500 dark:text-sky-400 mt-0.5">
                <Moon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Mode Gelap (Dark)</span>
                  {themePreference === 'dark' && (
                    <Check className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  Nuansa deep slate neon blue hemat daya
                </p>
              </div>
            </button>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-2 text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Status saat ini:</span>
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
              {resolvedTheme.toUpperCase()}
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
