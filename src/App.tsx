/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { TopNavbar } from './components/TopNavbar';
import { PosDesktopView } from './components/PosDesktopView';
import { PosMobileView } from './components/PosMobileView';
import { KitchenDisplayView } from './components/KitchenDisplayView';
import { TableFloorView } from './components/TableFloorView';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { CheckoutModal } from './components/Modals/CheckoutModal';
import { ReceiptModal } from './components/Modals/ReceiptModal';
import { PosActionModals } from './components/Modals/PosActionModals';

const MainLayout: React.FC = () => {
  const { activeView } = usePOS();
  const [productTab, setProductTab] = useState<'products' | 'barcode' | 'custom'>('products');

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      {/* Top POS Navbar matching photo */}
      <TopNavbar productTab={productTab} setProductTab={setProductTab} />

      {/* Main View Router */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeView === 'pos_desktop' && <PosDesktopView productTab={productTab} />}
        {activeView === 'pos_mobile' && <PosMobileView />}
        {activeView === 'kds' && <KitchenDisplayView />}
        {activeView === 'tables' && <TableFloorView />}
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'inventory' && <InventoryView />}
      </div>

      {/* Interactive Modals */}
      <CheckoutModal />
      <ReceiptModal />
      <PosActionModals />
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}
