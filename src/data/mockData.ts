import { ServiceOrder, InventoryPart, Employee, PushNotification } from '../types';

export const INITIAL_PARTS: InventoryPart[] = [
  {
    id: 'prt-01',
    sku: 'OLI-MTL-7100',
    name: 'Oli Mesin Motul 7100 4T 10W-40 (1L)',
    category: 'Oli & Pelumas',
    stock: 4, // Critical low stock (min is 8)
    minStock: 8,
    unit: 'Botol',
    buyPrice: 145000,
    sellPrice: 185000,
    shelfLocation: 'Rak A-01 (Atas)',
    compatibleMotors: ['Yamaha NMAX', 'Honda PCX', 'Kawasaki Ninja', 'CBR 150R'],
    lastRestocked: '2026-09-10'
  },
  {
    id: 'prt-02',
    sku: 'OLI-YAM-MAT',
    name: 'Yamalube Super Matic 10W-40 SL (1L)',
    category: 'Oli & Pelumas',
    stock: 18,
    minStock: 10,
    unit: 'Botol',
    buyPrice: 62000,
    sellPrice: 78000,
    shelfLocation: 'Rak A-02',
    compatibleMotors: ['Yamaha NMAX', 'Aerox 155', 'Lexi 125', 'Mio M3'],
    lastRestocked: '2026-09-18'
  },
  {
    id: 'prt-03',
    sku: 'OLI-AHM-MPX2',
    name: 'AHM Oil MPX2 Matic 10W-30 (0.8L)',
    category: 'Oli & Pelumas',
    stock: 24,
    minStock: 12,
    unit: 'Botol',
    buyPrice: 48000,
    sellPrice: 62000,
    shelfLocation: 'Rak A-03',
    compatibleMotors: ['Honda Vario 125/160', 'Honda Beat', 'Scoopy', 'Genio'],
    lastRestocked: '2026-09-20'
  },
  {
    id: 'prt-04',
    sku: 'REM-NIS-FR01',
    name: 'Kampas Rem Depan Nissin Samurai Brake Pad',
    category: 'Sistem Pengereman',
    stock: 3, // Critical low stock
    minStock: 6,
    unit: 'Set',
    buyPrice: 95000,
    sellPrice: 135000,
    shelfLocation: 'Rak B-01',
    compatibleMotors: ['Yamaha NMAX 155', 'Honda PCX 160', 'Vario 160 ABS'],
    lastRestocked: '2026-09-08'
  },
  {
    id: 'prt-05',
    sku: 'REM-AHM-DSK',
    name: 'Brake Shoe / Kampas Rem Belakang Tromol AHM',
    category: 'Sistem Pengereman',
    stock: 14,
    minStock: 8,
    unit: 'Set',
    buyPrice: 42000,
    sellPrice: 58000,
    shelfLocation: 'Rak B-02',
    compatibleMotors: ['Honda Beat FI', 'Vario 125', 'Scoopy FI'],
    lastRestocked: '2026-09-15'
  },
  {
    id: 'prt-06',
    sku: 'CVT-BND-V160',
    name: 'V-Belt Bando Racing Super CVT Vario 160',
    category: 'Transmisi & CVT',
    stock: 2, // Critical low stock
    minStock: 5,
    unit: 'Pcs',
    buyPrice: 135000,
    sellPrice: 180000,
    shelfLocation: 'Rak C-01',
    compatibleMotors: ['Honda Vario 160', 'Honda PCX 160', 'ADV 160'],
    lastRestocked: '2026-09-05'
  },
  {
    id: 'prt-07',
    sku: 'CVT-ROL-KTC',
    name: 'Roller Weight Set KTC Kytaco 10gr - 13gr',
    category: 'Transmisi & CVT',
    stock: 11,
    minStock: 6,
    unit: 'Set (6 pcs)',
    buyPrice: 85000,
    sellPrice: 120000,
    shelfLocation: 'Rak C-02',
    compatibleMotors: ['NMAX', 'Aerox', 'Vario 150/160', 'Mio'],
    lastRestocked: '2026-09-17'
  },
  {
    id: 'prt-08',
    sku: 'IGN-NGK-IRID',
    name: 'Busi NGK MotoDX Laser Iridium CPR9EDX-9S',
    category: 'Mesin & Pengapian',
    stock: 7,
    minStock: 8, // Menipis
    unit: 'Pcs',
    buyPrice: 95000,
    sellPrice: 130000,
    shelfLocation: 'Rak D-01',
    compatibleMotors: ['Yamaha NMAX', 'Honda Vario 150/160', 'PCX', 'GSX-R150'],
    lastRestocked: '2026-09-12'
  },
  {
    id: 'prt-09',
    sku: 'AKI-YUA-GTZ6V',
    name: 'Aki Kering Motor Yuasa Maintenance Free YTZ6V',
    category: 'Kelistrikan & Aki',
    stock: 6,
    minStock: 4,
    unit: 'Buah',
    buyPrice: 265000,
    sellPrice: 325000,
    shelfLocation: 'Rak E-01 (Bawah)',
    compatibleMotors: ['Vario 150/160', 'PCX 150', 'CBR 150R', 'Sonic 150R'],
    lastRestocked: '2026-09-16'
  },
  {
    id: 'prt-10',
    sku: 'FLT-AHM-VAR',
    name: 'Filter Udara AHM Viscous Element Original',
    category: 'Filter & Cairan',
    stock: 16,
    minStock: 6,
    unit: 'Pcs',
    buyPrice: 47000,
    sellPrice: 65000,
    shelfLocation: 'Rak D-03',
    compatibleMotors: ['Honda Vario 125', 'Vario 150', 'Click 125/150'],
    lastRestocked: '2026-09-19'
  },
  {
    id: 'prt-11',
    sku: 'BAN-MIC-PLT',
    name: 'Ban Luar Tubeless Michelin Pilot Street 110/70-14',
    category: 'Ban & Roda',
    stock: 5,
    minStock: 4,
    unit: 'Buah',
    buyPrice: 340000,
    sellPrice: 410000,
    shelfLocation: 'Area Ban Rak Belakang',
    compatibleMotors: ['Yamaha Aerox 155', 'Honda ADV 150/160'],
    lastRestocked: '2026-09-14'
  }
];

export const INITIAL_SERVICES: ServiceOrder[] = [
  {
    id: 'srv-001',
    orderNumber: 'SRV-2026-091',
    customerName: 'Bambang Setyo',
    customerPhone: '0812-9843-2190',
    motorModel: 'Yamaha NMAX 155 Connected',
    plateNumber: 'B 4192 EAB',
    serviceCategory: 'Sistem Rem & CVT',
    complaints: 'Tarikan awal gredek bergetar keras di putaran 20-40 km/h, rem depan terasa dalam dan agak blong.',
    bayNumber: 1,
    mechanicId: 'emp-02',
    mechanicName: 'Agus Santoso (Kepala Mekanik)',
    status: 'Pengerjaan',
    estimatedMinutes: 50,
    laborCost: 95000,
    partsUsed: [
      {
        partId: 'prt-07',
        sku: 'CVT-ROL-KTC',
        name: 'Roller Weight Set KTC Kytaco 10gr - 13gr',
        quantity: 1,
        price: 120000
      },
      {
        partId: 'prt-04',
        sku: 'REM-NIS-FR01',
        name: 'Kampas Rem Depan Nissin Samurai Brake Pad',
        quantity: 1,
        price: 135000
      }
    ],
    totalCost: 350000,
    checklist: {
      oliMesin: true,
      busiPengapian: true,
      sistemRem: false,
      cvtRantai: false,
      filterUdara: true,
      akiKelistrikan: true,
      tekananBan: true,
      radiatorCoolant: true
    },
    createdAt: '2026-09-23 09:15',
    notes: 'Mangkok CVT perlu diamplas halus untuk menghilangkan slip getaran.'
  },
  {
    id: 'srv-002',
    orderNumber: 'SRV-2026-092',
    customerName: 'Dian Permatasari',
    customerPhone: '0857-1122-3344',
    motorModel: 'Honda Vario 160 eSP+',
    plateNumber: 'B 3088 SGY',
    serviceCategory: 'Ganti Oli & Tune Up',
    complaints: 'Servis rutin 10.000 km, ganti oli mesin Motul dan kuras radiator coolant.',
    bayNumber: 2,
    mechanicId: 'emp-03',
    mechanicName: 'Fajar Nugraha (Mekanik Senior)',
    status: 'Pengerjaan',
    estimatedMinutes: 35,
    laborCost: 65000,
    partsUsed: [
      {
        partId: 'prt-01',
        sku: 'OLI-MTL-7100',
        name: 'Oli Mesin Motul 7100 4T 10W-40 (1L)',
        quantity: 1,
        price: 185000
      },
      {
        partId: 'prt-10',
        sku: 'FLT-AHM-VAR',
        name: 'Filter Udara AHM Viscous Element Original',
        quantity: 1,
        price: 65000
      }
    ],
    totalCost: 315000,
    checklist: {
      oliMesin: false,
      busiPengapian: true,
      sistemRem: true,
      cvtRantai: true,
      filterUdara: false,
      akiKelistrikan: true,
      tekananBan: true,
      radiatorCoolant: true
    },
    createdAt: '2026-09-23 09:45',
    notes: 'Kondisi air radiator masih cukup, hanya perlu top up sedikit.'
  },
  {
    id: 'srv-003',
    orderNumber: 'SRV-2026-093',
    customerName: 'Reza Hendrawan',
    customerPhone: '0813-8877-6655',
    motorModel: 'Kawasaki Ninja 250 FI',
    plateNumber: 'B 6214 KTL',
    serviceCategory: 'Turun Mesin & Kelistrikan',
    complaints: 'Motor sering mati mendadak saat deselerasi, starter berat dan ada kode error kedip di spidometer.',
    bayNumber: 3,
    mechanicId: 'emp-02',
    mechanicName: 'Agus Santoso (Kepala Mekanik)',
    status: 'Diagnosa',
    estimatedMinutes: 90,
    laborCost: 180000,
    partsUsed: [
      {
        partId: 'prt-08',
        sku: 'IGN-NGK-IRID',
        name: 'Busi NGK MotoDX Laser Iridium CPR9EDX-9S',
        quantity: 2,
        price: 260000
      }
    ],
    totalCost: 440000,
    checklist: {
      oliMesin: true,
      busiPengapian: false,
      sistemRem: true,
      cvtRantai: true,
      filterUdara: true,
      akiKelistrikan: false,
      tekananBan: true,
      radiatorCoolant: true
    },
    createdAt: '2026-09-23 10:10',
    notes: 'Sedang dilakukan scan ECU dengan scanner OBD2.'
  },
  {
    id: 'srv-004',
    orderNumber: 'SRV-2026-094',
    customerName: 'Siti Aminah',
    customerPhone: '0819-4567-8901',
    motorModel: 'Honda Beat Street 2024',
    plateNumber: 'B 5543 BTL',
    serviceCategory: 'Servis Ringan',
    complaints: 'Ganti oli rutin bulanan, cek rem belakang agak dalam, stang agak miring.',
    bayNumber: 4,
    mechanicId: 'emp-04',
    mechanicName: 'Dimas Aditya (Mekanik Lapangan)',
    status: 'Antre',
    estimatedMinutes: 25,
    laborCost: 50000,
    partsUsed: [
      {
        partId: 'prt-03',
        sku: 'OLI-AHM-MPX2',
        name: 'AHM Oil MPX2 Matic 10W-30 (0.8L)',
        quantity: 1,
        price: 62000
      }
    ],
    totalCost: 112000,
    checklist: {
      oliMesin: false,
      busiPengapian: true,
      sistemRem: false,
      cvtRantai: true,
      filterUdara: true,
      akiKelistrikan: true,
      tekananBan: true,
      radiatorCoolant: true
    },
    createdAt: '2026-09-23 10:40',
    notes: 'Antrean nomor 4, menunggu Bay 2 selesai.'
  },
  {
    id: 'srv-005',
    orderNumber: 'SRV-2026-088',
    customerName: 'Hendra Wijaya',
    customerPhone: '0812-4433-2211',
    motorModel: 'Yamaha Aerox 155 VVA',
    plateNumber: 'B 3177 KZX',
    serviceCategory: 'Servis Berkala',
    complaints: 'Ganti ban belakang Michelin Pilot Street & tune up CVT.',
    bayNumber: 1,
    mechanicId: 'emp-03',
    mechanicName: 'Fajar Nugraha (Mekanik Senior)',
    status: 'Selesai',
    estimatedMinutes: 45,
    laborCost: 80000,
    partsUsed: [
      {
        partId: 'prt-11',
        sku: 'BAN-MIC-PLT',
        name: 'Ban Luar Tubeless Michelin Pilot Street 110/70-14',
        quantity: 1,
        price: 410000
      }
    ],
    totalCost: 490000,
    checklist: {
      oliMesin: true,
      busiPengapian: true,
      sistemRem: true,
      cvtRantai: true,
      filterUdara: true,
      akiKelistrikan: true,
      tekananBan: true,
      radiatorCoolant: true
    },
    createdAt: '2026-09-23 08:00',
    completedAt: '2026-09-23 09:05',
    notes: 'Motor sudah selesai dicoba test ride, siap diambil pelanggan.'
  },
  {
    id: 'srv-006',
    orderNumber: 'SRV-2026-085',
    customerName: 'Ilham Ramadhan',
    customerPhone: '0822-5544-3322',
    motorModel: 'Honda Scoopy Prestige',
    plateNumber: 'B 4821 JKL',
    serviceCategory: 'Ganti Oli & Tune Up',
    complaints: 'Ganti oli MPX2, bersihkan CVT berdebu, dan ganti busi NGK Iridium.',
    bayNumber: 3,
    mechanicId: 'emp-04',
    mechanicName: 'Dimas Aditya (Mekanik Lapangan)',
    status: 'Diambil',
    estimatedMinutes: 30,
    laborCost: 55000,
    partsUsed: [
      {
        partId: 'prt-03',
        sku: 'OLI-AHM-MPX2',
        name: 'AHM Oil MPX2 Matic 10W-30 (0.8L)',
        quantity: 1,
        price: 62000
      },
      {
        partId: 'prt-08',
        sku: 'IGN-NGK-IRID',
        name: 'Busi NGK MotoDX Laser Iridium CPR9EDX-9S',
        quantity: 1,
        price: 130000
      }
    ],
    totalCost: 247000,
    checklist: {
      oliMesin: true,
      busiPengapian: true,
      sistemRem: true,
      cvtRantai: true,
      filterUdara: true,
      akiKelistrikan: true,
      tekananBan: true,
      radiatorCoolant: true
    },
    createdAt: '2026-09-22 14:30',
    completedAt: '2026-09-22 15:10',
    notes: 'Pelanggan puas, pembayaran tunai lunas dan motor sudah diambil.'
  },
  {
    id: 'srv-007',
    orderNumber: 'SRV-2026-080',
    customerName: 'Maya Kusuma',
    customerPhone: '0856-7788-9900',
    motorModel: 'Vespa Sprint 150 i-Get',
    plateNumber: 'B 3319 PRV',
    serviceCategory: 'Servis Berkala',
    complaints: 'Tarikan getar di tanjakan, rem belakang bunyi berdecit saat macet.',
    bayNumber: 2,
    mechanicId: 'emp-02',
    mechanicName: 'Agus Santoso (Kepala Mekanik)',
    status: 'Selesai',
    estimatedMinutes: 60,
    laborCost: 120000,
    partsUsed: [
      {
        partId: 'prt-01',
        sku: 'OLI-MTL-7100',
        name: 'Oli Mesin Motul 7100 4T 10W-40 (1L)',
        quantity: 1,
        price: 185000
      },
      {
        partId: 'prt-04',
        sku: 'REM-NIS-FR01',
        name: 'Kampas Rem Depan Nissin Samurai Brake Pad',
        quantity: 1,
        price: 135000
      }
    ],
    totalCost: 440000,
    checklist: {
      oliMesin: true,
      busiPengapian: true,
      sistemRem: true,
      cvtRantai: true,
      filterUdara: true,
      akiKelistrikan: true,
      tekananBan: true,
      radiatorCoolant: true
    },
    createdAt: '2026-09-21 10:15',
    completedAt: '2026-09-21 11:20',
    notes: 'Permukaan kampas rem dibersihkan dan minyak rem dikuras baru.'
  },
  {
    id: 'srv-008',
    orderNumber: 'SRV-2026-076',
    customerName: 'Wahyu Hidayat',
    customerPhone: '0812-7711-2299',
    motorModel: 'Yamaha NMAX 155 Connected',
    plateNumber: 'B 6942 WHD',
    serviceCategory: 'Sistem Rem & CVT',
    complaints: 'Ganti roller KTC 11 gram dan servis berkala 15.000 km.',
    bayNumber: 1,
    mechanicId: 'emp-03',
    mechanicName: 'Fajar Nugraha (Mekanik Senior)',
    status: 'Diambil',
    estimatedMinutes: 40,
    laborCost: 75000,
    partsUsed: [
      {
        partId: 'prt-07',
        sku: 'CVT-ROL-KTC',
        name: 'Roller Weight Set KTC Kytaco 10gr - 13gr',
        quantity: 1,
        price: 120000
      }
    ],
    totalCost: 195000,
    checklist: {
      oliMesin: true,
      busiPengapian: true,
      sistemRem: true,
      cvtRantai: true,
      filterUdara: true,
      akiKelistrikan: true,
      tekananBan: true,
      radiatorCoolant: true
    },
    createdAt: '2026-09-20 13:00',
    completedAt: '2026-09-20 13:45',
    notes: 'Roller lama aus peang di 3 butir. Akselerasi kembali responsif.'
  },
  {
    id: 'srv-009',
    orderNumber: 'SRV-2026-071',
    customerName: 'Doni Prasetyo',
    customerPhone: '0878-1122-4455',
    motorModel: 'Honda PCX 160 ABS',
    plateNumber: 'B 5188 DNP',
    serviceCategory: 'Servis Ringan',
    complaints: 'Ganti filter udara original AHM dan cek kelistrikan starter.',
    bayNumber: 4,
    mechanicId: 'emp-04',
    mechanicName: 'Dimas Aditya (Mekanik Lapangan)',
    status: 'Diambil',
    estimatedMinutes: 25,
    laborCost: 45000,
    partsUsed: [
      {
        partId: 'prt-10',
        sku: 'FLT-AHM-VAR',
        name: 'Filter Udara AHM Viscous Element Original',
        quantity: 1,
        price: 65000
      }
    ],
    totalCost: 110000,
    checklist: {
      oliMesin: true,
      busiPengapian: true,
      sistemRem: true,
      cvtRantai: true,
      filterUdara: true,
      akiKelistrikan: true,
      tekananBan: true,
      radiatorCoolant: true
    },
    createdAt: '2026-09-18 09:30',
    completedAt: '2026-09-18 10:00',
    notes: 'Filter udara diganti baru, boks saringan udara dibersihkan.'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-01',
    name: 'Nurul Arif',
    email: 'nurularif629@gmail.com',
    phone: '0812-8899-0011',
    role: 'Super Admin',
    status: 'Aktif',
    specialization: 'Sistem Manajemen & Kontrol Operasional Bengkel',
    rating: 4.9,
    completedJobs: 410,
    avatarUrl: '/src/assets/images/lead_mechanic_avatar_1790188086358.jpg',
    permissions: {
      canManageInventory: true,
      canManageEmployees: true,
      canManageServices: true,
      canExportReports: true,
      canConfigureRAD: true
    }
  },
  {
    id: 'emp-02',
    name: 'Agus Santoso',
    email: 'agus.santoso@motobengkel.id',
    phone: '0857-3344-5566',
    role: 'Kepala Bengkel',
    status: 'Bertugas',
    specialization: 'Injeksi, Kelistrikan ECU, & Overhaul Mesin',
    rating: 4.9,
    completedJobs: 284,
    activeOrderId: 'srv-001',
    permissions: {
      canManageInventory: true,
      canManageEmployees: false,
      canManageServices: true,
      canExportReports: true,
      canConfigureRAD: true
    }
  },
  {
    id: 'emp-03',
    name: 'Fajar Nugraha',
    email: 'fajar.nugraha@motobengkel.id',
    phone: '0813-7766-5544',
    role: 'Mekanik Senior',
    status: 'Bertugas',
    specialization: 'Transmisi CVT Matic & Sistem Suspensi',
    rating: 4.8,
    completedJobs: 198,
    activeOrderId: 'srv-002',
    permissions: {
      canManageInventory: true,
      canManageEmployees: false,
      canManageServices: true,
      canExportReports: false,
      canConfigureRAD: false
    }
  },
  {
    id: 'emp-04',
    name: 'Dimas Aditya',
    email: 'dimas.aditya@motobengkel.id',
    phone: '0819-2233-4455',
    role: 'Mekanik Lapangan',
    status: 'Aktif',
    specialization: 'Servis Ringan, Ganti Ban, & Tune Up Cepat',
    rating: 4.7,
    completedJobs: 112,
    permissions: {
      canManageInventory: false,
      canManageEmployees: false,
      canManageServices: true,
      canExportReports: false,
      canConfigureRAD: false
    }
  },
  {
    id: 'emp-05',
    name: 'Rina Safitri',
    email: 'rina.safitri@motobengkel.id',
    phone: '0821-6677-8899',
    role: 'Kasir & Front Desk',
    status: 'Aktif',
    specialization: 'Front Desk, Kasir Pembayaran, & Faktur Pajak',
    rating: 4.9,
    completedJobs: 520,
    permissions: {
      canManageInventory: true,
      canManageEmployees: false,
      canManageServices: true,
      canExportReports: true,
      canConfigureRAD: false
    }
  }
];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif-01',
    title: 'Peringatan Stok Suku Cadang Kritis!',
    message: 'V-Belt Bando Racing Vario 160 (PRT-06) tersisa 2 pcs (di bawah batas minimum 5 pcs). Segera lakukan pemesanan ulang.',
    type: 'critical_stock',
    timestamp: 'Baru saja (10:45)',
    read: false,
    partId: 'prt-06'
  },
  {
    id: 'notif-02',
    title: 'Stok Kampas Rem Nissin Menipis',
    message: 'Kampas Rem Depan Nissin Samurai tersisa 3 set (ambang batas: 6 set).',
    type: 'critical_stock',
    timestamp: '15 menit lalu',
    read: false,
    partId: 'prt-04'
  },
  {
    id: 'notif-03',
    title: 'Servis Selesai di Bay 1',
    message: 'Yamaha Aerox 155 (B 3177 KZX) telah selesai pengerjaan oleh Mekanik Fajar. Faktur siap dicetak.',
    type: 'service_update',
    timestamp: '45 menit lalu',
    read: true,
    orderId: 'srv-005'
  },
  {
    id: 'notif-04',
    title: 'Approval Penggunaan Suku Cadang',
    message: 'Kepala Mekanik Agus meminta approval 2x Busi NGK Iridium untuk Ninja 250 FI (B 6214 KTL).',
    type: 'mechanic_alert',
    timestamp: '1 jam lalu',
    read: true,
    orderId: 'srv-003'
  }
];
