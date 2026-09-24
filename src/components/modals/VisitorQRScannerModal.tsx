import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { 
  X, 
  Camera, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX,
  FlipHorizontal,
  QrCode,
  FileText,
  Search,
  Check,
  Clock,
  Wrench,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ServiceOrder } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface VisitorQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (service: ServiceOrder) => void;
}

export const VisitorQRScannerModal: React.FC<VisitorQRScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectService
}) => {
  const { services } = useWorkshop();

  // Video & Canvas references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // States
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Scanning results
  const [scannedRawText, setScannedRawText] = useState<string | null>(null);
  const [matchedService, setMatchedService] = useState<ServiceOrder | null>(null);
  const [isScanPaused, setIsScanPaused] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  // Sample QRs for testing without physical paper
  const [sampleQRs, setSampleQRs] = useState<{ service: ServiceOrder; qrDataUrl: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('camera');

  // Normalize plate helper
  const normalizePlate = useCallback((str: string) => {
    return str.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }, []);

  // Play scanner chime
  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Two-tone success chime (880Hz -> 1320Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(1320, now + 0.08); // E6
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio context might be restricted before interaction
    }
  }, [soundEnabled]);

  // Decode matcher
  const matchService = useCallback((raw: string): ServiceOrder | null => {
    const text = raw.trim();
    if (!text || services.length === 0) return null;

    // 1. Try parsing JSON format
    if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
      try {
        const parsed = JSON.parse(text);
        if (parsed.id) {
          const found = services.find(s => s.id === parsed.id);
          if (found) return found;
        }
        if (parsed.orderNumber) {
          const found = services.find(s => s.orderNumber.toUpperCase() === parsed.orderNumber.toUpperCase());
          if (found) return found;
        }
        if (parsed.plateNumber) {
          const cleanP = normalizePlate(parsed.plateNumber);
          const found = services.find(s => normalizePlate(s.plateNumber) === cleanP);
          if (found) return found;
        }
      } catch {
        // Not valid JSON, continue
      }
    }

    // 2. Try URL query params
    if (text.includes('?') || text.includes('://')) {
      try {
        const url = new URL(text.startsWith('http') ? text : `https://example.com/${text}`);
        const orderParam = url.searchParams.get('order') || url.searchParams.get('ticket') || url.searchParams.get('id');
        const plateParam = url.searchParams.get('plate');
        if (orderParam) {
          const found = services.find(s => 
            s.orderNumber.toUpperCase() === orderParam.toUpperCase() || 
            s.id === orderParam
          );
          if (found) return found;
        }
        if (plateParam) {
          const cleanP = normalizePlate(plateParam);
          const found = services.find(s => normalizePlate(s.plateNumber) === cleanP);
          if (found) return found;
        }
      } catch {
        // URL parse error, continue
      }
    }

    // 3. Match by orderNumber directly
    const directOrder = services.find(s => 
      s.orderNumber.toUpperCase() === text.toUpperCase() ||
      text.toUpperCase().includes(s.orderNumber.toUpperCase())
    );
    if (directOrder) return directOrder;

    // 4. Match by exact license plate
    const cleanInputPlate = normalizePlate(text);
    if (cleanInputPlate) {
      const directPlate = services.find(s => normalizePlate(s.plateNumber) === cleanInputPlate);
      if (directPlate) return directPlate;

      // Partial plate match if text is at least 4 alphanumeric chars
      if (cleanInputPlate.length >= 4) {
        const partialPlate = services.find(s => {
          const p = normalizePlate(s.plateNumber);
          return p.includes(cleanInputPlate) || cleanInputPlate.includes(p);
        });
        if (partialPlate) return partialPlate;
      }
    }

    // 5. Match by ID
    const directId = services.find(s => s.id === text);
    if (directId) return directId;

    return null;
  }, [services, normalizePlate]);

  // Handle scanned decoded text
  const handleDecodedString = useCallback((decodedText: string) => {
    const text = decodedText.trim();
    if (!text) return;

    setScannedRawText(text);
    setIsScanPaused(true);
    playBeep();

    if (navigator.vibrate) {
      try {
        navigator.vibrate([60, 40, 80]);
      } catch {
        // ignore
      }
    }

    const matched = matchService(text);
    setMatchedService(matched);
  }, [matchService, playBeep]);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Frame scanning loop
  const scanFrame = useCallback(() => {
    if (isScanPaused) return;

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

    if (!isScanPaused) {
      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    }
  }, [isScanPaused, handleDecodedString]);

  // Start camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Browser Anda tidak mendukung akses kamera secara langsung. Silakan gunakan tab "Unggah Foto / Nota".');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        animFrameIdRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      let msg = 'Gagal mengakses kamera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Izin kamera ditolak. Berikan izin kamera di browser Anda atau gunakan opsi unggah foto.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Kamera tidak ditemukan pada perangkat Anda. Silakan coba fitur unggah gambar nota.';
      } else if (err.name === 'NotReadableError') {
        msg = 'Kamera sedang digunakan oleh aplikasi lain.';
      }
      setCameraError(msg);
      setCameraActive(false);
    }
  }, [facingMode, scanFrame, stopCamera]);

  // Generate sample QR codes for registered services on modal open
  useEffect(() => {
    if (!isOpen) return;

    const generateSamples = async () => {
      const sampleOrders = services.slice(0, 3);
      const results: { service: ServiceOrder; qrDataUrl: string }[] = [];

      for (const order of sampleOrders) {
        try {
          const payload = JSON.stringify({
            orderNumber: order.orderNumber,
            plateNumber: order.plateNumber,
            customerName: order.customerName,
            app: 'MotoRAD'
          });
          const url = await QRCode.toDataURL(payload, {
            width: 240,
            margin: 2,
            color: {
              dark: '#0369a1',
              light: '#ffffff'
            }
          });
          results.push({ service: order, qrDataUrl: url });
        } catch {
          // ignore
        }
      }
      setSampleQRs(results);
    };

    generateSamples();
  }, [isOpen, services]);

  // Manage camera on modal open/close & tab change
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      setIsScanPaused(false);
      setScannedRawText(null);
      setMatchedService(null);
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode, startCamera, stopCamera]);

  // Restart scanning
  const handleResetScan = () => {
    setIsScanPaused(false);
    setScannedRawText(null);
    setMatchedService(null);
    if (activeTab === 'camera' && cameraActive) {
      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    }
  };

  // Toggle front/back camera
  const handleToggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle image upload from file or gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setCameraError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        if (!offCtx) {
          setIsProcessingFile(false);
          return;
        }

        offCanvas.width = img.width;
        offCanvas.height = img.height;
        offCtx.drawImage(img, 0, 0);

        const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'attemptBoth'
        });

        setIsProcessingFile(false);

        if (code && code.data) {
          handleDecodedString(code.data);
        } else {
          setScannedRawText('TIDAK_TERDETEKSI');
          setMatchedService(null);
          setIsScanPaused(true);
        }
      };
      img.onerror = () => {
        setIsProcessingFile(false);
        setCameraError('Gagal memproses file gambar. Pastikan format file adalah JPG/PNG.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Confirm selection
  const handleConfirmSelection = (service: ServiceOrder) => {
    onSelectService(service);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleFileUpload}
        className="hidden" 
      />

      <div className="relative w-full max-w-xl rounded-3xl border border-sky-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-md">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Pindai QR Nota Servis
                </h3>
                <span className="rounded-full bg-sky-500/15 dark:bg-sky-500/25 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-400/30">
                  Pengunjung
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Arahkan kamera ke stiker QR pada nota fisik servis motor Anda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 bg-slate-100 dark:bg-slate-800'
              }`}
              title={soundEnabled ? 'Suara beep aktif' : 'Suara dimatikan'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex items-center gap-1 px-5 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Kamera Langsung</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Unggah Foto Nota</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'samples'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Contoh Stiker Nota ({sampleQRs.length})</span>
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: CAMERA VIEW */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              
              {/* VIDEO VIEWER CONTAINER */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center border-2 border-slate-700/80 shadow-inner">
                
                {/* Real Video Element */}
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    cameraActive ? 'opacity-100' : 'opacity-0'
                  }`}
                  playsInline
                  muted
                />

                {/* Loading state before camera warms up */}
                {!cameraActive && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-300 gap-3">
                    <div className="h-10 w-10 border-3 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-semibold">Mengaktifkan lensa kamera...</p>
                    <span className="text-[10px] text-slate-400 max-w-xs">
                      Pastikan browser telah diizinkan untuk mengakses kamera Anda
                    </span>
                  </div>
                )}

                {/* Camera Error Display */}
                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-slate-200 gap-3">
                    <div className="p-3 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                    <div className="max-w-xs">
                      <h4 className="font-bold text-sm text-white">Kamera Belum Dapat Diakses</h4>
                      <p className="text-xs text-slate-300 mt-1">{cameraError}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Coba Lagi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Gunakan Unggah Foto</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TARGETING RETICLE OVERLAY WHEN CAMERA IS ACTIVE */}
                {cameraActive && !isScanPaused && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    {/* Darkened outer vignette */}
                    <div className="absolute inset-0 bg-slate-950/40"></div>

                    {/* Clear scan box in center */}
                    <div className="relative w-56 sm:w-64 h-56 sm:h-64 rounded-2xl border-2 border-dashed border-sky-400/80 bg-transparent shadow-[0_0_50px_rgba(14,165,233,0.3)]">
                      
                      {/* Corner Target Markers */}
                      <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl-xl"></span>
                      <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr-xl"></span>
                      <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl-xl"></span>
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br-xl"></span>

                      {/* Animated Laser Scanning Line */}
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce" style={{ animationDuration: '2s' }}></div>

                      {/* Small Center Crosshair */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-40">
                        <div className="w-4 h-0.5 bg-sky-300"></div>
                        <div className="h-4 w-0.5 bg-sky-300 -ml-2"></div>
                      </div>
                    </div>

                    {/* Hint text bottom */}
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-semibold text-slate-200 border border-slate-700/60 shadow-lg">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>Posisikan stiker QR nota di dalam bingkai</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* CAMERA CONTROLS BAR (Floating in top corners) */}
                {cameraActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    <button
                      type="button"
                      onClick={handleToggleFacingMode}
                      className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-200 hover:text-white border border-slate-700 hover:border-slate-500 shadow-md transition-colors cursor-pointer"
                      title="Ganti Kamera Depan / Belakang"
                    >
                      <FlipHorizontal className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-200 hover:text-white border border-slate-700 hover:border-slate-500 shadow-md transition-colors cursor-pointer"
                      title="Muat Ulang Kamera"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 2: UPLOAD PHOTO OF NOTA */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-500/40 bg-sky-50/50 dark:bg-slate-800/50 hover:bg-sky-50 dark:hover:bg-slate-800 p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="h-14 w-14 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Pilih File Foto atau Tangkapan Layar Nota
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Klik di sini untuk memilih foto nota servis atau stiker barcode dari galeri smartphone / komputer Anda
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-1 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Jelajahi File Gambar (JPG/PNG)</span>
                </button>
              </div>

              {isProcessingFile && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 text-xs font-semibold">
                  <div className="h-4 w-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Menganalisis kode QR dari gambar...</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAMPLE QR CODES (FOR DEMO & INSTANT TESTING) */}
          {activeTab === 'samples' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Uji Coba Pemindaian Tanpa Kertas Fisik:</span>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Klik salah satu stiker QR di bawah untuk menyimulasikan pemindaian nota servis motor yang sedang aktif hari ini di bengkel.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sampleQRs.map(({ service, qrDataUrl }) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => {
                      const payload = JSON.stringify({
                        orderNumber: service.orderNumber,
                        plateNumber: service.plateNumber,
                        customerName: service.customerName
                      });
                      handleDecodedString(payload);
                    }}
                    className="p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-sky-500 bg-white dark:bg-slate-800 text-left transition-all hover:scale-102 cursor-pointer shadow-sm flex flex-col items-center group"
                  >
                    <div className="relative p-2 bg-white rounded-xl shadow-inner border border-slate-100">
                      <img 
                        src={qrDataUrl} 
                        alt={`QR Nota ${service.plateNumber}`} 
                        className="w-28 h-28 object-contain"
                      />
                      <span className="absolute top-1 right-1 px-1 py-0.5 rounded bg-sky-500 text-white text-[8px] font-mono font-bold">
                        NOTA
                      </span>
                    </div>

                    <div className="mt-2 text-center w-full">
                      <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white block group-hover:text-sky-600 transition-colors">
                        {service.plateNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        {service.motorModel}
                      </span>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        service.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : service.status === 'Pengerjaan'
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {service.status}
                      </span>
                    </div>

                    <div className="mt-2 text-[10px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 group-hover:underline">
                      <span>Pindai QR Ini</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SCANNED RESULT FEEDBACK CARD */}
          {isScanPaused && (
            <div className="rounded-2xl border-2 p-4 transition-all animate-in slide-in-from-bottom-2 duration-200">
              
              {/* SUCCESS MATCH */}
              {matchedService ? (
                <div className="space-y-3 bg-emerald-50/50 dark:bg-emerald-950/20 -m-4 p-4 rounded-2xl border-emerald-300 dark:border-emerald-700/60">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Nota Servis Valid Ditemukan!</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleResetScan}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Pindai Ulang</span>
                    </button>
                  </div>

                  {/* Motorcycle Detail Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/40 shadow-sm">
                    <div className="flex items-center gap-3">
                      {/* Plate Graphic Mini */}
                      <div className="rounded-lg bg-slate-950 px-2.5 py-1.5 border border-slate-700 text-center font-mono font-black text-sm text-white tracking-wider shrink-0 shadow-xs">
                        {matchedService.plateNumber}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {matchedService.motorModel}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>Pemilik: <strong className="text-slate-700 dark:text-slate-200">{matchedService.customerName}</strong></span>
                          <span>·</span>
                          <span className="font-mono">Tiket: {matchedService.orderNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col sm:items-end justify-between items-center shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        matchedService.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                          : matchedService.status === 'Pengerjaan'
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                      }`}>
                        {matchedService.status === 'Pengerjaan' ? `Pengerjaan (Pit ${matchedService.bayNumber})` : matchedService.status}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 sm:mt-1 font-mono font-semibold">
                        {formatRupiah(matchedService.totalCost)}
                      </span>
                    </div>
                  </div>

                  {/* Primary CTA to view service status */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleConfirmSelection(matchedService)}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Buka Status Servis Motor Sekarang</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* NO MATCH / UNKNOWN QR */
                <div className="space-y-3 bg-rose-50/50 dark:bg-rose-950/20 -m-4 p-4 rounded-2xl border-rose-300 dark:border-rose-800/60">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <h4 className="font-bold text-sm">Nota Tidak Terdaftar di Sistem</h4>
                  </div>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Kode QR terbaca:{' '}
                    <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white break-all">
                      {scannedRawText === 'TIDAK_TERDETEKSI' ? 'Tidak ada barcode/QR yang terdeteksi di gambar' : scannedRawText}
                    </code>
                    . Data ini tidak cocok dengan antrean servis aktif hari ini.
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleResetScan}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Coba Pindai Ulang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('samples')}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Coba Nota Contoh
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* HELPFUL TIPS FOR VISITORS */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <HelpCircle className="h-4 w-4 text-sky-500" />
              <span>Di mana posisi stiker QR nota servis?</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Stiker QR Code terletak di <strong>bagian sudut kanan atas nota servis fisik</strong> atau pada <strong>kartu gantungan kunci servis</strong> yang diberikan oleh front-desk kasir saat penyerahan sepeda motor.
            </p>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            MotoRAD Modern Visitor Tracking System
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
