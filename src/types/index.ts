export type ServiceStatus = 
  | 'Antre' 
  | 'Diagnosa' 
  | 'Pengerjaan' 
  | 'Menunggu Sparepart' 
  | 'Selesai' 
  | 'Diambil';

export type ServiceCategory = 
  | 'Servis Ringan' 
  | 'Servis Berkala' 
  | 'Ganti Oli & Tune Up' 
  | 'Sistem Rem & CVT' 
  | 'Turun Mesin & Kelistrikan'
  | 'Overhaul Suspensi';

export interface PartUsage {
  partId: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
}

export interface InspectionChecklist {
  oliMesin: boolean;
  busiPengapian: boolean;
  sistemRem: boolean;
  cvtRantai: boolean;
  filterUdara: boolean;
  akiKelistrikan: boolean;
  tekananBan: boolean;
  radiatorCoolant: boolean;
}

export interface ServiceOrder {
  id: string;
  orderNumber: string; // e.g. SRV-2026-089
  customerName: string;
  customerPhone: string;
  motorModel: string; // e.g. Honda Vario 160, Yamaha NMAX 155, Honda Beat
  plateNumber: string; // e.g. B 4821 KJF
  serviceCategory: ServiceCategory;
  complaints: string;
  bayNumber: number; // 1 - 4
  mechanicId: string;
  mechanicName: string;
  status: ServiceStatus;
  estimatedMinutes: number;
  laborCost: number;
  partsUsed: PartUsage[];
  totalCost: number;
  checklist: InspectionChecklist;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export type InventoryCategory = 
  | 'Oli & Pelumas'
  | 'Sistem Pengereman'
  | 'Transmisi & CVT'
  | 'Mesin & Pengapian'
  | 'Kelistrikan & Aki'
  | 'Ban & Roda'
  | 'Filter & Cairan';

export interface InventoryPart {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  stock: number;
  minStock: number;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  shelfLocation: string; // e.g. Rak A-03
  compatibleMotors: string[];
  lastRestocked: string;
}

export type UserRole = 
  | 'Super Admin' 
  | 'Kepala Bengkel' 
  | 'Mekanik Senior' 
  | 'Mekanik Lapangan' 
  | 'Kasir & Front Desk';

export type EmployeeRole = UserRole;

export type EmployeePermissions = {
  canManageInventory: boolean;
  canManageEmployees: boolean;
  canManageServices: boolean;
  canExportReports: boolean;
  canConfigureRAD: boolean;
};

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'Aktif' | 'Bertugas' | 'Cuti';
  specialization: string;
  rating: number;
  completedJobs: number;
  activeOrderId?: string;
  avatarUrl?: string;
  password?: string;
  permissions: {
    canManageInventory: boolean;
    canManageEmployees: boolean;
    canManageServices: boolean;
    canExportReports: boolean;
    canConfigureRAD: boolean;
  };
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'critical_stock' | 'service_update' | 'mechanic_alert' | 'system';
  timestamp: string;
  read: boolean;
  partId?: string;
  orderId?: string;
}

export interface MonthlySummary {
  monthName: string;
  year: number;
  totalRevenue: number;
  serviceLaborRevenue: number;
  partsRevenue: number;
  partsCost: number;
  grossProfit: number;
  completedServices: number;
  totalCustomers: number;
  averageSatisfaction: number;
}

export interface CourierDriver {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'Motor Box Towing' | 'Pickup Hidrolik' | 'Rider Diagnosa Mobile';
  plateNumber: string;
  status: 'Menuju Pelanggan' | 'Mengangkut Motor' | 'Menuju Bengkel' | 'Standby di Hub';
  currentLat: number;
  currentLng: number;
  heading: number;
  speedKmH: number;
  batteryLevel: number;
  activeTaskId?: string;
  completedToday: number;
  rating: number;
}

export interface PickupTask {
  id: string;
  taskNumber: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  lat: number;
  lng: number;
  motorModel: string;
  plateNumber: string;
  issueDescription: string;
  courierId: string;
  courierName: string;
  status: 'Menuju Lokasi' | 'Proses Pengangkutan' | 'Perjalanan ke Bengkel' | 'Tiba di Bengkel';
  etaMinutes: number;
  distanceKm: number;
  scheduledTime: string;
  urgency: 'Tinggi (Mogok Total)' | 'Sedang (Servis Rutin)' | 'Rendah (Booking Esok)';
  routeCoordinates: [number, number][];
}

export type ChatChannel = 'service-bay' | 'spareparts' | 'front-desk' | 'general';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  channel: ChatChannel;
  serviceOrderId?: string;
  servicePlateNumber?: string;
  isUrgent?: boolean;
}

export interface OnlineEmployee {
  employeeId: string;
  name: string;
  role: string;
  lastActive: string;
}

