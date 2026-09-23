import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Download, Printer, Copy, Check, MapPin, Tag, Boxes } from 'lucide-react';
import { InventoryPart } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface PartQRCodeModalProps {
  part: InventoryPart | null;
  onClose: () => void;
  onOpenScanner?: () => void;
}

export const PartQRCodeModal: React.FC<PartQRCodeModalProps> = ({ part, onClose, onOpenScanner }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!part) return;

    // Generate QR Code containing SKU and metadata
    QRCode.toDataURL(
      part.sku,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#0369a1', // Sky-700
          light: '#ffffff'
        }
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [part]);

  if (!part) return null;

  const handleCopySKU = () => {
    navigator.clipboard.writeText(part.sku);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR-LABEL-${part.sku}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Label QR Rak - ${part.sku}</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fff; }
            .label-card { width: 320px; border: 2px dashed #0284c7; padding: 18px; border-radius: 12px; text-align: center; }
            .title { font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
            .sku { font-family: monospace; font-size: 16px; font-weight: bold; color: #0284c7; margin-bottom: 8px; }
            .qr-img { width: 180px; height: 180px; margin: 0 auto; display: block; }
            .meta { font-size: 11px; color: #475569; margin-top: 8px; line-height: 1.4; }
            .price { font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 6px; }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="sku">${part.sku}</div>
            <div class="title">${part.name}</div>
            <img class="qr-img" src="${qrDataUrl}" alt="${part.sku}" />
            <div class="meta">Lokasi: <strong>${part.shelfLocation}</strong> · Kat: ${part.category}</div>
            <div class="price">${formatRupiah(part.sellPrice)}</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-2xl border border-sky-300 bg-white/95 p-5 shadow-[0_25px_60px_rgba(14,165,233,0.25)] backdrop-blur-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-300 text-sky-600">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Label QR Suku Cadang</h3>
              <p className="text-[11px] text-slate-500 font-mono">{part.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* QR Display Card */}
        <div className="rounded-2xl border border-sky-200 bg-gradient-to-b from-sky-50/60 to-white p-4 text-center">
          <div className="bg-white p-3 rounded-xl border border-sky-200/80 inline-block shadow-xs">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code ${part.sku}`}
                className="w-48 h-48 mx-auto object-contain"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                Membuat Kode QR...
              </div>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-center gap-1.5 font-mono text-sm font-bold text-sky-800">
              <span>{part.sku}</span>
              <button
                onClick={handleCopySKU}
                className="text-slate-400 hover:text-sky-600 p-0.5"
                title="Salin SKU"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <h4 className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">
              {part.name}
            </h4>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-2">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-sky-600" />
                {part.shelfLocation}
              </span>
              <span>·</span>
              <span className="font-mono font-bold text-slate-800">
                {formatRupiah(part.sellPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-sky-600" />
            <span>Unduh PNG</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white py-2 text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak Label Rak</span>
          </button>
        </div>

      </div>
    </div>
  );
};
