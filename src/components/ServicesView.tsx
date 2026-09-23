import React, { useState, useMemo } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { 
  Plus, 
  Search, 
  Filter, 
  CalendarClock, 
  Calendar,
  Clock, 
  Wrench, 
  UserCheck,
  CheckCircle2, 
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  Layers,
  Table as TableIcon,
  RotateCcw,
  X,
  ArrowUpDown,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { ServiceOrder, ServiceStatus } from '../types';
import { formatRupiah, formatDateTimeID, formatDateID } from '../utils/formatters';
import { exportServiceInvoiceToPDF } from '../utils/exportReports';

interface ServicesViewProps {
  onOpenNewService: () => void;
  onSelectService: (service: ServiceOrder) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ 
  onOpenNewService, 
  onSelectService 
}) => {
  const { services, employees } = useWorkshop();

  // Filter & Search States
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // NEW: Date Range Filter States
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [datePreset, setDatePreset] = useState<string>('all');

  // NEW: Mechanic Filter State
  const [selectedMechanic, setSelectedMechanic] = useState<string>('Semua');

  // Sorting State
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'cost_high' | 'cost_low'>('newest');

  // Filter expand toggle for mobile/compact screens
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(true);

  const filterStatuses = [
    'Semua',
    'Antre',
    'Diagnosa',
    'Pengerjaan',
    'Menunggu Sparepart',
    'Selesai',
    'Diambil'
  ];

  // List of unique mechanics from employees and existing services
  const mechanicList = useMemo(() => {
    const mechEmployees = employees.filter(
      (emp) => emp.role.includes('Mekanik') || emp.role.includes('Bengkel') || emp.role.includes('Admin')
    );

    // Build map for uniqueness
    const map = new Map<string, { id: string; name: string; role: string }>();

    // First add employees
    mechEmployees.forEach((emp) => {
      map.set(emp.id, { id: emp.id, name: emp.name, role: emp.role });
    });

    // Also include any mechanic recorded in services
    services.forEach((s) => {
      const idKey = s.mechanicId || s.mechanicName;
      if (!map.has(idKey)) {
        const rawName = s.mechanicName.split('(')[0].trim();
        const role = s.mechanicName.includes('(') 
          ? s.mechanicName.split('(')[1].replace(')', '').trim() 
          : 'Mekanik';
        map.set(idKey, { id: idKey, name: rawName, role });
      }
    });

    return Array.from(map.values());
  }, [employees, services]);

  // Date Presets Handler
  const handleDatePreset = (preset: string) => {
    setDatePreset(preset);
    const todayStr = '2026-09-23';

    switch (preset) {
      case 'all':
        setStartDate('');
        setEndDate('');
        break;
      case 'today':
        setStartDate(todayStr);
        setEndDate(todayStr);
        break;
      case '3days':
        setStartDate('2026-09-21');
        setEndDate(todayStr);
        break;
      case '7days':
        setStartDate('2026-09-17');
        setEndDate(todayStr);
        break;
      case 'this_month':
        setStartDate('2026-09-01');
        setEndDate('2026-09-30');
        break;
      default:
        break;
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setDatePreset('custom');
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    setDatePreset('custom');
  };

  const handleResetFilters = () => {
    setSelectedStatus('Semua');
    setSearchQuery('');
    setSelectedMechanic('Semua');
    setStartDate('');
    setEndDate('');
    setDatePreset('all');
    setSortBy('newest');
  };

  const hasActiveFilters = 
    selectedStatus !== 'Semua' || 
    searchQuery.trim() !== '' || 
    selectedMechanic !== 'Semua' || 
    startDate !== '' || 
    endDate !== '' ||
    sortBy !== 'newest';

  // Filter and Sort Services
  const filteredServices = useMemo(() => {
    return services
      .filter((order) => {
        // Status filter
        const matchesStatus = selectedStatus === 'Semua' || order.status === selectedStatus;

        // Keyword Search (plate number, customer name, motor model, order number, complaints, mechanic name)
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = 
          !q ||
          order.customerName.toLowerCase().includes(q) ||
          order.plateNumber.toLowerCase().includes(q) ||
          order.motorModel.toLowerCase().includes(q) ||
          order.orderNumber.toLowerCase().includes(q) ||
          order.mechanicName.toLowerCase().includes(q) ||
          order.serviceCategory.toLowerCase().includes(q);

        // Mechanic filter
        const matchesMechanic = 
          selectedMechanic === 'Semua' || 
          order.mechanicId === selectedMechanic ||
          order.mechanicName.toLowerCase().includes(selectedMechanic.toLowerCase());

        // Date range filter
        // order.createdAt is formatted like 'YYYY-MM-DD HH:mm' or 'YYYY-MM-DD'
        const orderDate = order.createdAt.split(' ')[0];
        const matchesStartDate = !startDate || orderDate >= startDate;
        const matchesEndDate = !endDate || orderDate <= endDate;

        return matchesStatus && matchesSearch && matchesMechanic && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') {
          return a.createdAt.localeCompare(b.createdAt);
        } else if (sortBy === 'cost_high') {
          return b.totalCost - a.totalCost;
        } else if (sortBy === 'cost_low') {
          return a.totalCost - b.totalCost;
        }
        // default 'newest'
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [services, selectedStatus, searchQuery, selectedMechanic, startDate, endDate, sortBy]);

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'Antre':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Diagnosa':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Pengerjaan':
        return 'bg-sky-100 text-sky-800 border-sky-300 font-bold';
      case 'Menunggu Sparepart':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Diambil':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getSelectedMechanicName = () => {
    if (selectedMechanic === 'Semua') return '';
    const found = mechanicList.find(m => m.id === selectedMechanic || m.name === selectedMechanic);
    return found ? found.name : selectedMechanic;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-sky-600" />
            Penjadwalan & Riwayat Servis Motor
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pencarian cerdas riwayat servis, filter rentang tanggal, assignment mekanik, dan status pengerjaan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Filter Panel (Mobile / Quick) */}
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              isFilterExpanded 
                ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-xs' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Sembunyikan / Tampilkan Panel Filter"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filter {hasActiveFilters ? '(Aktif)' : ''}</span>
          </button>

          {/* Cards vs Table View switch */}
          <div className="hidden sm:flex items-center rounded-xl bg-white border border-slate-200 p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
              title="Tampilan Kartu"
            >
              <Layers className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
              title="Tampilan Tabel"
            >
              <TableIcon className="h-4 w-4" />
            </button>
          </div>

          {/* New Service CTA Button */}
          <button
            onClick={onOpenNewService}
            className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.35)] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Booking Servis Baru</span>
          </button>
        </div>
      </div>

      {/* Main Filter & Search Hub Container */}
      <div className="glass-panel rounded-2xl p-4 space-y-4 border border-sky-200/80 shadow-xs">
        
        {/* Row 1: Search Input & Status Filter Tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Keyword Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nomor order, plat nomor (B 4192), nama pelanggan, tipe motor..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Hapus kata kunci"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {filterStatuses.map((status) => {
              const count = status === 'Semua' 
                ? services.length 
                : services.filter(s => s.status === status).length;
              const isActive = selectedStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-[0_0_12px_rgba(14,165,233,0.3)] font-bold'
                      : 'bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200/80'
                  }`}
                >
                  <span>{status}</span>
                  <span className={`text-[10px] rounded-md px-1.5 py-0.5 font-mono ${isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Advanced Filters (Date Range & Mechanic Filter) */}
        {isFilterExpanded && (
          <div className="pt-3 border-t border-sky-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            
            {/* Filter 1: Rentang Tanggal (Date Range) */}
            <div className="md:col-span-6 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-sky-600" />
                  <span>Rentang Tanggal Servis:</span>
                </label>
                
                {/* Date Presets Pills */}
                <div className="flex items-center gap-1 text-[10px]">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'today', label: 'Hari Ini' },
                    { id: '3days', label: '3 Hari' },
                    { id: '7days', label: '7 Hari' },
                    { id: 'this_month', label: 'Bulan Ini' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleDatePreset(p.id)}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        datePreset === p.id 
                          ? 'bg-sky-100 text-sky-800 font-bold border border-sky-300' 
                          : 'text-slate-500 hover:text-sky-700 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Inputs: Start Date & End Date */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                    Dari:
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => handleStartDateChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-2 py-2 text-xs font-mono text-slate-800 focus:border-sky-500 focus:outline-none shadow-xs"
                    title="Tanggal Mulai"
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                    Sampai:
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => handleEndDateChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-13 pr-2 py-2 text-xs font-mono text-slate-800 focus:border-sky-500 focus:outline-none shadow-xs"
                    title="Tanggal Selesai"
                  />
                </div>
              </div>
            </div>

            {/* Filter 2: Nama Mekanik (Mechanic Selection) */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-sky-600" />
                <span>Nama Mekanik:</span>
              </label>
              
              <div className="relative">
                <select
                  value={selectedMechanic}
                  onChange={e => setSelectedMechanic(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:outline-none shadow-xs font-medium appearance-none cursor-pointer"
                >
                  <option value="Semua">-- Semua Mekanik ({services.length} Servis) --</option>
                  {mechanicList.map((mech) => {
                    const mechOrderCount = services.filter(
                      s => s.mechanicId === mech.id || s.mechanicName.toLowerCase().includes(mech.name.toLowerCase())
                    ).length;
                    return (
                      <option key={mech.id} value={mech.id}>
                        {mech.name} ({mech.role}) - {mechOrderCount} Servis
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Sorting & Reset Actions */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5 text-sky-600" />
                  <span>Urutan:</span>
                </span>
                
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold transition-colors"
                    title="Kembalikan semua filter ke kondisi awal"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-sky-500 focus:outline-none shadow-xs font-medium appearance-none cursor-pointer"
                  >
                    <option value="newest">Waktu Masuk (Terbaru)</option>
                    <option value="oldest">Waktu Masuk (Terlama)</option>
                    <option value="cost_high">Biaya Tertinggi</option>
                    <option value="cost_low">Biaya Terendah</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    ▼
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="shrink-0 flex items-center justify-center p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors shadow-xs"
                    title="Reset Semua Filter"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Row 3: Active Filter Chips & Results Count Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          
          {/* Active Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Filter Aktif:</span>
            
            {/* Status Chip */}
            {selectedStatus !== 'Semua' && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-300 px-2 py-0.5 text-[11px] font-medium text-sky-800">
                <span>Status: <strong>{selectedStatus}</strong></span>
                <button onClick={() => setSelectedStatus('Semua')} className="hover:text-rose-600">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Search Query Chip */}
            {searchQuery.trim() !== '' && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-300 px-2 py-0.5 text-[11px] font-medium text-sky-800">
                <span>Cari: <strong>"{searchQuery}"</strong></span>
                <button onClick={() => setSearchQuery('')} className="hover:text-rose-600">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Mechanic Chip */}
            {selectedMechanic !== 'Semua' && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-300 px-2 py-0.5 text-[11px] font-medium text-sky-800">
                <span>Mekanik: <strong>{getSelectedMechanicName()}</strong></span>
                <button onClick={() => setSelectedMechanic('Semua')} className="hover:text-rose-600">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Date Range Chip */}
            {(startDate || endDate) && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-300 px-2 py-0.5 text-[11px] font-medium text-sky-800">
                <Calendar className="h-3 w-3 text-sky-600" />
                <span>
                  Periode: <strong>{startDate ? formatDateID(startDate) : 'Awal'}</strong> s/d <strong>{endDate ? formatDateID(endDate) : 'Hari ini'}</strong>
                </span>
                <button onClick={() => { setStartDate(''); setEndDate(''); setDatePreset('all'); }} className="hover:text-rose-600">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {!hasActiveFilters && (
              <span className="text-[11px] text-slate-500 italic">
                Semua data ditampilkan tanpa batasan filter
              </span>
            )}
          </div>

          {/* Result Count Indicator */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
            <span>Ditemukan:</span>
            <span className="font-mono font-bold text-sky-700 bg-sky-100/70 border border-sky-200 px-1.5 py-0.5 rounded">
              {filteredServices.length}
            </span>
            <span className="text-slate-400">dari total {services.length} servis</span>
          </div>

        </div>

      </div>

      {/* Services List / Cards */}
      {filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-12 text-center text-slate-400">
          <CalendarClock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Tidak ada data servis yang sesuai</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Tidak ditemukan riwayat servis yang cocok dengan rentang tanggal, filter mekanik, atau kata kunci pencarian saat ini.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 px-3 py-1.5 text-xs font-bold shadow-xs hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-sky-600" />
              <span>Reset Semua Filter</span>
            </button>
            <button
              onClick={onOpenNewService}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 text-white px-3 py-1.5 text-xs font-bold shadow-xs hover:bg-sky-600 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Booking Servis Baru</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((order) => {
            const partsCount = order.partsUsed.reduce((acc, p) => acc + p.quantity, 0);
            return (
              <div
                key={order.id}
                onClick={() => onSelectService(order)}
                className="group relative rounded-2xl border border-sky-200 bg-white/90 p-4 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-sky-400 hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                {/* Header card */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {order.orderNumber}
                    </span>
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-1">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {order.motorModel}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                      <span className="font-mono font-semibold text-sky-700">{order.plateNumber}</span>
                      <span>{order.customerName}</span>
                    </div>
                  </div>

                  {/* Date & Time Timestamp */}
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                    <Clock className="h-3 w-3 text-sky-600 shrink-0" />
                    <span>{formatDateTimeID(order.createdAt)}</span>
                  </div>

                  {/* Complaints snippet */}
                  <div className="mt-2.5 rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-xs text-slate-700">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {order.serviceCategory}
                    </div>
                    <p className="line-clamp-2 mt-0.5 text-[11px] leading-relaxed">
                      {order.complaints}
                    </p>
                  </div>

                  {/* Bay & Mechanic Info */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-sky-50 border border-sky-200 px-1.5 py-0.5 font-mono text-[11px] text-sky-700 font-bold">
                        Bay {order.bayNumber}
                      </span>
                      <span className="truncate max-w-[130px] font-medium text-slate-800 flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-sky-600 shrink-0" />
                        <span className="truncate">{order.mechanicName.split('(')[0].trim()}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-medium">{partsCount} Onderdil</span>
                    </div>
                  </div>
                </div>

                {/* Footer Cost & Fast Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Total Biaya</span>
                    <span className="font-mono text-sm font-bold text-sky-700">
                      {formatRupiah(order.totalCost)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportServiceInvoiceToPDF(order);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-colors shadow-xs"
                      title="Unduh Faktur PDF"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectService(order);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-300 px-2.5 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors"
                    >
                      <span>Kelola</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-sky-200 bg-white/90 p-4 backdrop-blur-xl shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2.5 font-bold">No. Order</th>
                <th className="pb-2.5 font-bold">Tanggal & Waktu Masuk</th>
                <th className="pb-2.5 font-bold">Motor & Plat</th>
                <th className="pb-2.5 font-bold">Pelanggan</th>
                <th className="pb-2.5 font-bold">Kategori</th>
                <th className="pb-2.5 font-bold">Mekanik Penanggung Jawab</th>
                <th className="pb-2.5 font-bold">Status</th>
                <th className="pb-2.5 font-bold text-right">Total Biaya</th>
                <th className="pb-2.5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map((order) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-sky-50/50 transition-colors cursor-pointer"
                  onClick={() => onSelectService(order)}
                >
                  <td className="py-3 font-mono font-bold text-sky-700">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 text-slate-700 font-mono text-[11px] whitespace-nowrap">
                    <div>{order.createdAt.split(' ')[0]}</div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {order.createdAt.split(' ')[1] ? `${order.createdAt.split(' ')[1]} WIB` : ''}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-900">
                    <div>{order.motorModel}</div>
                    <span className="font-mono text-[10px] text-sky-700">{order.plateNumber}</span>
                  </td>
                  <td className="py-3 text-slate-700">
                    <div>{order.customerName}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{order.customerPhone}</span>
                  </td>
                  <td className="py-3 text-slate-700">
                    <span className="text-[11px] font-medium">{order.serviceCategory}</span>
                  </td>
                  <td className="py-3 text-slate-700">
                    <div className="font-medium text-slate-900 flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-sky-600 shrink-0" />
                      <span>{order.mechanicName.split('(')[0].trim()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-sky-700 font-mono font-semibold bg-sky-50 border border-sky-200 px-1 py-0.2 rounded">
                        Bay {order.bayNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {order.mechanicName.includes('(') ? order.mechanicName.split('(')[1].replace(')', '') : ''}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-sky-700 tabular-nums">
                    {formatRupiah(order.totalCost)}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => exportServiceInvoiceToPDF(order)}
                        className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300"
                        title="Download Faktur PDF"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onSelectService(order)}
                        className="rounded-lg bg-sky-50 border border-sky-300 px-2 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-100"
                      >
                        Buka
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
