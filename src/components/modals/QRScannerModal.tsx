import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
  X, 
  Camera, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Boxes, 
  Plus, 
  Search, 
  Zap, 
  Upload, 
  Sparkles,
  ArrowRight,
  Maximize2,
  Volume2,
  VolumeX,
  FlipHorizontal
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { InventoryPart } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPartForFilter: (part: InventoryPart) => void;
  onOpenNewPartWithSKU?: (sku: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectPartForFilter,
  onOpenNewPartWithSKU
}) => {
  const { inventory, restockPart, triggerPushNotification } = useWorkshop();

  // Video & Canvas references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // States
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Scanned item state
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [matchedPart, setMatchedPart] = useState<InventoryPart | null>(null);
  const [isScanningPaused, setIsScanningPaused] = useState<boolean>(false);

  // Quick Restock State inside Scanner
  const [restockAmount, setRestockAmount] = useState<number>(5);
  const [restockSuccessMessage, setRestockSuccessMessage] = useState<string | null>(null);

  // Play pleasant barcode beep
  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio context may require prior user interaction
    }
  }, [soundEnabled]);

  // Handle scanned raw text data
  const handleDecodedString = useCallback((rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    setScannedCode(text);
    setIsScanningPaused(true);
    playBeep();

    // Vibrate device if supported
    if (navigator.vibrate) {
      navigator.vibrate(80);
    }

    // Try finding matching part by SKU, ID, or name
    // Also handle possible JSON format e.g. {"sku":"..."} or URL
    let searchKey = text;
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const parsed = JSON.parse(text);
        searchKey = parsed.sku || parsed.id || parsed.name || text;
      } catch {
        // use raw
      }
    } else if (text.includes('/parts/')) {
      searchKey = text.split('/parts/').pop()?.split(/[?#]/)[0] || text;
    }

    const cleanKey = searchKey.toLowerCase();
    const found = inventory.find(p => 
      p.sku.toLowerCase() === cleanKey ||
      p.id.toLowerCase() === cleanKey ||
      p.name.toLowerCase() === cleanKey ||
      cleanKey.includes(p.sku.toLowerCase())
    );

    if (found) {
      setMatchedPart(found);
      setRestockSuccessMessage(null);
    } else {
      setMatchedPart(null);
    }
  }, [inventory, playBeep]);

  // Main QR Detection Loop
  const scanFrame = useCallback(() => {
    if (isScanningPaused) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        });

        if (code && code.data) {
          handleDecodedString(code.data);
          return;
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(scanFrame);
  }, [isScanningPaused, handleDecodedString]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Fitur kamera tidak didukung pada browser ini atau protokol tidak aman (HTTPS/localhost).');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
        await videoRef.current.play();
        setCameraActive(true);
        animFrameIdRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let errMsg = 'Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan di browser Anda.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Izin akses kamera ditolak oleh pengguna atau sistem.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'Kamera tidak terdeteksi pada perangkat ini.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errMsg = 'Kamera sedang digunakan oleh aplikasi lain.';
      }
      setCameraError(errMsg);
      setCameraActive(false);
    }
  }, [facingMode, scanFrame]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsScanningPaused(false);
      setScannedCode(null);
      setMatchedPart(null);
      setRestockSuccessMessage(null);
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Restart scan loop when paused state is toggled off
  useEffect(() => {
    if (!isScanningPaused && cameraActive) {
      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    }
  }, [isScanningPaused, cameraActive, scanFrame]);

  // Toggle Camera Front / Back
  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Reset scanner to scan another part
  const handleScanAgain = () => {
    setScannedCode(null);
    setMatchedPart(null);
    setRestockSuccessMessage(null);
    setIsScanningPaused(false);
  };

  // Quick Restock execution
  const handleQuickRestock = (qtyToAdd: number) => {
    if (!matchedPart || qtyToAdd <= 0) return;
    restockPart(matchedPart.id, qtyToAdd);
    
    // Update local state preview
    setMatchedPart(prev => prev ? { ...prev, stock: prev.stock + qtyToAdd } : null);
    setRestockSuccessMessage(`Berhasil menambahkan +${qtyToAdd} ${matchedPart.unit} ke stok ${matchedPart.name}.`);
    triggerPushNotification(
      'Restock Berhasil via QR Scanner',
      `Suku cadang ${matchedPart.name} (${matchedPart.sku}) bertambah ${qtyToAdd} ${matchedPart.unit}.`,
      'system'
    );
  };

  // Image Upload Scanner Fallback
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleDecodedString(code.data);
          } else {
            alert('Tidak ditemukan kode QR yang valid pada foto yang diunggah. Pastikan gambar jelas dan tidak buram.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-sky-300 bg-white/95 p-4 sm:p-6 shadow-[0_25px_70px_rgba(14,165,233,0.3)] backdrop-blur-2xl transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                Pemindai Kode QR Suku Cadang
                <span className="rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 border border-sky-300">
                  Live Scanner
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Arahkan kamera ke label QR suku cadang di rak gudang untuk pencarian & restock instan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors ${soundEnabled ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-400'}`}
              title={soundEnabled ? 'Suara Pemindai Aktif' : 'Suara Dimatikan'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewport / Video Area */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video sm:aspect-[4/3] flex items-center justify-center border border-sky-300 shadow-inner">
          
          {/* Real Video Element */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            autoPlay
            playsInline
            muted
          />

          {/* Hidden Canvas for QR reading */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Active Scanning Overlay (Viewfinder & Laser Beam) */}
          {cameraActive && !isScanningPaused && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Dimmed surrounding */}
              <div className="absolute inset-0 border-[35px] sm:border-[45px] border-slate-950/45"></div>

              {/* Viewfinder Target Box */}
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 border-2 border-dashed border-sky-400/90 rounded-2xl shadow-[0_0_25px_rgba(14,165,233,0.5)]">
                {/* 4 Corner Markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br-lg"></div>

                {/* Animated Horizontal Laser Sweep */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse top-1/2 -translate-y-1/2"></div>
              </div>

              <span className="absolute bottom-4 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full border border-sky-400/40">
                Posisikan Kode QR di dalam kotak bidik
              </span>
            </div>
          )}

          {/* Camera Controls Overlay (Top Right of video) */}
          {cameraActive && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-xl border border-sky-300/40 backdrop-blur-md text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                title="Putar Kamera Depan/Belakang"
              >
                <FlipHorizontal className="h-4 w-4 text-sky-400" />
                <span className="hidden sm:inline text-[11px]">Putar Kamera</span>
              </button>
            </div>
          )}

          {/* Camera Error or Fallback Screen */}
          {cameraError && (
            <div className="p-6 text-center max-w-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mx-auto mb-3">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Akses Kamera Terkendala</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {cameraError}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={startCamera}
                  className="rounded-xl bg-sky-500 hover:bg-sky-600 px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Coba Akses Lagi
                </button>
                <label className="rounded-xl border border-sky-400/50 bg-slate-800/80 hover:bg-slate-800 text-sky-300 px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  Unggah Foto QR
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Loading state before camera starts */}
          {!cameraActive && !cameraError && (
            <div className="text-center p-6">
              <div className="h-8 w-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span className="text-xs font-bold text-white block">Menghubungkan ke Sensor Kamera...</span>
              <span className="text-[11px] text-slate-400">Mohon izinkan akses kamera jika diminta</span>
            </div>
          )}
        </div>

        {/* Quick Test QR Simulator Chips (Always helpful for rapid testing on desktop) */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Simulasi Cepat Pindai SKU (Uji Coba Langsung):
            </span>
            <label className="text-[11px] text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer">
              <Upload className="h-3 w-3" />
              Scan dari File Gambar
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {inventory.slice(0, 6).map((part) => (
              <button
                key={part.id}
                type="button"
                onClick={() => handleDecodedString(part.sku)}
                className="rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-1 text-[11px] font-mono font-bold text-sky-800 transition-colors flex items-center gap-1"
                title={`Pindai otomatis ${part.name}`}
              >
                <span>{part.sku}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Result & Actions Area (When QR is Detected) */}
        {isScanningPaused && (
          <div className="mt-4 rounded-2xl border border-sky-300 bg-sky-50/70 p-4 shadow-xs transition-all animate-fadeIn">
            {matchedPart ? (
              <div className="space-y-3">
                {/* Part Header */}
                <div className="flex items-start justify-between gap-2 border-b border-sky-200/80 pb-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[10px] px-2 py-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                        Suku Cadang Terverifikasi
                      </span>
                      <span className="font-mono text-xs font-bold text-sky-800 bg-white px-2 py-0.5 rounded border border-sky-200">
                        {matchedPart.sku}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">{matchedPart.name}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Kategori: <strong className="text-slate-800">{matchedPart.category}</strong> · Rak: <strong className="text-slate-800">{matchedPart.shelfLocation}</strong>
                    </p>
                  </div>

                  {/* Stock Badge */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block font-medium">Stok Tersedia</span>
                    <span className={`font-mono text-lg font-extrabold ${matchedPart.stock <= matchedPart.minStock ? 'text-amber-700' : 'text-slate-900'}`}>
                      {matchedPart.stock} {matchedPart.unit}
                    </span>
                    <span className="block text-[10px] text-slate-400">Min: {matchedPart.minStock}</span>
                  </div>
                </div>

                {/* Success Notification */}
                {restockSuccessMessage && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-2.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{restockSuccessMessage}</span>
                  </div>
                )}

                {/* Quick Restock In-Scanner Section */}
                <div className="rounded-xl bg-white border border-sky-200 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 text-sky-600" />
                      Pembaruan Stok Cepat ({matchedPart.unit}):
                    </span>
                    <span className="text-xs font-mono font-bold text-sky-700">
                      Harga Jual: {formatRupiah(matchedPart.sellPrice)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {[5, 10, 20, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleQuickRestock(preset)}
                        className="flex-1 min-w-[60px] rounded-lg border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 py-1.5 text-xs font-bold text-slate-700 hover:text-sky-700 transition-colors"
                      >
                        +{preset}
                      </button>
                    ))}

                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="number"
                        min="1"
                        value={restockAmount}
                        onChange={e => setRestockAmount(Math.max(1, Number(e.target.value)))}
                        className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-mono text-center font-bold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuickRestock(restockAmount)}
                        className="rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleScanAgain}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Pindai Suku Cadang Lain</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPartForFilter(matchedPart);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>Tampilkan di Tabel & Tutup</span>
                  </button>
                </div>
              </div>
            ) : (
              /* QR Code Not Found in Database */
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Kode QR Terdeteksi, tapi belum terdaftar di inventaris:</span>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-2.5 font-mono text-xs font-bold text-slate-800 break-all">
                  {scannedCode}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleScanAgain}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Pindai Ulang</span>
                  </button>

                  {onOpenNewPartWithSKU && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenNewPartWithSKU(scannedCode || '');
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Tambah Sebagai Part Baru</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
