import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ServiceOrder, 
  InventoryPart, 
  Employee, 
  PushNotification, 
  ServiceStatus, 
  PartUsage, 
  InspectionChecklist,
  MonthlySummary
} from '../types';
import { 
  INITIAL_PARTS, 
  INITIAL_SERVICES, 
  INITIAL_EMPLOYEES, 
  INITIAL_NOTIFICATIONS 
} from '../data/mockData';

interface WorkshopContextType {
  // Services
  services: ServiceOrder[];
  addService: (newService: Omit<ServiceOrder, 'id' | 'orderNumber' | 'createdAt' | 'totalCost'>) => void;
  updateServiceStatus: (orderId: string, status: ServiceStatus) => void;
  updateServiceChecklist: (orderId: string, checklist: Partial<InspectionChecklist>) => void;
  addPartsToService: (orderId: string, parts: PartUsage[]) => void;
  deleteService: (orderId: string) => void;

  // Inventory
  inventory: InventoryPart[];
  addInventoryPart: (part: Omit<InventoryPart, 'id' | 'lastRestocked'>) => void;
  updateInventoryPart: (id: string, part: Partial<InventoryPart>) => void;
  restockPart: (id: string, quantityToAdd: number) => void;
  lowStockCount: number;
  criticalParts: InventoryPart[];

  // Employees & Auth Simulation
  employees: Employee[];
  currentEmployee: Employee;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuestVisitor: boolean;
  login: (email: string, password?: string) => { success: boolean; message: string };
  loginAsGuest: () => void;
  logout: () => void;
  switchCurrentEmployee: (employeeId: string) => void;
  updateEmployee: (id: string, updated: Partial<Employee>) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  setMeAsSuperAdmin: (name?: string, email?: string) => void;

  // Push Notifications
  notifications: PushNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  triggerPushNotification: (title: string, message: string, type?: PushNotification['type']) => void;
  activeBannerNotification: PushNotification | null;
  dismissBanner: () => void;

  // Analytics & Summary
  getMonthlySummary: (month?: string) => MonthlySummary;
  getBayStatus: () => Array<{
    bay: number;
    currentOrder: ServiceOrder | null;
    mechanicName: string;
    isOccupied: boolean;
  }>;

  // RAD Simulation
  resetToDefaultData: () => void;
  activeView: 'dashboard' | 'services' | 'inventory' | 'employees' | 'reports' | 'rad' | 'couriers';
  setActiveView: (view: 'dashboard' | 'services' | 'inventory' | 'employees' | 'reports' | 'rad' | 'couriers') => void;

  // Theme & OS Detection
  themePreference: 'system' | 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
  setThemePreference: (theme: 'system' | 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const WorkshopContext = createContext<WorkshopContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SERVICES: 'motorad_services_v2',
  INVENTORY: 'motorad_inventory_v1',
  EMPLOYEES: 'motorad_employees_v1',
  NOTIFICATIONS: 'motorad_notifications_v1',
  CURRENT_USER: 'motorad_current_user_v1',
  AUTH_STATE: 'motorad_auth_state_v1',
  THEME: 'motorad_theme_v1'
};

export const WorkshopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<ServiceOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return saved ? JSON.parse(saved) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  const [inventory, setInventory] = useState<InventoryPart[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      return saved ? JSON.parse(saved) : INITIAL_PARTS;
    } catch {
      return INITIAL_PARTS;
    }
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      if (saved) {
        const parsed: Employee[] = JSON.parse(saved);
        const adminIdx = parsed.findIndex(e => e.email === 'nurularif629@gmail.com' || e.name === 'Nurul Arif' || e.id === 'emp-01');
        if (adminIdx >= 0) {
          parsed[adminIdx].name = 'Nurul Arif';
          parsed[adminIdx].email = 'nurularif629@gmail.com';
          parsed[adminIdx].role = 'Super Admin';
          parsed[adminIdx].status = 'Aktif';
          parsed[adminIdx].permissions = {
            canManageInventory: true,
            canManageEmployees: true,
            canManageServices: true,
            canExportReports: true,
            canConfigureRAD: true
          };
          return parsed;
        }
        return [INITIAL_EMPLOYEES[0], ...parsed];
      }
      return INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return saved;
      return 'emp-01';
    } catch {
      return 'emp-01';
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
      // Default to true if not explicitly set to 'false'
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const [isGuestVisitor, setIsGuestVisitor] = useState<boolean>(() => {
    try {
      return localStorage.getItem('motorad_is_guest') === 'true';
    } catch {
      return false;
    }
  });

  const [activeBannerNotification, setActiveBannerNotification] = useState<PushNotification | null>(() => {
    return notifications.find(n => !n.read && n.type === 'critical_stock') || null;
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'services' | 'inventory' | 'employees' | 'reports' | 'rad' | 'couriers'>('dashboard');

  // Theme & OS Detection
  const [themePreference, setThemePreferenceState] = useState<'system' | 'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
      return 'system';
    } catch {
      return 'system';
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // OS Theme Detection & Preference synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyThemeToDOM = (isDark: boolean) => {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    };

    const updateResolvedTheme = () => {
      const systemIsDark = mediaQuery.matches;
      const isDark = themePreference === 'system' ? systemIsDark : themePreference === 'dark';
      setResolvedTheme(isDark ? 'dark' : 'light');
      applyThemeToDOM(isDark);
    };

    updateResolvedTheme();

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (themePreference === 'system') {
        const isDark = e.matches;
        setResolvedTheme(isDark ? 'dark' : 'light');
        applyThemeToDOM(isDark);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themePreference]);

  const setThemePreference = (pref: 'system' | 'light' | 'dark') => {
    setThemePreferenceState(pref);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, pref);
    } catch {}
  };

  const toggleTheme = () => {
    if (themePreference === 'system') {
      setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else if (themePreference === 'dark') {
      setThemePreference('light');
    } else {
      setThemePreference('system');
    }
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, currentEmployeeId);
  }, [currentEmployeeId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH_STATE, String(isAuthenticated));
  }, [isAuthenticated]);

  const guestEmployeeProfile: Employee = {
    id: 'guest-visitor',
    name: 'Pengunjung Bengkel',
    email: 'pengunjung@motobengkel.id',
    phone: '0812-0000-0000',
    role: 'Pengunjung Bengkel' as any,
    status: 'Aktif',
    specialization: 'Pelanggan / Pengunjung',
    rating: 5,
    completedJobs: 0,
    permissions: {
      canManageInventory: false,
      canManageEmployees: false,
      canManageServices: false,
      canExportReports: false,
      canConfigureRAD: false,
    }
  };

  const currentEmployee = isGuestVisitor 
    ? guestEmployeeProfile 
    : (employees.find(e => e.id === currentEmployeeId) || employees[0] || INITIAL_EMPLOYEES[0]);
  const isAdmin = !isGuestVisitor && (currentEmployee.role === 'Super Admin' || !!currentEmployee.permissions.canManageEmployees);

  const criticalParts = inventory.filter(p => p.stock <= p.minStock);
  const lowStockCount = criticalParts.length;

  const triggerPushNotification = (title: string, message: string, type: PushNotification['type'] = 'system') => {
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Baru saja',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setActiveBannerNotification(newNotif);
  };

  const dismissBanner = () => {
    setActiveBannerNotification(null);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (activeBannerNotification?.id === id) {
      setActiveBannerNotification(null);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setActiveBannerNotification(null);
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (activeBannerNotification?.id === id) {
      setActiveBannerNotification(null);
    }
  };

  // Add Service Order with auto stock deduction
  const addService = (newServiceData: Omit<ServiceOrder, 'id' | 'orderNumber' | 'createdAt' | 'totalCost'>) => {
    const nextNum = services.length + 95;
    const orderNumber = `SRV-2026-${String(nextNum).padStart(3, '0')}`;
    const now = new Date();
    const createdAt = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const partsTotal = newServiceData.partsUsed.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    const totalCost = newServiceData.laborCost + partsTotal;

    const newOrder: ServiceOrder = {
      ...newServiceData,
      id: `srv-${Date.now()}`,
      orderNumber,
      createdAt,
      totalCost
    };

    // Deduct stock in inventory
    if (newServiceData.partsUsed.length > 0) {
      setInventory(prev => {
        let updated = [...prev];
        newServiceData.partsUsed.forEach(used => {
          updated = updated.map(part => {
            if (part.id === used.partId) {
              const remaining = Math.max(0, part.stock - used.quantity);
              // Trigger notification if dropping below minStock
              if (remaining <= part.minStock) {
                setTimeout(() => {
                  triggerPushNotification(
                    `Peringatan Stok: ${part.name}`,
                    `Stok suku cadang berkurang menjadi ${remaining} ${part.unit} (Di bawah batas minimum ${part.minStock}).`,
                    'critical_stock'
                  );
                }, 100);
              }
              return { ...part, stock: remaining };
            }
            return part;
          });
        });
        return updated;
      });
    }

    setServices(prev => [newOrder, ...prev]);

    triggerPushNotification(
      `Servis Baru Terdaftar (${orderNumber})`,
      `Pelanggan ${newOrder.customerName} - ${newOrder.motorModel} (${newOrder.plateNumber}) masuk ke Bay ${newOrder.bayNumber}.`,
      'service_update'
    );
  };

  const updateServiceStatus = (orderId: string, newStatus: ServiceStatus) => {
    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setServices(prev => prev.map(order => {
      if (order.id === orderId) {
        const completedAt = newStatus === 'Selesai' || newStatus === 'Diambil' ? (order.completedAt || timeStr) : undefined;
        return { ...order, status: newStatus, completedAt };
      }
      return order;
    }));

    const found = services.find(s => s.id === orderId);
    if (found) {
      triggerPushNotification(
        `Status Servis ${found.orderNumber} Berubah`,
        `${found.motorModel} (${found.plateNumber}) kini berstatus: ${newStatus}.`,
        'service_update'
      );
    }
  };

  const updateServiceChecklist = (orderId: string, partialChecklist: Partial<InspectionChecklist>) => {
    setServices(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          checklist: { ...order.checklist, ...partialChecklist }
        };
      }
      return order;
    }));
  };

  const addPartsToService = (orderId: string, additionalParts: PartUsage[]) => {
    setServices(prev => prev.map(order => {
      if (order.id === orderId) {
        const existingParts = [...order.partsUsed];
        additionalParts.forEach(newItem => {
          const idx = existingParts.findIndex(p => p.partId === newItem.partId);
          if (idx >= 0) {
            existingParts[idx].quantity += newItem.quantity;
          } else {
            existingParts.push(newItem);
          }
        });
        const partsTotal = existingParts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
        return {
          ...order,
          partsUsed: existingParts,
          totalCost: order.laborCost + partsTotal
        };
      }
      return order;
    }));

    // Deduct stock
    setInventory(prev => {
      let updated = [...prev];
      additionalParts.forEach(item => {
        updated = updated.map(part => {
          if (part.id === item.partId) {
            const nextStock = Math.max(0, part.stock - item.quantity);
            if (nextStock <= part.minStock) {
              triggerPushNotification(
                `Stok Kritis: ${part.name}`,
                `Stok tinggal tersisa ${nextStock} ${part.unit}. Segera pesan ulang!`,
                'critical_stock'
              );
            }
            return { ...part, stock: nextStock };
          }
          return part;
        });
      });
      return updated;
    });
  };

  const deleteService = (orderId: string) => {
    setServices(prev => prev.filter(s => s.id !== orderId));
  };

  // Inventory actions
  const addInventoryPart = (partData: Omit<InventoryPart, 'id' | 'lastRestocked'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newPart: InventoryPart = {
      ...partData,
      id: `prt-${Date.now()}`,
      lastRestocked: today
    };
    setInventory(prev => [newPart, ...prev]);

    triggerPushNotification(
      'Suku Cadang Baru Ditambahkan',
      `${newPart.name} (${newPart.sku}) berhasil masuk ke katalog inventaris di ${newPart.shelfLocation}.`,
      'system'
    );
  };

  const updateInventoryPart = (id: string, updated: Partial<InventoryPart>) => {
    setInventory(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const restockPart = (id: string, quantityToAdd: number) => {
    const today = new Date().toISOString().split('T')[0];
    let partName = '';
    setInventory(prev => prev.map(p => {
      if (p.id === id) {
        partName = p.name;
        return {
          ...p,
          stock: p.stock + quantityToAdd,
          lastRestocked: today
        };
      }
      return p;
    }));

    triggerPushNotification(
      'Restock Berhasil Disimpan',
      `+${quantityToAdd} unit ditambahkan untuk ${partName}. Stok sekarang dalam kondisi aman.`,
      'system'
    );
  };

  // Employee management
  const switchCurrentEmployee = (employeeId: string) => {
    setCurrentEmployeeId(employeeId);
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      triggerPushNotification(
        `Beralih Profil: ${emp.name}`,
        `Anda sekarang masuk sebagai role ${emp.role} (${emp.specialization}).`,
        'system'
      );
    }
  };

  const updateEmployee = (id: string, updated: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
  };

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const setMeAsSuperAdmin = (customName = 'Nurul Arif', customEmail = 'nurularif629@gmail.com') => {
    setEmployees(prev => {
      const existingIdx = prev.findIndex(e => e.email === customEmail || e.name === customName || e.id === 'emp-01');
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          name: customName,
          email: customEmail,
          role: 'Super Admin',
          status: 'Aktif',
          permissions: {
            canManageInventory: true,
            canManageEmployees: true,
            canManageServices: true,
            canExportReports: true,
            canConfigureRAD: true
          }
        };
        setCurrentEmployeeId(updated[existingIdx].id);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, updated[existingIdx].id);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updated));
        return updated;
      } else {
        const newAdmin: Employee = {
          id: 'emp-01',
          name: customName,
          email: customEmail,
          phone: '0812-8899-0011',
          role: 'Super Admin',
          status: 'Aktif',
          specialization: 'Sistem Manajemen & Kontrol Operasional Bengkel',
          rating: 5.0,
          completedJobs: 450,
          permissions: {
            canManageInventory: true,
            canManageEmployees: true,
            canManageServices: true,
            canExportReports: true,
            canConfigureRAD: true
          }
        };
        setCurrentEmployeeId(newAdmin.id);
        const nextList = [newAdmin, ...prev];
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, newAdmin.id);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(nextList));
        return nextList;
      }
    });

    triggerPushNotification(
      'Hak Akses Super Admin Aktif',
      `Anda sekarang aktif login sebagai ${customName} (${customEmail}) dengan wewenang penuh Super Admin!`,
      'system'
    );
  };

  const login = (email: string, password = ''): { success: boolean; message: string } => {
    const query = email.trim().toLowerCase();
    const found = employees.find(
      e => e.email.toLowerCase() === query || 
           e.name.toLowerCase() === query || 
           e.id.toLowerCase() === query
    );

    if (!found) {
      return { 
        success: false, 
        message: 'Email atau nama akun tidak ditemukan di basis data karyawan bengkel.' 
      };
    }

    if (password && password.trim() !== '') {
      if (found.password && found.password !== password.trim()) {
        return { success: false, message: 'Kata sandi tidak sesuai untuk akun ini.' };
      }
    }

    setCurrentEmployeeId(found.id);
    setIsAuthenticated(true);
    setIsGuestVisitor(false);
    localStorage.setItem('motorad_is_guest', 'false');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, found.id);
    localStorage.setItem(STORAGE_KEYS.AUTH_STATE, 'true');

    // If logging in as admin/management and tour hasn't been completed, set tour trigger flag
    const isUserAdmin = found.role === 'Super Admin' || !!found.permissions?.canManageEmployees;
    if (isUserAdmin) {
      try {
        if (localStorage.getItem('motorad_admin_tour_completed_v1') !== 'true') {
          sessionStorage.setItem('motorad_trigger_admin_tour', 'true');
        }
      } catch {}
    }

    triggerPushNotification(
      'Login Berhasil',
      `Selamat datang, ${found.name}! Anda masuk sebagai ${found.role}.`,
      'system'
    );

    return { success: true, message: `Login berhasil sebagai ${found.name}` };
  };

  const loginAsGuest = () => {
    setIsGuestVisitor(true);
    setIsAuthenticated(true);
    setActiveView('dashboard');
    localStorage.setItem('motorad_is_guest', 'true');
    localStorage.setItem(STORAGE_KEYS.AUTH_STATE, 'true');
    triggerPushNotification(
      'Portal Pengunjung Terbuka',
      'Selamat datang di Pelacakan Servis MotoRAD! Silakan masukkan nomor plat motor Anda untuk melihat status real-time.',
      'system'
    );
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsGuestVisitor(false);
    localStorage.setItem('motorad_is_guest', 'false');
    localStorage.setItem(STORAGE_KEYS.AUTH_STATE, 'false');
    try {
      sessionStorage.removeItem('motorad_trigger_admin_tour');
    } catch {}
    triggerPushNotification(
      'Sesi Berakhir',
      'Anda telah keluar dari sistem manajemen MotoRAD Engine.',
      'system'
    );
  };

  // Analytics helper
  const getMonthlySummary = (_month?: string): MonthlySummary => {
    const completed = services.filter(s => s.status === 'Selesai' || s.status === 'Diambil');
    const serviceLabor = completed.reduce((sum, s) => sum + s.laborCost, 0) + 12500000; // base month buffer
    const partsRev = completed.reduce((sum, s) => {
      return sum + s.partsUsed.reduce((pSum, p) => pSum + (p.price * p.quantity), 0);
    }, 0) + 21450000;

    const partsCostEst = Math.round(partsRev * 0.72);
    const totalRev = serviceLabor + partsRev;
    const grossProfit = totalRev - partsCostEst;

    return {
      monthName: 'September',
      year: 2026,
      totalRevenue: totalRev,
      serviceLaborRevenue: serviceLabor,
      partsRevenue: partsRev,
      partsCost: partsCostEst,
      grossProfit,
      completedServices: completed.length + 84,
      totalCustomers: completed.length + 82,
      averageSatisfaction: 4.88
    };
  };

  const getBayStatus = () => {
    const bays = [1, 2, 3, 4];
    return bays.map(bayNum => {
      const currentOrder = services.find(s => s.bayNumber === bayNum && (s.status === 'Pengerjaan' || s.status === 'Diagnosa' || s.status === 'Antre')) || null;
      return {
        bay: bayNum,
        currentOrder,
        mechanicName: currentOrder?.mechanicName || 'Standby / Kosong',
        isOccupied: !!currentOrder
      };
    });
  };

  const resetToDefaultData = () => {
    setServices(INITIAL_SERVICES);
    setInventory(INITIAL_PARTS);
    setEmployees(INITIAL_EMPLOYEES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentEmployeeId('emp-01');
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    triggerPushNotification('Data Berhasil Direset', 'Semua data bengkel telah dikembalikan ke dataset default demonstrasi RAD.', 'system');
  };

  return (
    <WorkshopContext.Provider value={{
      services,
      addService,
      updateServiceStatus,
      updateServiceChecklist,
      addPartsToService,
      deleteService,

      inventory,
      addInventoryPart,
      updateInventoryPart,
      restockPart,
      lowStockCount,
      criticalParts,

      employees,
      currentEmployee,
      isAuthenticated,
      isAdmin,
      isGuestVisitor,
      login,
      loginAsGuest,
      logout,
      switchCurrentEmployee,
      updateEmployee,
      addEmployee,
      setMeAsSuperAdmin,

      notifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearNotification,
      triggerPushNotification,
      activeBannerNotification,
      dismissBanner,

      getMonthlySummary,
      getBayStatus,
      resetToDefaultData,

      activeView,
      setActiveView,

      themePreference,
      resolvedTheme,
      setThemePreference,
      toggleTheme
    }}>
      {children}
    </WorkshopContext.Provider>
  );
};

export const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  if (!context) {
    throw new Error('useWorkshop must be used within a WorkshopProvider');
  }
  return context;
};
