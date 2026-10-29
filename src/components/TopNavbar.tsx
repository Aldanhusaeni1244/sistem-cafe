import React, { useState } from 'react';
import { usePOS, ActiveView } from '../context/POSContext';
import {
  Menu,
  Grid,
  Barcode,
  PlusCircle,
  UtensilsCrossed,
  LayoutDashboard,
  Smartphone,
  Monitor,
  ChefHat,
  Package,
  Layers,
  Clock,
  Wifi,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

interface TopNavbarProps {
  productTab: 'products' | 'barcode' | 'custom';
  setProductTab: (tab: 'products' | 'barcode' | 'custom') => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ productTab, setProductTab }) => {
  const {
    activeView,
    setActiveView,
    selectedTable,
    diningType,
    setDiningType,
    orders,
    kitchenTickets,
    setActiveModal,
    resetAllData,
  } = usePOS();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeOrdersCount = orders.filter((o) => o.status !== 'cancelled').length;
  const pendingKitchenCount = kitchenTickets.filter((k) => k.status === 'pending' || k.status === 'cooking').length;

  return (
    <>
      <header className="h-14 bg-sky-600 text-white flex items-center justify-between px-3 md:px-5 select-none shadow-md border-b border-sky-700 shrink-0 z-30">
        {/* Left Side: Hamburger, Table, Dining Mode, Orders, Sync */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Hamburger Menu Drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka Menu Navigasi"
            className="w-10 h-10 rounded-lg hover:bg-sky-500/80 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          {/* Table Selector */}
          <button
            onClick={() => setActiveModal('tables')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm ${
              selectedTable
                ? 'bg-white text-sky-700 hover:bg-sky-50'
                : 'bg-sky-500/60 text-sky-100 hover:bg-sky-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="whitespace-nowrap">
              {selectedTable ? `Table ${selectedTable.number}` : 'Pilih Meja'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* In / Away Toggle */}
          <button
            onClick={() => setDiningType(diningType === 'dine_in' ? 'take_away' : 'dine_in')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-500/60 hover:bg-sky-500 text-white transition-colors"
            title="Klik untuk ganti Dine-in / Take Away"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">
              {diningType === 'dine_in' ? 'In / Dine-In' : 'Away / Bungkus'}
            </span>
          </button>

          {/* Orders Counter */}
          <button
            onClick={() => setActiveModal('orders')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-700/80 hover:bg-sky-700 text-white transition-colors relative"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Orders</span>
            {activeOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 font-bold rounded-full text-[10px] tabular-nums">
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* Real-time Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-sky-100 pl-1 border-l border-sky-500/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[11px] font-medium text-sky-100">Live Sync</span>
          </div>
        </div>

        {/* Center: Tabs for Products, Barcode, Custom (when in POS view) */}
        {activeView === 'pos_desktop' && (
          <div className="hidden md:flex items-center gap-1 bg-sky-700/60 p-1 rounded-lg">
            <button
              onClick={() => setProductTab('products')}
              className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-medium rounded-md transition-all ${
                productTab === 'products'
                  ? 'bg-white text-sky-800 shadow-sm font-semibold'
                  : 'text-sky-100 hover:text-white hover:bg-sky-600/50'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Products</span>
            </button>
            <button
              onClick={() => setProductTab('barcode')}
              className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-medium rounded-md transition-all ${
                productTab === 'barcode'
                  ? 'bg-white text-sky-800 shadow-sm font-semibold'
                  : 'text-sky-100 hover:text-white hover:bg-sky-600/50'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Barcode</span>
            </button>
            <button
              onClick={() => setProductTab('custom')}
              className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-medium rounded-md transition-all ${
                productTab === 'custom'
                  ? 'bg-white text-sky-800 shadow-sm font-semibold'
                  : 'text-sky-100 hover:text-white hover:bg-sky-600/50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Custom</span>
            </button>
          </div>
        )}

        {/* Right Side: Quick Switchers & Time */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick View Switches */}
          <div className="flex items-center bg-sky-700/80 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveView('pos_desktop')}
              title="Tampilan POS Kasir Laptop"
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 transition-all ${
                activeView === 'pos_desktop'
                  ? 'bg-white text-sky-800 font-semibold shadow-xs'
                  : 'text-sky-100 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">POS Kasir</span>
            </button>
            <button
              onClick={() => setActiveView('pos_mobile')}
              title="Tampilan POS Waiter / HP"
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 transition-all ${
                activeView === 'pos_mobile'
                  ? 'bg-white text-sky-800 font-semibold shadow-xs'
                  : 'text-sky-100 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Mobile</span>
            </button>
            <button
              onClick={() => setActiveView('kds')}
              title="Kitchen Display System"
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 transition-all relative ${
                activeView === 'kds'
                  ? 'bg-white text-sky-800 font-semibold shadow-xs'
                  : 'text-sky-100 hover:text-white'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Dapur (KDS)</span>
              {pendingKitchenCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1"></span>
              )}
            </button>
            <button
              onClick={() => setActiveView('dashboard')}
              title="Dashboard Omset & Laporan"
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 transition-all ${
                activeView === 'dashboard'
                  ? 'bg-white text-sky-800 font-semibold shadow-xs'
                  : 'text-sky-100 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Sidebar Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white text-slate-900 h-full shadow-2xl flex flex-col z-10">
            {/* Header */}
            <div className="p-4 bg-sky-600 text-white flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base tracking-tight">KedaiPOS Cafe</h2>
                <p className="text-xs text-sky-100">Batam Branch · Real-time Online</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-sky-500 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
              {[
                { id: 'pos_desktop', label: 'POS Kasir Desktop', icon: Monitor },
                { id: 'pos_mobile', label: 'POS Waiter Mobile (HP)', icon: Smartphone },
                { id: 'kds', label: 'Kitchen Display (KDS)', icon: ChefHat, badge: pendingKitchenCount },
                { id: 'tables', label: 'Denah & Manajemen Meja', icon: UtensilsCrossed },
                { id: 'dashboard', label: 'Dashboard & Laporan', icon: LayoutDashboard },
                { id: 'inventory', label: 'Manajemen Menu & Stok', icon: Package },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as ActiveView);
                      setDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-bold">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              <div className="pt-4 border-t border-slate-200 mt-4 px-2 space-y-2">
                <button
                  onClick={() => {
                    setActiveModal('orders');
                    setDrawerOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>Daftar Transaksi Hari Ini</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Reset ulang data demo ke pengaturan awal foto?')) {
                      resetAllData();
                      setDrawerOpen(false);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 text-xs text-slate-500 bg-slate-50">
              <div className="flex items-center justify-between">
                <span>Versi 2.4.0</span>
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <Wifi className="w-3 h-3" /> Terhubung
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
