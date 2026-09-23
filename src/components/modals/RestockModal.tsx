import React, { useState } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { X, RefreshCw, AlertTriangle, Check } from 'lucide-react';
import { InventoryPart } from '../../types';

interface RestockModalProps {
  part: InventoryPart | null;
  onClose: () => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({ part, onClose }) => {
  const { restockPart } = useWorkshop();
  const [addQty, setAddQty] = useState(10);

  if (!part) return null;

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (addQty <= 0) return;
    restockPart(part.id, Number(addQty));
    onClose();
  };

  const presetAmounts = [5, 10, 20, 50];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-sky-300 bg-white/95 p-5 sm:p-6 shadow-[0_25px_60px_rgba(14,165,233,0.2)] backdrop-blur-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 border border-sky-300 text-sky-600">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Restock Suku Cadang
              </h3>
              <p className="text-xs text-slate-500">Penerimaan pasokan barang fisik dari supplier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Item Info Box */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3.5 mb-4">
          <div className="font-bold text-slate-900 text-sm">{part.name}</div>
          <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
            <span className="font-mono text-sky-700 font-bold">{part.sku}</span>
            <span>Lokasi: <strong className="text-slate-800">{part.shelfLocation}</strong></span>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-sky-200/60 text-xs">
            <span className="text-slate-600">Stok Fisik Saat Ini:</span>
            <span className={`font-mono font-bold ${part.stock <= part.minStock ? 'text-amber-700' : 'text-slate-900'}`}>
              {part.stock} {part.unit} (Min: {part.minStock})
            </span>
          </div>
        </div>

        <form onSubmit={handleRestock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Jumlah Penambahan Stok ({part.unit})
            </label>
            <div className="flex gap-2 mb-2">
              {presetAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAddQty(amt)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition-colors ${
                    addQty === amt 
                      ? 'bg-sky-500/15 border-sky-300 text-sky-800 font-extrabold' 
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  +{amt}
                </button>
              ))}
            </div>

            <input
              type="number"
              min={1}
              required
              value={addQty}
              onChange={e => setAddQty(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-mono font-bold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs"
            />
          </div>

          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 font-semibold flex items-center justify-between">
            <span>Stok Setelah Ditambahkan:</span>
            <span className="font-mono text-sm font-extrabold text-emerald-700">
              {part.stock + Number(addQty)} {part.unit}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
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
              <span>Konfirmasi Masuk Stok</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
