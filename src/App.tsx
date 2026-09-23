import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkshopProvider, useWorkshop } from './context/WorkshopContext';
import { TopNav } from './components/TopNav';
import { PushNotificationBanner } from './components/PushNotificationBanner';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { DashboardView } from './components/DashboardView';
import { ServicesView } from './components/ServicesView';
import { InventoryView } from './components/InventoryView';
import { EmployeesView } from './components/EmployeesView';
import { ReportsView } from './components/ReportsView';
import { RadMethodologyView } from './components/RadMethodologyView';
import { CourierTrackerView } from './components/CourierTrackerView';
import { NewServiceModal } from './components/modals/NewServiceModal';
import { NewPartModal } from './components/modals/NewPartModal';
import { RestockModal } from './components/modals/RestockModal';
import { ServiceDetailModal } from './components/modals/ServiceDetailModal';
import { EmployeeModal } from './components/modals/EmployeeModal';
import { AdminProfileModal } from './components/modals/AdminProfileModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { ServiceOrder, InventoryPart, Employee } from './types';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Boxes, 
  Users, 
  FileSpreadsheet, 
  Cpu,
  Navigation
} from 'lucide-react';

// Smooth Page Transition Animation Variants (Fade & Subtle Vertical Slide)
const viewTransitionVariants = {
  initial: {
    opacity: 0,
    y: 12,
    filter: 'blur(3px)'
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.26,
      ease: [0.16, 1, 0.3, 1] as const
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(3px)',
    transition: {
      duration: 0.16,
      ease: [0.4, 0, 1, 1] as const
    }
  }
};

const MainAppContent: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    lowStockCount,
    isAuthenticated,
    isAdmin 
  } = useWorkshop();

  // Modals state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  const [isNewPartOpen, setIsNewPartOpen] = useState(false);
  const [partToRestock, setPartToRestock] = useState<InventoryPart | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceOrder | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isAdminProfileOpen, setIsAdminProfileOpen] = useState(false);

  // If user is not authenticated, show the login portal
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleOpenEmployeeModal = (emp?: Employee) => {
    setEmployeeToEdit(emp || null);
    setIsEmployeeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-blue-50/40 dark:from-[#080d1a] dark:via-[#0c1427] dark:to-[#09101f] text-slate-800 dark:text-slate-100 flex flex-col selection:bg-sky-500/20 selection:text-sky-800 dark:selection:text-sky-200 transition-colors duration-200">
      
      {/* Top Bar following 3-Zone Contract (Bright Glassmorphism) */}
      <TopNav 
        onOpenNotifications={() => setIsNotificationOpen(true)} 
        onOpenAdminProfile={() => setIsAdminProfileOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
        
        {/* Real-time Push Notification Floating Banner */}
        <PushNotificationBanner />

        {/* View Switcher with Framer Motion Animated Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            variants={viewTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {activeView === 'dashboard' && (
              <DashboardView
                onOpenNewService={() => setIsNewServiceOpen(true)}
                onSelectService={(service) => setSelectedService(service)}
              />
            )}

            {activeView === 'services' && (
              <ServicesView
                onOpenNewService={() => setIsNewServiceOpen(true)}
                onSelectService={(service) => setSelectedService(service)}
              />
            )}

            {activeView === 'inventory' && (
              <InventoryView
                onOpenNewPart={() => setIsNewPartOpen(true)}
                onOpenRestock={(part) => setPartToRestock(part)}
              />
            )}

            {activeView === 'employees' && (
              <EmployeesView
                onOpenEmployeeModal={handleOpenEmployeeModal}
                onOpenAdminProfile={() => setIsAdminProfileOpen(true)}
              />
            )}

            {activeView === 'reports' && (
              <ReportsView />
            )}

            {activeView === 'couriers' && (
              <CourierTrackerView />
            )}

            {activeView === 'rad' && (
              <RadMethodologyView />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Sticky Bottom Nav Bar (Thumb Friendly - Bright Glassmorphism) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-sky-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around lg:hidden shadow-lg no-print">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl text-[10px] transition-all ${
            activeView === 'dashboard' ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {activeView === 'dashboard' && (
            <motion.div
              layoutId="mobileActiveTab"
              className="absolute inset-0 bg-sky-50 dark:bg-sky-950/60 rounded-xl -z-10 border border-sky-200 dark:border-sky-800"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
          <LayoutDashboard className="h-4 w-4 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveView('services')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl text-[10px] transition-all ${
            activeView === 'services' ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {activeView === 'services' && (
            <motion.div
              layoutId="mobileActiveTab"
              className="absolute inset-0 bg-sky-50 dark:bg-sky-950/60 rounded-xl -z-10 border border-sky-200 dark:border-sky-800"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
          <CalendarClock className="h-4 w-4 mb-0.5" />
          <span>Servis</span>
        </button>

        <button
          onClick={() => setActiveView('couriers')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl text-[10px] transition-all ${
            activeView === 'couriers' ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {activeView === 'couriers' && (
            <motion.div
              layoutId="mobileActiveTab"
              className="absolute inset-0 bg-sky-50 dark:bg-sky-950/60 rounded-xl -z-10 border border-sky-200 dark:border-sky-800"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
          <Navigation className="h-4 w-4 mb-0.5" />
          <span>Kurir</span>
        </button>

        <button
          onClick={() => setActiveView('inventory')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl text-[10px] transition-all ${
            activeView === 'inventory' ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {activeView === 'inventory' && (
            <motion.div
              layoutId="mobileActiveTab"
              className="absolute inset-0 bg-sky-50 dark:bg-sky-950/60 rounded-xl -z-10 border border-sky-200 dark:border-sky-800"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
          <Boxes className="h-4 w-4 mb-0.5" />
          <span>Gudang</span>
          {lowStockCount > 0 && (
            <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveView('employees')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl text-[10px] transition-all ${
            activeView === 'employees' ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {activeView === 'employees' && (
            <motion.div
              layoutId="mobileActiveTab"
              className="absolute inset-0 bg-sky-50 dark:bg-sky-950/60 rounded-xl -z-10 border border-sky-200 dark:border-sky-800"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
          <Users className="h-4 w-4 mb-0.5" />
          <span>Karyawan</span>
          {!isAdmin && (
            <span className="absolute top-0.5 right-1 flex items-center justify-center h-3 w-3 rounded-full bg-amber-100 dark:bg-amber-950 text-[8px] font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              🔒
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('reports')}
          className={`relative flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] transition-all ${
            activeView === 'reports' ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {activeView === 'reports' && (
            <motion.div
              layoutId="mobileActiveTab"
              className="absolute inset-0 bg-sky-50 dark:bg-sky-950/60 rounded-xl -z-10 border border-sky-200 dark:border-sky-800"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
          <FileSpreadsheet className="h-4 w-4 mb-0.5" />
          <span>Laporan</span>
        </button>

        <button
          onClick={() => setActiveView('rad')}
          className={`relative flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] transition-all ${
            activeView === 'rad' ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {activeView === 'rad' && (
            <motion.div
              layoutId="mobileActiveTab"
              className="absolute inset-0 bg-sky-50 dark:bg-sky-950/60 rounded-xl -z-10 border border-sky-200 dark:border-sky-800"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
            />
          )}
          <Cpu className="h-4 w-4 mb-0.5" />
          <span>RAD</span>
        </button>
      </nav>

      {/* Global Modals */}
      <NotificationCenterModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      <NewServiceModal
        isOpen={isNewServiceOpen}
        onClose={() => setIsNewServiceOpen(false)}
      />

      <NewPartModal
        isOpen={isNewPartOpen}
        onClose={() => setIsNewPartOpen(false)}
      />

      <RestockModal
        part={partToRestock}
        onClose={() => setPartToRestock(null)}
      />

      <ServiceDetailModal
        order={selectedService}
        onClose={() => setSelectedService(null)}
      />

      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        employeeToEdit={employeeToEdit}
        onClose={() => setIsEmployeeModalOpen(false)}
      />

      <AdminProfileModal
        isOpen={isAdminProfileOpen}
        onClose={() => setIsAdminProfileOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <WorkshopProvider>
      <MainAppContent />
    </WorkshopProvider>
  );
}
