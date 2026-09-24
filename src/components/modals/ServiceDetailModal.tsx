import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useWorkshop } from '../../context/WorkshopContext';
import { 
  X, 
  Wrench, 
  CheckCircle2, 
  Printer, 
  Clock, 
  User, 
  Phone, 
  AlertTriangle,
  Plus,
  Receipt,
  FileText,
  Eye,
  Calendar,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ServiceOrder, ServiceStatus, InspectionChecklist } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { exportServiceInvoiceToPDF } from '../../utils/exportReports';

interface ServiceDetailModalProps {
  order: ServiceOrder | null;
  onClose: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ order, onClose }) => {
  const { updateServiceStatus, inventory, addPartsToService } = useWorkshop();

  if (!order) return null;

  const [currentStatus, setCurrentStatus] = useState<ServiceStatus>(order.status);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showReceiptPreview, setShowReceiptPreview] = useState<boolean>(false);
  const [qrReceiptUrl, setQrReceiptUrl] = useState<string>('');

  useEffect(() => {
    if (!order) return;
    const payload = JSON.stringify({
      orderNumber: order.orderNumber,
      plateNumber: order.plateNumber,
      customerName: order.customerName,
      app: 'MotoRAD'
    });
    QRCode.toDataURL(payload, {
      width: 140,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    })
      .then(url => setQrReceiptUrl(url))
      .catch(() => {});
  }, [order]);

  const statuses: ServiceStatus[] = [
    'Antre',
    'Diagnosa',
    'Pengerjaan',
    'Menunggu Sparepart',
    'Selesai',
    'Diambil'
  ];

  const handleStatusChange = (newStatus: ServiceStatus) => {
    setCurrentStatus(newStatus);
    updateServiceStatus(order.id, newStatus);
    setSuccessToast(`Status servis diperbarui ke "${newStatus}"!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleAddPart = () => {
    if (!selectedPartId) return;
    const part = inventory.find(p => p.id === selectedPartId);
    if (!part) return;

    if (part.stock < partQty) {
      alert(`Stok ${part.name} tersisa ${part.stock} ${part.unit}. Tidak mencukupi.`);
      return;
    }

    addPartsToService(order.id, [{
      partId: part.id,
      sku: part.sku,
      name: part.name,
      quantity: partQty,
      price: part.sellPrice
    }]);

    setSelectedPartId('');
    setPartQty(1);
    setSuccessToast(`Suku cadang "${part.name}" berhasil ditambahkan & stok gudang terpotong!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Handler for minimalist thermal receipt printing
  const handlePrintReceipt = () => {
    document.body.classList.add('printing-receipt');

    const cleanup = () => {
      document.body.classList.remove('printing-receipt');
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    
    setTimeout(() => {
      window.print();
    }, 50);

    // Fallback timer cleanup
    setTimeout(() => {
      document.body.classList.remove('printing-receipt');
    }, 2000);
  };

  const partsTotalCost = order.partsUsed.reduce((acc, p) => acc + (p.price * p.quantity), 0);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. MINIMALIST SERVICE RECEIPT (PRINT-ONLY LAYOUT)                         */}
      {/* Styled specifically for 80mm / thermal slip printer during window.print() */}
      {/* ========================================================================= */}
      <div id="printable-service-receipt" className="hidden print:block font-mono text-[11px] text-black bg-white leading-relaxed">
        {/* Header */}
        <div className="text-center pb-2 border-b-2 border-dashed border-black">
          <div className="text-sm font-extrabold tracking-wider">MOTORAD ENGINE</div>
          <div className="text-[10px] font-semibold">BENGKEL MOTOR & SUKU CADANG RESMI</div>
          <div className="text-[9px] text-gray-800 mt-0.5">Jl. Raya Otomotif No. 88, Jakarta Selatan</div>
          <div className="text-[9px] text-gray-800">Telp / WA: 0812-3456-7890 · Buka Setiap Hari</div>
        </div>

        {/* Transaction Metadata */}
        <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
          <div className="flex justify-between">
            <span>NO. NOTA</span>
            <span className="font-bold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>TANGGAL</span>
            <span>{order.createdAt}</span>
          </div>
          <div className="flex justify-between">
            <span>PELANGGAN</span>
            <span className="font-bold">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span>NO. TELEPON</span>
            <span>{order.customerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span>KENDARAAN</span>
            <span className="font-bold">{order.motorModel}</span>
          </div>
          <div className="flex justify-between">
            <span>NO. POLISI</span>
            <span className="font-bold">{order.plateNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>MEKANIK / BAY</span>
            <span>{order.mechanicName.split(' ')[0]} (Bay {order.bayNumber})</span>
          </div>
          <div className="flex justify-between">
            <span>STATUS SERVIS</span>
            <span className="font-bold uppercase">[{order.status}]</span>
          </div>
        </div>

        {/* Complaints */}
        <div className="py-1.5 border-b border-dashed border-black text-[9.5px]">
          <div className="font-bold mb-0.5">KELUHAN PELANGGAN:</div>
          <div className="italic text-gray-800">{order.complaints}</div>
        </div>

        {/* Services & Spare Parts Breakdown */}
        <div className="py-2 border-b border-dashed border-black text-[10px]">
          <div className="font-bold mb-1">RINCIAN JASA & SUKU CADANG:</div>
          
          {/* Labor Service Fee */}
          <div className="flex justify-between py-0.5">
            <span className="truncate pr-2">Jasa: {order.serviceCategory}</span>
            <span className="font-bold shrink-0">{formatRupiah(order.laborCost)}</span>
          </div>

          {/* Parts Used */}
          {order.partsUsed.length > 0 && (
            <div className="mt-1 pt-1 border-t border-dotted border-black/60 space-y-0.5">
              {order.partsUsed.map((part, index) => (
                <div key={index} className="flex justify-between text-[9.5px]">
                  <span className="truncate pr-1">
                    {part.quantity}x {part.name}
                  </span>
                  <span className="shrink-0">{formatRupiah(part.price * part.quantity)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cost Summary Calculations */}
        <div className="py-2 border-b-2 border-dashed border-black text-[10px] space-y-0.5">
          <div className="flex justify-between">
            <span>Subtotal Jasa:</span>
            <span>{formatRupiah(order.laborCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal Suku Cadang:</span>
            <span>{formatRupiah(partsTotalCost)}</span>
          </div>
          <div className="flex justify-between text-xs font-extrabold pt-1.5 border-t border-dashed border-black mt-1">
            <span>TOTAL BAYAR:</span>
            <span>{formatRupiah(order.totalCost)}</span>
          </div>
        </div>

        {/* Physical Inspection 8-Point Summary */}
        <div className="py-1.5 border-b border-dashed border-black text-[9px]">
          <div className="font-bold mb-0.5">CEK FISIK 8-TITIK:</div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            <div>Oli Mesin: {order.checklist.oliMesin ? '[OK]' : '[-]'}</div>
            <div>Sistem Rem: {order.checklist.sistemRem ? '[OK]' : '[-]'}</div>
            <div>Busi & Api: {order.checklist.busiPengapian ? '[OK]' : '[-]'}</div>
            <div>CVT / Rantai: {order.checklist.cvtRantai ? '[OK]' : '[-]'}</div>
            <div>Filter Udara: {order.checklist.filterUdara ? '[OK]' : '[-]'}</div>
            <div>Aki Kelistrikan: {order.checklist.akiKelistrikan ? '[OK]' : '[-]'}</div>
          </div>
        </div>

        {/* QR Code Sticker on Printable Receipt */}
        {qrReceiptUrl && (
          <div className="py-2 border-b border-dashed border-black flex flex-col items-center justify-center text-center">
            <img src={qrReceiptUrl} alt={`QR Nota ${order.orderNumber}`} className="w-16 h-16 border border-black p-0.5 mx-auto" />
            <span className="text-[8px] font-bold tracking-wider mt-1">PINDAI STIKER QR UNTUK STATUS REAL-TIME</span>
          </div>
        )}

        {/* Warranty Notice & Footer */}
        <div className="pt-2 text-center text-[9px] leading-tight space-y-1">
          <div className="font-bold text-[10px]">*** GARANSI SERVIS 7 HARI / 500 KM ***</div>
          <div className="text-gray-700">Simpan nota fisik ini sebagai bukti sah klaim garansi servis.</div>
          <div className="pt-1 font-bold">TERIMA KASIH ATAS KUNJUNGAN ANDA!</div>
          <div className="text-[8px] text-gray-500">Sistem Servis RAD - MotoRAD Engine v4.0</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN MODAL DIALOG (UI DISPLAY)                                         */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto no-print">
        <div className="relative w-full max-w-2xl rounded-2xl border border-sky-300 bg-white/95 p-5 sm:p-6 shadow-[0_25px_60px_rgba(14,165,233,0.2)] backdrop-blur-2xl my-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-300 text-sky-600 shadow-xs">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 font-mono">{order.createdAt}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {order.motorModel} — <span className="text-sky-700 font-mono">{order.plateNumber}</span>
                </h3>
              </div>
            </div>

            {/* Action Buttons: Cetak Nota, Cetak Faktur PDF, Close */}
            <div className="flex items-center gap-1.5 self-end sm:self-center">
              {/* Main "Cetak Nota" Button triggering window.print() */}
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all hover:shadow-[0_0_15px_rgba(14,165,233,0.4)] cursor-pointer"
                title="Cetak Nota Servis (Format Struk Minimalis 80mm)"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Nota</span>
              </button>

              {/* Full Invoice PDF Download */}
              <button
                type="button"
                onClick={() => exportServiceInvoiceToPDF(order)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 hover:border-sky-300 transition-colors shadow-xs"
                title="Unduh Faktur PDF Lengkap"
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Faktur PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Tutup Modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Success Toast */}
          {successToast && (
            <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-semibold flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            
            {/* Status Pipeline Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Perbarui Tahapan Servis (Pipeline):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
                {statuses.map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className={`rounded-xl py-2 px-1 text-center text-xs font-bold transition-all ${
                      currentStatus === st
                        ? 'bg-sky-500 text-white shadow-xs font-extrabold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Bay Info Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-sky-200 bg-sky-50/50 p-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pelanggan</span>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-sky-600" />
                  {order.customerName}
                </div>
                <div className="text-slate-600 flex items-center gap-1.5 font-mono">
                  <Phone className="h-3.5 w-3.5 text-sky-600" />
                  {order.customerPhone}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Alokasi Kerja</span>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="rounded bg-sky-100 text-sky-800 border border-sky-300 px-1.5 font-mono text-[10px]">
                    Bay {order.bayNumber}
                  </span>
                  <span className="truncate">{order.mechanicName}</span>
                </div>
                <div className="text-slate-600 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-sky-600" />
                  Estimasi durasi: ~{order.estimatedMinutes} menit
                </div>
              </div>
            </div>

            {/* Complaints */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Keluhan & Kategori: {order.serviceCategory}
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">
                {order.complaints}
              </p>
            </div>

            {/* Physical Inspection Checklist Results */}
            <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3 text-xs">
              <span className="text-[10px] text-sky-800 font-bold uppercase tracking-wider block mb-2">
                Hasil Lembar Cek Fisik 8-Titik
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'oliMesin', label: 'Oli Mesin' },
                  { key: 'sistemRem', label: 'Sistem Rem' },
                  { key: 'busiPengapian', label: 'Busi & Pengapian' },
                  { key: 'cvtRantai', label: 'CVT / Rantai' },
                  { key: 'filterUdara', label: 'Filter Udara' },
                  { key: 'akiKelistrikan', label: 'Aki & Kelistrikan' },
                  { key: 'tekananBan', label: 'Tekanan Ban' },
                  { key: 'radiatorCoolant', label: 'Radiator' }
                ].map(item => {
                  const checked = order.checklist[item.key as keyof InspectionChecklist];
                  return (
                    <div 
                      key={item.key}
                      className={`flex items-center gap-1.5 rounded-lg p-1.5 ${checked ? 'bg-sky-100 text-sky-800 font-semibold' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {checked ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="text-[10px] leading-tight truncate">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suku Cadang Terpasang */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                Suku Cadang yang Digunakan ({order.partsUsed.length} Item)
              </span>

              {order.partsUsed.length === 0 ? (
                <p className="text-slate-400 italic">Belum ada suku cadang yang digunakan pada servis ini.</p>
              ) : (
                <div className="space-y-1.5">
                  {order.partsUsed.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 p-2 border border-slate-200">
                      <div className="truncate">
                        <span className="font-mono text-[10px] text-sky-700 font-bold mr-1.5">{p.sku}</span>
                        <span className="font-semibold text-slate-900">{p.name}</span>
                        <span className="text-slate-500 ml-1.5">({p.quantity}x @ {formatRupiah(p.price)})</span>
                      </div>
                      <span className="font-mono font-bold text-sky-700 shrink-0 ml-2">
                        {formatRupiah(p.price * p.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Add Extra Part */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedPartId}
                  onChange={e => setSelectedPartId(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                >
                  <option value="">+ Tambah Onderdil Tambahan...</option>
                  {inventory.map(part => (
                    <option key={part.id} value={part.id} disabled={part.stock <= 0}>
                      {part.name} (Stok: {part.stock} {part.unit} - {formatRupiah(part.sellPrice)})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    value={partQty}
                    onChange={e => setPartQty(Math.max(1, Number(e.target.value)))}
                    className="w-14 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-mono font-bold text-center text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPart}
                    disabled={!selectedPartId}
                    className="rounded-lg bg-sky-50 border border-sky-300 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>

            {/* Ringkasan Biaya Final */}
            <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4">
              <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                <span>Biaya Jasa Servis:</span>
                <span className="font-mono font-semibold">{formatRupiah(order.laborCost)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
                <span>Total Suku Cadang ({order.partsUsed.length} jenis):</span>
                <span className="font-mono font-semibold">
                  {formatRupiah(partsTotalCost)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-sky-200 text-sm font-extrabold text-sky-900">
                <span>Total Pembayaran Pelanggan:</span>
                <span className="font-mono text-base text-sky-800">{formatRupiah(order.totalCost)}</span>
              </div>
            </div>

            {/* Receipt Preview Collapsible Drawer */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <button
                type="button"
                onClick={() => setShowReceiptPreview(!showReceiptPreview)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-sky-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-sky-600" />
                  <span>Pratinjau Struk Servis Minimalis (Thermal Slip 80mm)</span>
                </div>
                <span className="text-[11px] font-semibold text-sky-600 underline">
                  {showReceiptPreview ? 'Sembunyikan' : 'Lihat Pratinjau'}
                </span>
              </button>

              {showReceiptPreview && (
                <div className="mt-3 p-4 rounded-xl bg-white border border-slate-300 shadow-inner max-w-sm mx-auto font-mono text-[10px] text-slate-800 leading-tight">
                  <div className="text-center pb-2 border-b border-dashed border-slate-400">
                    <div className="font-bold text-xs tracking-wider">MOTORAD ENGINE</div>
                    <div className="text-[9px]">BENGKEL MOTOR & SUKU CADANG</div>
                    <div className="text-[8px] text-slate-500 mt-0.5">Jl. Raya Otomotif No. 88, Jak-Sel</div>
                    <div className="text-[8px] text-slate-500">Telp: 0812-3456-7890</div>
                  </div>

                  <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5 text-[9.5px]">
                    <div className="flex justify-between">
                      <span>No: {order.orderNumber}</span>
                      <span>{order.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pelanggan:</span>
                      <span className="font-bold">{order.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Motor:</span>
                      <span className="font-bold">{order.motorModel} ({order.plateNumber})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mekanik:</span>
                      <span>{order.mechanicName.split(' ')[0]} (Bay {order.bayNumber})</span>
                    </div>
                  </div>

                  <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5 text-[9.5px]">
                    <div className="flex justify-between font-semibold">
                      <span>Jasa: {order.serviceCategory}</span>
                      <span>{formatRupiah(order.laborCost)}</span>
                    </div>
                    {order.partsUsed.map((p, i) => (
                      <div key={i} className="flex justify-between text-slate-600">
                        <span>{p.quantity}x {p.name}</span>
                        <span>{formatRupiah(p.price * p.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="py-1.5 border-b border-dashed border-slate-400 text-[10px] font-bold flex justify-between">
                    <span>TOTAL BAYAR:</span>
                    <span className="text-sky-800">{formatRupiah(order.totalCost)}</span>
                  </div>

                  {/* QR Code Sticker on Thermal Receipt */}
                  {qrReceiptUrl && (
                    <div className="py-2 border-b border-dashed border-slate-400 flex flex-col items-center justify-center gap-1 text-center">
                      <img src={qrReceiptUrl} alt={`QR Nota ${order.orderNumber}`} className="w-16 h-16 border border-slate-300 p-0.5" />
                      <span className="text-[8px] font-bold tracking-wider text-slate-700">SCAN QR TRACKER PENGUNJUNG</span>
                      <span className="text-[7.5px] text-slate-500">Pindai kode ini di dashboard pengunjung</span>
                    </div>
                  )}

                  <div className="pt-2 text-center text-[8px] text-slate-500 space-y-0.5">
                    <div className="font-bold text-slate-700">* GARANSI SERVIS 7 HARI / 500 KM *</div>
                    <div>Simpan struk ini sebagai bukti klaim garansi.</div>
                    <div className="font-semibold text-slate-800 pt-0.5">TERIMA KASIH ATAS KUNJUNGAN ANDA</div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="w-full mt-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white py-1.5 font-sans text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Cetak Nota Sekarang</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Mekanik bertanggung jawab penuh atas hasil pengerjaan.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Cetak Nota Servis (Format Struk Minimalis 80mm)"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak Nota</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
