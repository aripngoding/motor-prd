import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  Phone, 
  Clock, 
  Battery, 
  Gauge, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Search, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  RotateCcw, 
  Play, 
  Pause, 
  ShieldCheck, 
  Wrench, 
  X,
  Compass,
  Bike
} from 'lucide-react';
import { useWorkshop } from '../context/WorkshopContext';
import { CourierDriver, PickupTask } from '../types';
import { WORKSHOP_HQ, INITIAL_COURIERS, INITIAL_PICKUP_TASKS } from '../data/courierData';

export const CourierTrackerView: React.FC = () => {
  const { triggerPushNotification } = useWorkshop();

  // Fleet & Tasks State
  const [couriers, setCouriers] = useState<CourierDriver[]>(INITIAL_COURIERS);
  const [tasks, setTasks] = useState<PickupTask[]>(INITIAL_PICKUP_TASKS);
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Map Filter Toggles
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showRadius, setShowRadius] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Pickup Modal
  const [isNewPickupModalOpen, setIsNewPickupModalOpen] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newMotorModel, setNewMotorModel] = useState('');
  const [newPlateNumber, setNewPlateNumber] = useState('');
  const [newIssue, setNewIssue] = useState('');
  const [newAssignedCourier, setNewAssignedCourier] = useState('cour-04');

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [WORKSHOP_HQ.lat, WORKSHOP_HQ.lng],
        zoom: 13,
        zoomControl: false
      });

      // CartoDB Voyager Tile Layer (Modern, crisp, bright theme matching glassmorphism)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Add Zoom control at top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Layer groups for markers & routes
      const markersLayer = L.layerGroup().addTo(map);
      const routesLayer = L.layerGroup().addTo(map);

      markersLayerRef.current = markersLayer;
      routesLayerRef.current = routesLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Routes whenever state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const routesLayer = routesLayerRef.current;

    if (!map || !markersLayer || !routesLayer) return;

    markersLayer.clearLayers();
    routesLayer.clearLayers();

    // 1. Service Coverage Radius Circle (8 KM from HQ)
    if (showRadius) {
      L.circle([WORKSHOP_HQ.lat, WORKSHOP_HQ.lng], {
        radius: 7500,
        color: '#0284c7',
        weight: 1.5,
        dashArray: '5, 8',
        fillColor: '#38bdf8',
        fillOpacity: 0.05
      }).bindTooltip('Zona Layanan Jemput-Bola (Radius 7.5 KM)', {
        direction: 'top',
        className: 'custom-leaflet-tooltip'
      }).addTo(routesLayer);
    }

    // 2. Central Workshop HQ Marker
    const hqIcon = L.divIcon({
      className: 'custom-hub-marker',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="absolute -inset-2 rounded-full bg-sky-400/30 animate-ping"></div>
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white shadow-xl border-2 border-white ring-2 ring-sky-300">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="absolute -bottom-6 whitespace-nowrap rounded-md bg-slate-950/90 text-white text-[10px] font-extrabold px-2 py-0.5 shadow-md border border-sky-400/40">
            HQ Bengkel MotoRAD
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const hqMarker = L.marker([WORKSHOP_HQ.lat, WORKSHOP_HQ.lng], { icon: hqIcon }).addTo(markersLayer);
    hqMarker.bindPopup(`
      <div class="p-2 font-sans text-xs">
        <h4 class="font-extrabold text-slate-900 text-sm">${WORKSHOP_HQ.name}</h4>
        <p class="text-slate-500 text-[11px] mt-0.5">${WORKSHOP_HQ.address}</p>
        <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span class="text-sky-700 font-bold">Pusat Armada Hidrolik & Pit Servis</span>
          <span class="font-mono text-slate-600">${WORKSHOP_HQ.phone}</span>
        </div>
      </div>
    `);

    // 3. Customer Pickup Location Markers
    tasks.forEach((task) => {
      const isSelected = selectedTaskId === task.id;
      const pickupIcon = L.divIcon({
        className: 'custom-pickup-marker',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer transition-transform ${isSelected ? 'scale-110 z-30' : ''}">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg border-2 border-white ring-2 ring-amber-300">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div class="mt-1 whitespace-nowrap rounded-md bg-white/95 text-slate-900 text-[10px] font-bold px-2 py-0.5 shadow-sm border border-amber-300">
              ${task.customerName.split(' ')[0]} (${task.motorModel.split(' ')[0]})
            </div>
          </div>
        `,
        iconSize: [36, 48],
        iconAnchor: [18, 40]
      });

      const taskMarker = L.marker([task.lat, task.lng], { icon: pickupIcon }).addTo(markersLayer);
      taskMarker.bindPopup(`
        <div class="p-2 font-sans text-xs max-w-xs">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
            <span class="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              ${task.taskNumber}
            </span>
            <span class="text-[10px] font-bold text-slate-500">${task.urgency}</span>
          </div>
          <h4 class="font-extrabold text-slate-900 text-sm">${task.customerName}</h4>
          <div class="text-[11px] text-slate-600 mt-0.5">
            <strong>${task.motorModel}</strong> · <span class="font-mono">${task.plateNumber}</span>
          </div>
          <p class="text-[11px] text-slate-500 mt-1 italic">"${task.issueDescription}"</p>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span>Kurir: <strong class="text-sky-700">${task.courierName}</strong></span>
            <span class="font-bold text-emerald-600">ETA ~${task.etaMinutes} menit</span>
          </div>
        </div>
      `);

      taskMarker.on('click', () => {
        setSelectedTaskId(task.id);
      });

      // Draw Route Line
      if (showRoutes && task.routeCoordinates && task.routeCoordinates.length > 1) {
        L.polyline(task.routeCoordinates, {
          color: isSelected ? '#0284c7' : '#38bdf8',
          weight: isSelected ? 4 : 3,
          dashArray: '6, 8',
          opacity: isSelected ? 0.95 : 0.75
        }).addTo(routesLayer);
      }
    });

    // 4. Courier Markers (With Live Headings & Speed)
    couriers.forEach((courier) => {
      const isSelected = selectedCourierId === courier.id;
      const isMoving = courier.speedKmH > 0;

      const courierIcon = L.divIcon({
        className: 'custom-courier-marker',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer transition-transform ${isSelected ? 'scale-115 z-40' : ''}">
            ${isMoving ? '<div class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 animate-ping"></div>' : ''}
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-xl border-2 border-white ring-2 ring-sky-300">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="mt-1 flex items-center gap-1 whitespace-nowrap rounded-md bg-white/95 text-sky-950 text-[10px] font-extrabold px-2 py-0.5 shadow-md border border-sky-300">
              <span>${courier.name.split(' ')[0]}</span>
              ${isMoving ? `<span class="text-emerald-700 font-mono text-[9px]">(${courier.speedKmH} km/h)</span>` : '<span class="text-slate-400 text-[9px]">(Standby)</span>'}
            </div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 36]
      });

      const courierMarker = L.marker([courier.currentLat, courier.currentLng], { icon: courierIcon }).addTo(markersLayer);
      courierMarker.bindPopup(`
        <div class="p-2 font-sans text-xs max-w-xs">
          <div class="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
            <span class="rounded bg-sky-100 text-sky-800 text-[10px] font-bold px-1.5 py-0.5">
              ${courier.vehicleType}
            </span>
            <span class="font-mono text-[10px] font-bold text-slate-700">${courier.plateNumber}</span>
          </div>
          <h4 class="font-extrabold text-slate-900 text-sm">${courier.name}</h4>
          <div class="text-[11px] text-slate-600 mt-0.5">
            Status: <strong class="text-sky-700">${courier.status}</strong>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px]">
            <div>Kecepatan: <strong>${courier.speedKmH} km/jam</strong></div>
            <div>Baterai GPS: <strong>${courier.batteryLevel}%</strong></div>
            <div>Servis Hari Ini: <strong>${courier.completedToday} Motor</strong></div>
            <div>Rating: <strong>★ ${courier.rating}</strong></div>
          </div>
          <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
            <a href="tel:${courier.phone}" class="rounded-lg bg-sky-500 text-white font-bold px-2.5 py-1 text-[11px] hover:bg-sky-600">
              Hubungi (${courier.phone})
            </a>
          </div>
        </div>
      `);

      courierMarker.on('click', () => {
        setSelectedCourierId(courier.id);
        if (courier.activeTaskId) {
          setSelectedTaskId(courier.activeTaskId);
        }
      });
    });

  }, [couriers, tasks, selectedCourierId, selectedTaskId, showRoutes, showRadius]);

  // Live GPS movement simulation loop (every 3 seconds)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setCouriers((prevCouriers) =>
        prevCouriers.map((courier) => {
          if (courier.status === 'Standby di Hub') return courier;

          // Slightly nudge position towards customer or HQ
          const deltaLat = (Math.random() - 0.48) * 0.0006;
          const deltaLng = (Math.random() - 0.48) * 0.0006;
          const speedVariance = Math.floor(Math.random() * 6) - 3;
          const newSpeed = Math.max(18, Math.min(52, courier.speedKmH + speedVariance));

          return {
            ...courier,
            currentLat: courier.currentLat + deltaLat,
            currentLng: courier.currentLng + deltaLng,
            speedKmH: newSpeed,
            batteryLevel: Math.max(20, courier.batteryLevel - (Math.random() > 0.8 ? 1 : 0))
          };
        })
      );

      // Decrement ETA on tasks slightly
      setTasks((prevTasks) =>
        prevTasks.map((t) => ({
          ...t,
          etaMinutes: Math.max(1, t.etaMinutes - (Math.random() > 0.6 ? 1 : 0))
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Handle focusing map on a specific courier
  const focusOnCourier = (courier: CourierDriver) => {
    setSelectedCourierId(courier.id);
    if (courier.activeTaskId) {
      setSelectedTaskId(courier.activeTaskId);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([courier.currentLat, courier.currentLng], 15, {
        duration: 1.2
      });
    }
  };

  // Handle focusing map on a customer task
  const focusOnTask = (task: PickupTask) => {
    setSelectedTaskId(task.id);
    setSelectedCourierId(task.courierId);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([task.lat, task.lng], 15, {
        duration: 1.2
      });
    }
  };

  // Center on Workshop HQ
  const centerOnHQ = () => {
    setSelectedCourierId(null);
    setSelectedTaskId(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([WORKSHOP_HQ.lat, WORKSHOP_HQ.lng], 13.5, {
        duration: 1
      });
    }
  };

  // Fit all couriers in view
  const fitAllInView = () => {
    if (!mapInstanceRef.current) return;
    const points: [number, number][] = [
      [WORKSHOP_HQ.lat, WORKSHOP_HQ.lng],
      ...couriers.map(c => [c.currentLat, c.currentLng] as [number, number]),
      ...tasks.map(t => [t.lat, t.lng] as [number, number])
    ];

    const bounds = L.latLngBounds(points);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  // Handle adding new pickup request
  const handleCreatePickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone || !newMotorModel || !newCustAddress) {
      alert('Mohon lengkapi semua data penjemputan.');
      return;
    }

    // Randomize slight offset in South Jakarta for the new pickup point
    const randomOffsetLat = (Math.random() - 0.5) * 0.04;
    const randomOffsetLng = (Math.random() - 0.5) * 0.04;
    const pickupLat = WORKSHOP_HQ.lat + randomOffsetLat;
    const pickupLng = WORKSHOP_HQ.lng + randomOffsetLng;

    const assignedDriver = couriers.find(c => c.id === newAssignedCourier) || couriers[0];

    const newTaskNumber = `PKP-2026-0${80 + tasks.length + 1}`;
    const newTask: PickupTask = {
      id: `pkp-${Date.now()}`,
      taskNumber: newTaskNumber,
      customerName: newCustName,
      customerPhone: newCustPhone,
      pickupAddress: newCustAddress,
      lat: pickupLat,
      lng: pickupLng,
      motorModel: newMotorModel,
      plateNumber: newPlateNumber || 'B 0000 NEW',
      issueDescription: newIssue || 'Servis jemput-bola motor.',
      courierId: assignedDriver.id,
      courierName: assignedDriver.name,
      status: 'Menuju Lokasi',
      etaMinutes: 15,
      distanceKm: 2.1,
      scheduledTime: 'Segera',
      urgency: 'Sedang (Servis Rutin)',
      routeCoordinates: [
        [WORKSHOP_HQ.lat, WORKSHOP_HQ.lng],
        [pickupLat, pickupLng]
      ]
    };

    setTasks([newTask, ...tasks]);

    // Update driver state
    setCouriers(prev =>
      prev.map(c =>
        c.id === assignedDriver.id
          ? { ...c, status: 'Menuju Pelanggan', activeTaskId: newTask.id, speedKmH: 32 }
          : c
      )
    );

    triggerPushNotification(
      'Order Penjemputan Baru',
      `Penjemputan ${newTask.motorModel} atas nama ${newTask.customerName} ditugaskan ke ${assignedDriver.name}.`,
      'service_update'
    );

    // Reset & Close
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewMotorModel('');
    setNewPlateNumber('');
    setNewIssue('');
    setIsNewPickupModalOpen(false);

    // Focus on new task
    setTimeout(() => {
      focusOnTask(newTask);
    }, 300);
  };

  const activeTasks = tasks.filter(t => t.status !== 'Tiba di Bengkel');

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-bold text-sky-700 border border-sky-300">
              <Navigation className="h-3 w-3 animate-pulse text-sky-600" />
              Live Fleet Tracking (Jemput-Bola)
            </span>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">GPS Armada Penjemputan Bengkel</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Peta Lokasi Kurir Penjemputan Motor
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau pergerakan armada penjemputan motor pelanggan secara langsung, estimasi waktu tiba (ETA), dan rute pengangkutan motor ke bengkel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Live Simulation Button */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all shadow-xs ${
              isSimulating
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Simulasikan telemetri pergerakan GPS kurir"
          >
            {isSimulating ? (
              <>
                <Pause className="h-3.5 w-3.5 text-emerald-600" />
                <span>GPS Live Aktif</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-slate-600" />
                <span>Lanjutkan GPS</span>
              </>
            )}
          </button>

          {/* New Pickup Order CTA */}
          <button
            onClick={() => setIsNewPickupModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.35)] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Order Jemput-Bola</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Kurir Bertugas
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {couriers.filter(c => c.status !== 'Standby di Hub').length} <span className="text-xs font-normal text-slate-500">/ {couriers.length} Unit</span>
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
            <Bike className="h-4 w-4" />
          </div>
        </div>

        <div className="glass-panel rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Motor Sedang Dijemput
            </span>
            <div className="text-xl font-bold font-mono text-sky-700 mt-0.5">
              {activeTasks.length} <span className="text-xs font-normal text-slate-500">Unit</span>
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        <div className="glass-panel rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Rata-rata Waktu Respon
            </span>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
              18 <span className="text-xs font-normal text-slate-500">Menit</span>
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Gauge className="h-4 w-4" />
          </div>
        </div>

        <div className="glass-panel rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Selesai Hari Ini
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              14 <span className="text-xs font-normal text-slate-500">Motor Sukses</span>
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Map View & Real-time Courier Control Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 Cols): Leaflet Interactive Map */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-sky-300/80 bg-white shadow-sm h-[520px] w-full">
            
            {/* The Actual Leaflet Map DIV */}
            <div ref={mapContainerRef} className="h-full w-full z-0" />

            {/* Quick Map Controls Overlay (Top Left) */}
            <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-sky-200 shadow-sm">
              <button
                type="button"
                onClick={centerOnHQ}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors flex items-center gap-1"
                title="Pusatkan Peta ke Bengkel Pusat MotoRAD"
              >
                <Wrench className="h-3.5 w-3.5 text-sky-600" />
                <span>Pusat Bengkel</span>
              </button>

              <button
                type="button"
                onClick={fitAllInView}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors flex items-center gap-1"
                title="Lihat seluruh armada & titik penjemputan"
              >
                <Compass className="h-3.5 w-3.5 text-sky-600" />
                <span>Lihat Semua</span>
              </button>

              <div className="h-4 w-px bg-slate-200 mx-0.5"></div>

              <button
                type="button"
                onClick={() => setShowRoutes(!showRoutes)}
                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  showRoutes ? 'bg-sky-100 text-sky-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Tampilkan garis jalur rute"
              >
                Rute
              </button>

              <button
                type="button"
                onClick={() => setShowRadius(!showRadius)}
                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  showRadius ? 'bg-sky-100 text-sky-800 font-bold' : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Tampilkan batas jangkauan jemputan 7.5 KM"
              >
                Radius 7.5km
              </button>
            </div>

            {/* Live Telemetry Legend Overlay (Bottom Left) */}
            <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-sky-200 shadow-sm text-[11px] hidden sm:block">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Armada Jemput-Bola Live</span>
              </div>
              <div className="space-y-1 text-slate-600 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-600"></span>
                  <span>Kantor & Bengkel Pusat MotoRAD Engine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                  <span>Kurir / Towing Box Berjalan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span>Lokasi Pelanggan (Motor Dijemput)</span>
                </div>
              </div>
            </div>

          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between px-1">
            <span>
              💡 Klik salah satu marker kurir atau penjemputan di peta untuk melihat kontak langsung & rincian motor.
            </span>
            <span className="font-mono text-[11px] text-sky-700 font-semibold">
              OpenStreetMap & CARTO Engine
            </span>
          </div>
        </div>

        {/* Right Column (4 Cols): Live Courier Dispatch & Task List */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Couriers Dispatch List */}
          <div className="glass-panel rounded-2xl p-4">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <Bike className="h-4 w-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Armada Kurir Aktif</h3>
              </div>
              <span className="rounded bg-sky-100 text-sky-800 font-mono text-[10px] font-bold px-2 py-0.5">
                {couriers.length} Kurir
              </span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {couriers.map((courier) => {
                const isSelected = selectedCourierId === courier.id;
                const isMoving = courier.speedKmH > 0;

                return (
                  <div
                    key={courier.id}
                    onClick={() => focusOnCourier(courier)}
                    className={`rounded-xl p-3 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-400 bg-sky-50/90 shadow-md ring-1 ring-sky-300'
                        : 'border-slate-200 bg-white/80 hover:border-sky-300 hover:bg-sky-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{courier.name}</span>
                          <span className={`inline-flex items-center rounded px-1.5 py-0.2 text-[9px] font-bold ${
                            isMoving ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {courier.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {courier.vehicleType} · {courier.plateNumber}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-sky-700 block">
                          {courier.speedKmH} km/h
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Batt: {courier.batteryLevel}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-sky-600" />
                        {courier.phone}
                      </span>
                      <span className="text-sky-600 font-bold hover:underline flex items-center gap-0.5">
                        Fokus Peta <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Pickup Tasks */}
          <div className="glass-panel rounded-2xl p-4">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Antrean Penjemputan Motor</h3>
              </div>
              <span className="rounded bg-amber-100 text-amber-800 font-mono text-[10px] font-bold px-2 py-0.5">
                {activeTasks.length} Tugas
              </span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {activeTasks.map((task) => {
                const isSelected = selectedTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    onClick={() => focusOnTask(task)}
                    className={`rounded-xl p-3 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/80 shadow-md ring-1 ring-amber-300'
                        : 'border-slate-200 bg-white/80 hover:border-amber-300 hover:bg-amber-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-mono font-bold text-sky-700">{task.taskNumber}</span>
                      <span className="font-bold text-amber-700">{task.status}</span>
                    </div>

                    <div className="font-extrabold text-xs text-slate-900">
                      {task.motorModel} — <span className="font-mono text-slate-600 font-normal">{task.plateNumber}</span>
                    </div>

                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Pelanggan: <strong>{task.customerName}</strong>
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1 truncate">
                      📍 {task.pickupAddress}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">
                        Kurir: <strong className="text-slate-700">{task.courierName}</strong>
                      </span>
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        ETA: ~{task.etaMinutes} Menit
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* New Pickup Order Modal Dialog */}
      {isNewPickupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-sky-300 bg-white/95 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl my-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-300 text-sky-600">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Buat Order Penjemputan Motor</h3>
                  <p className="text-xs text-slate-500">Tugaskan armada kurir untuk ambil motor mogok / servis di tempat</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPickupModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePickup} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pelanggan *</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={e => setNewCustName(e.target.value)}
                    placeholder="Contoh: Pak Danang"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / WA *</label>
                  <input
                    type="text"
                    required
                    value={newCustPhone}
                    onChange={e => setNewCustPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model / Tipe Motor *</label>
                  <input
                    type="text"
                    required
                    value={newMotorModel}
                    onChange={e => setNewMotorModel(e.target.value)}
                    placeholder="Contoh: Honda ADV 160"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Plat Nomor Kendaraan</label>
                  <input
                    type="text"
                    value={newPlateNumber}
                    onChange={e => setNewPlateNumber(e.target.value)}
                    placeholder="Contoh: B 5432 KLA"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Penjemputan Lengkap *</label>
                <input
                  type="text"
                  required
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                  placeholder="Jl. / Gang / Patokan Rumah Pelanggan"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keluhan / Alasan Penjemputan</label>
                <textarea
                  rows={2}
                  value={newIssue}
                  onChange={e => setNewIssue(e.target.value)}
                  placeholder="Contoh: Motor tidak mau hidup, lampu indikator injeksi berkedip..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tugaskan Kurir / Rider Armada</label>
                <select
                  value={newAssignedCourier}
                  onChange={e => setNewAssignedCourier(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                >
                  {couriers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.vehicleType} - {c.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPickupModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 text-xs font-bold shadow-md transition-all"
                >
                  Tugaskan & Kirim Kurir
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
