import React from 'react';
import { useWorkshop } from '../context/WorkshopContext';
import { ServiceOrder } from '../types';
import { VisitorPortal } from './portals/VisitorPortal';
import { MechanicPortal } from './portals/MechanicPortal';
import { CashierPortal } from './portals/CashierPortal';
import { SuperAdminDashboard } from './portals/SuperAdminDashboard';

interface DashboardViewProps {
  onOpenNewService?: () => void;
  onSelectService?: (service: ServiceOrder) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onOpenNewService, 
  onSelectService 
}) => {
  const { isGuestVisitor, currentEmployee } = useWorkshop();

  // 1. ROLE: PENGUNJUNG / PELANGGAN BENGKEL (Visitor Portal)
  if (isGuestVisitor) {
    return <VisitorPortal onSelectService={onSelectService} />;
  }

  // 2. ROLE: MEKANIK SENIOR & MEKANIK LAPANGAN (Mechanic Pit Console)
  if (currentEmployee.role === 'Mekanik Senior' || currentEmployee.role === 'Mekanik Lapangan') {
    return <MechanicPortal onSelectService={onSelectService} />;
  }

  // 3. ROLE: KASIR & FRONT DESK (Cashier & Front Desk Desk)
  if (currentEmployee.role === 'Kasir & Front Desk') {
    return (
      <CashierPortal 
        onOpenNewService={onOpenNewService} 
        onSelectService={onSelectService} 
      />
    );
  }

  // 4. ROLE: SUPER ADMIN & KEPALA BENGKEL (Executive Command Center)
  return (
    <SuperAdminDashboard 
      onOpenNewService={onOpenNewService} 
      onSelectService={onSelectService} 
    />
  );
};
