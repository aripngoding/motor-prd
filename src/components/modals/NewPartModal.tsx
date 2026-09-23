import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { X, Boxes, Plus } from 'lucide-react';
import { InventoryCategory } from '../../types';

interface NewPartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPartModal: React.FC<NewPartModalProps> = ({ isOpen, onClose }) => {
  const { addInventoryPart } = useWorkshop();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('Oli & Pelumas');
  const [shelfLocation, setShelfLocation] = useState('Rak A-01');
  const [stock, setStock] = useState(10);
  const [minStock, setMinStock] = useState(5);
  const [unit, setUnit] = useState('Botol');
  const [buyPrice, setBuyPrice] = useState(60000);
  const [sellPrice, setSellPrice] = useState(85000);
  const [compatibleMotorsText, setCompatibleMotorsText] = useState('Semua Motor Matic');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) {
      alert('Mohon isi SKU dan Nama Suku Cadang!');
      return;
    }

    const motors = compatibleMotorsText.split(',').map(m => m.trim()).filter(Boolean);

    addInventoryPart({
      sku: sku.toUpperCase(),
      name,
      category,
      shelfLocation,
      stock: Number(stock),
      minStock: Number(minStock),
      unit,
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
      compatibleMotors: motors.length > 0 ? motors : ['Universal Motor']
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-sky-300 bg-white/95 p-5 sm:p-6 shadow-[0_25px_60px_rgba(14,165,233,0.2)] backdrop-blur-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 border border-sky-300 text-sky-600">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tambah Suku Cadang ke Inventaris
              </h3>
              <p className="text-xs text-slate-500">
                Katalogisasi onderdil baru dengan batas notifikasi minimum
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kode SKU <span className="text-sky-600">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="Contoh: OLI-MTL-7100"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold uppercase text-sky-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as InventoryCategory)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              >
                <option value="Oli & Pelumas">Oli & Pelumas</option>
                <option value="Sistem Pengereman">Sistem Pengereman</option>
                <option value="Transmisi & CVT">Transmisi & CVT</option>
                <option value="Mesin & Pengapian">Mesin & Pengapian</option>
                <option value="Kelistrikan & Aki">Kelistrikan & Aki</option>
                <option value="Ban & Roda">Ban & Roda</option>
                <option value="Filter & Cairan">Filter & Cairan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Suku Cadang <span className="text-sky-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Oli Mesin Motul 7100 Ester 10W-40 4T (1L)"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lokasi Rak Gudang
              </label>
              <input
                type="text"
                value={shelfLocation}
                onChange={e => setShelfLocation(e.target.value)}
                placeholder="Contoh: Rak B-04"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Satuan Barang
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              >
                <option value="Botol">Botol</option>
                <option value="Pcs">Pcs</option>
                <option value="Set">Set</option>
                <option value="Unit">Unit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stok Awal
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Batas Minimum Alert
              </label>
              <input
                type="number"
                min={1}
                value={minStock}
                onChange={e => setMinStock(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-amber-700 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Harga Beli / HPP (Rp)
              </label>
              <input
                type="number"
                step={1000}
                value={buyPrice}
                onChange={e => setBuyPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Harga Jual ke Pelanggan (Rp)
              </label>
              <input
                type="number"
                step={1000}
                value={sellPrice}
                onChange={e => setSellPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-sky-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kompatibilitas Motor (Pisahkan dengan Koma)
            </label>
            <input
              type="text"
              value={compatibleMotorsText}
              onChange={e => setCompatibleMotorsText(e.target.value)}
              placeholder="Contoh: NMAX 155, Aerox, Vario 160, PCX"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
            />
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
              <Plus className="h-4 w-4" />
              <span>Simpan ke Gudang</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
