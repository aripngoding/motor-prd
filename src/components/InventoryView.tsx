import React, { useState } from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { 
  Boxes, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  PackageCheck, 
  RefreshCw, 
  Filter,
  DollarSign,
  Tag,
  MapPin,
  QrCode,
  Camera,
  X,
  Printer
} from 'lucide-react';
import { InventoryPart, InventoryCategory } from '../types';
import { formatRupiah } from '../utils/formatters';
import { QRScannerModal } from './modals/QRScannerModal';
import { PartQRCodeModal } from './modals/PartQRCodeModal';

interface InventoryViewProps {
  onOpenNewPart: () => void;
  onOpenRestock: (part: InventoryPart) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  onOpenNewPart, 
  onOpenRestock 
}) => {
  const { inventory, lowStockCount } = useWorkshop();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // QR Scanning & QR Label States
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [selectedPartForQR, setSelectedPartForQR] = useState<InventoryPart | null>(null);

  const categories = [
    'Semua',
    'Oli & Pelumas',
    'Sistem Pengereman',
    'Transmisi & CVT',
    'Mesin & Pengapian',
    'Kelistrikan & Aki',
    'Ban & Roda',
    'Filter & Cairan'
  ];

  const totalAssetValue = inventory.reduce((acc, p) => acc + (p.stock * p.sellPrice), 0);
  const totalStockUnits = inventory.reduce((acc, p) => acc + p.stock, 0);

  const filteredParts = inventory.filter((part) => {
    const matchesCategory = selectedCategory === 'Semua' || part.category === selectedCategory;
    const matchesLowStock = !onlyLowStock || part.stock <= part.minStock;
    const matchesSearch = 
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.compatibleMotors.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesLowStock && matchesSearch;
  });

  const handleSelectPartFromQR = (part: InventoryPart) => {
    setSearchQuery(part.sku);
    setSelectedCategory('Semua');
    setOnlyLowStock(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Main Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Boxes className="h-6 w-6 text-sky-600" />
            Inventaris & Gudang Suku Cadang Motor
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Katalog komponen motor, manajemen stok fisik, dan pemindaian kode QR kamera untuk restock cepat
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Main QR Scanner Trigger CTA Button */}
          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-sky-300 bg-white hover:bg-sky-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-sky-700 shadow-sm backdrop-blur-md transition-all hover:shadow-md"
            title="Buka Kamera untuk Pindai QR Suku Cadang"
          >
            <Camera className="h-4 w-4 text-sky-600 animate-pulse" />
            <span>Pindai Kode QR</span>
          </button>

          {/* Add New Part CTA */}
          <button
            onClick={onOpenNewPart}
            className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.35)] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tambah Suku Cadang</span>
          </button>
        </div>
      </div>

      {/* Inventory KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Item / SKU Aktif</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
              {inventory.length} <span className="text-xs font-normal text-slate-500">SKU ({totalStockUnits} Unit Fisik)</span>
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
            <Tag className="h-4 w-4" />
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nilai Total Aset Suku Cadang</span>
            <div className="text-xl font-bold font-mono text-sky-700 mt-0.5 tabular-nums">
              {formatRupiah(totalAssetValue)}
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>

        <div className={`glass-panel rounded-xl p-4 flex items-center justify-between ${lowStockCount > 0 ? 'border-amber-300 bg-amber-50/40' : ''}`}>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Komponen Menipis (Alert)</span>
            <div className="text-xl font-bold font-mono mt-0.5 tabular-nums">
              <span className={lowStockCount > 0 ? 'text-amber-700' : 'text-slate-900'}>
                {lowStockCount} Suku Cadang
              </span>
            </div>
          </div>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
            lowStockCount > 0 ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-slate-100 text-slate-400 border-slate-200'
          }`}>
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar with Integrated QR Action */}
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box with QR Scan shortcut button */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari SKU (OLI-MTL), nama part, kompatibilitas motor, atau rak..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-18 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none shadow-xs"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="Hapus kata kunci"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsQRScannerOpen(true)}
                className="flex items-center gap-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-300 px-2 py-1 text-[11px] font-bold text-sky-700 transition-colors"
                title="Pindai Kode QR dengan Kamera"
              >
                <Camera className="h-3.5 w-3.5 text-sky-600" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>
          </div>

          {/* Quick Filter: Low stock only toggle */}
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
              onlyLowStock 
                ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-xs' 
                : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Tampilkan Hanya Stok Menipis ({lowStockCount})</span>
          </button>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'bg-sky-500/15 text-sky-800 border border-sky-300 font-bold' 
                    : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-transparent'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Notification banner (if filtered by QR scan) */}
      {searchQuery && (
        <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-3.5 py-2 text-xs text-sky-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-sky-600" />
            <span>
              Menampilkan hasil pencarian SKU / kata kunci: <strong className="font-mono">{searchQuery}</strong>
            </span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-sky-700 hover:text-sky-900 underline"
          >
            Tampilkan Semua Suku Cadang
          </button>
        </div>
      )}

      {/* Inventory Table */}
      <div className="rounded-2xl border border-sky-200 bg-white/90 p-5 backdrop-blur-xl shadow-xs overflow-x-auto">
        {filteredParts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tidak ditemukan suku cadang yang sesuai kriteria pencarian.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-bold">SKU & Label QR</th>
                <th className="pb-3 font-bold">Nama Suku Cadang & Kompatibilitas</th>
                <th className="pb-3 font-bold">Kategori</th>
                <th className="pb-3 font-bold">Lokasi Rak</th>
                <th className="pb-3 font-bold text-center">Stok / Min</th>
                <th className="pb-3 font-bold text-center">Status</th>
                <th className="pb-3 font-bold text-right">Harga Jual</th>
                <th className="pb-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParts.map((part) => {
                const isCritical = part.stock <= part.minStock;
                const isOutOfStock = part.stock === 0;

                return (
                  <tr key={part.id} className="hover:bg-sky-50/50 transition-colors group">
                    <td className="py-3.5 align-top">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-sky-700">
                          {part.sku}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedPartForQR(part)}
                          className="p-1 rounded-md border border-sky-200 bg-white hover:bg-sky-50 text-sky-600 hover:text-sky-800 transition-colors shadow-xs"
                          title="Lihat & Cetak Label Kode QR Rak"
                        >
                          <QrCode className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 align-top max-w-xs">
                      <div className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {part.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Cocok untuk: {part.compatibleMotors.join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 text-slate-600 align-top">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 font-medium">
                        {part.category}
                      </span>
                    </td>

                    <td className="py-3.5 text-slate-600 align-top">
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                        <MapPin className="h-3 w-3 text-sky-600 shrink-0" />
                        <span>{part.shelfLocation}</span>
                      </div>
                    </td>

                    <td className="py-3.5 text-center align-top">
                      <span className={`font-mono text-sm font-bold ${
                        isOutOfStock 
                          ? 'text-rose-600' 
                          : isCritical 
                          ? 'text-amber-600' 
                          : 'text-slate-900'
                      }`}>
                        {part.stock}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono"> / {part.minStock} {part.unit}</span>
                    </td>

                    <td className="py-3.5 text-center align-top">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isCritical
                          ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {isOutOfStock ? 'HABIS' : isCritical ? 'MENIPIS' : 'AMAN'}
                      </span>
                    </td>

                    <td className="py-3.5 text-right align-top font-mono font-bold text-sky-700 tabular-nums">
                      {formatRupiah(part.sellPrice)}
                    </td>

                    <td className="py-3.5 text-right align-top">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPartForQR(part)}
                          className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-700 transition-colors shadow-xs"
                          title="Lihat Label QR"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenRestock(part)}
                          className="flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-300 px-2.5 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-100 transition-colors shadow-xs"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Restock</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* QR Code Scanner Camera Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onSelectPartForFilter={handleSelectPartFromQR}
        onOpenNewPartWithSKU={() => {
          onOpenNewPart();
        }}
      />

      {/* Single Part QR Code Label Viewer Modal */}
      <PartQRCodeModal
        part={selectedPartForQR}
        onClose={() => setSelectedPartForQR(null)}
        onOpenScanner={() => {
          setSelectedPartForQR(null);
          setIsQRScannerOpen(true);
        }}
      />

    </div>
  );
};
