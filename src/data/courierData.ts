import { CourierDriver, PickupTask } from '../types';

export const WORKSHOP_HQ = {
  name: 'MotoRAD Engine Central Workshop',
  address: 'Jl. Raya Otomotif No. 88, Kemang, Jakarta Selatan',
  lat: -6.2615,
  lng: 106.8106,
  phone: '0812-3456-7890'
};

export const INITIAL_COURIERS: CourierDriver[] = [
  {
    id: 'cour-01',
    name: 'Rian Pratama',
    phone: '0812-9876-1101',
    vehicleType: 'Motor Box Towing',
    plateNumber: 'B 6712 TPK',
    status: 'Menuju Pelanggan',
    currentLat: -6.2730,
    currentLng: 106.8040,
    heading: 210,
    speedKmH: 38,
    batteryLevel: 88,
    activeTaskId: 'PKP-2026-081',
    completedToday: 4,
    rating: 4.9
  },
  {
    id: 'cour-02',
    name: 'Doni Kusuma',
    phone: '0813-4455-2202',
    vehicleType: 'Pickup Hidrolik',
    plateNumber: 'B 9104 WRT',
    status: 'Menuju Bengkel',
    currentLat: -6.2510,
    currentLng: 106.8220,
    heading: 245,
    speedKmH: 42,
    batteryLevel: 94,
    activeTaskId: 'PKP-2026-082',
    completedToday: 3,
    rating: 4.8
  },
  {
    id: 'cour-03',
    name: 'Hendra Wijaya',
    phone: '0815-7788-3303',
    vehicleType: 'Rider Diagnosa Mobile',
    plateNumber: 'B 3481 SBY',
    status: 'Mengangkut Motor',
    currentLat: -6.2870,
    currentLng: 106.8150,
    heading: 330,
    speedKmH: 15,
    batteryLevel: 76,
    activeTaskId: 'PKP-2026-083',
    completedToday: 5,
    rating: 5.0
  },
  {
    id: 'cour-04',
    name: 'Arif Santoso',
    phone: '0817-1122-4404',
    vehicleType: 'Motor Box Towing',
    plateNumber: 'B 5529 KLD',
    status: 'Standby di Hub',
    currentLat: -6.2615,
    currentLng: 106.8106,
    heading: 0,
    speedKmH: 0,
    batteryLevel: 100,
    completedToday: 2,
    rating: 4.8
  }
];

export const INITIAL_PICKUP_TASKS: PickupTask[] = [
  {
    id: 'pkp-01',
    taskNumber: 'PKP-2026-081',
    customerName: 'Bp. Hendra Kusnadi',
    customerPhone: '0812-8899-0011',
    pickupAddress: 'Jl. Fatmawati Raya No. 42, Cilandak',
    lat: -6.2830,
    lng: 106.7970,
    motorModel: 'Honda PCX 160',
    plateNumber: 'B 3829 TXK',
    issueDescription: 'Mogok total di rumah, indikator smartkey berkedip merah dan mesin tidak merespons starter.',
    courierId: 'cour-01',
    courierName: 'Rian Pratama',
    status: 'Menuju Lokasi',
    etaMinutes: 8,
    distanceKm: 1.4,
    scheduledTime: '13:00 WIB',
    urgency: 'Tinggi (Mogok Total)',
    routeCoordinates: [
      [-6.2615, 106.8106],
      [-6.2680, 106.8080],
      [-6.2730, 106.8040],
      [-6.2780, 106.8000],
      [-6.2830, 106.7970]
    ]
  },
  {
    id: 'pkp-02',
    taskNumber: 'PKP-2026-082',
    customerName: 'Ibu Dian Pertiwi',
    customerPhone: '0813-1122-3344',
    pickupAddress: 'Jl. Ampera Raya No. 19, Pasar Minggu',
    lat: -6.2420,
    lng: 106.8320,
    motorModel: 'Yamaha NMAX 155',
    plateNumber: 'B 6612 ZXY',
    issueDescription: 'Jemput motor untuk servis berkala 10.000 KM + penggantian V-Belt dan roller CVT.',
    courierId: 'cour-02',
    courierName: 'Doni Kusuma',
    status: 'Perjalanan ke Bengkel',
    etaMinutes: 12,
    distanceKm: 2.3,
    scheduledTime: '13:30 WIB',
    urgency: 'Sedang (Servis Rutin)',
    routeCoordinates: [
      [-6.2420, 106.8320],
      [-6.2460, 106.8270],
      [-6.2510, 106.8220],
      [-6.2570, 106.8160],
      [-6.2615, 106.8106]
    ]
  },
  {
    id: 'pkp-03',
    taskNumber: 'PKP-2026-083',
    customerName: 'Sdr. Kevin Sanjaya',
    customerPhone: '0857-4433-2211',
    pickupAddress: 'Apartemen Simatupang Tower B, Lobby Utama',
    lat: -6.2930,
    lng: 106.8190,
    motorModel: 'Honda CBR250RR',
    plateNumber: 'B 4991 JKL',
    issueDescription: 'Ban belakang bocor halus tertancap paku besar, minta ganti ban Michelin + ganti kampas rem.',
    courierId: 'cour-03',
    courierName: 'Hendra Wijaya',
    status: 'Proses Pengangkutan',
    etaMinutes: 4,
    distanceKm: 0.8,
    scheduledTime: '14:00 WIB',
    urgency: 'Sedang (Servis Rutin)',
    routeCoordinates: [
      [-6.2615, 106.8106],
      [-6.2750, 106.8140],
      [-6.2870, 106.8150],
      [-6.2930, 106.8190]
    ]
  }
];
