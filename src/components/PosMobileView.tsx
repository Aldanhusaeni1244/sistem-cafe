import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { formatNumber, formatRupiah } from '../utils/format';
import {
  X,
  MapPin,
  Search,
  User,
  Plus,
  Minus,
  Trash2,
  Tag,
  CreditCard,
  Banknote,
  Ticket,
  MoreHorizontal,
  ChevronDown,
  ShoppingBag,
  ArrowLeft,
  Smartphone,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PosMobileView: React.FC = () => {
  const {
    cart,
    addToCart,
    updateCartQty,
    removeCartItem,
    clearCart,
    subtotal,
    discountPercent,
    discountNominal,
    grandTotal,
    products,
    selectedCustomer,
    activeStaff,
    setActiveStaff,
    completeSale,
    setActiveView,
    setActiveModal,
  } = usePOS();

  const [mobileSearch, setMobileSearch] = useState('');
  const [showCatalog, setShowCatalog] = useState(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState<'cash' | 'voucher' | 'card' | 'other'>('cash');

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(mobileSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(mobileSearch.toLowerCase())
  );

  const handleMobileCompleteSale = () => {
    if (cart.length === 0) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    completeSale(selectedPayMethod, grandTotal);
  };

  return (
    <div className="flex-1 bg-slate-900 py-4 sm:py-8 px-2 flex items-center justify-center min-h-[calc(100vh-3.5rem)] overflow-y-auto">
      {/* Smartphone Device Mockup Frame */}
      <div className="w-full max-w-[380px] bg-white rounded-[40px] shadow-2xl border-8 border-slate-800 flex flex-col h-[740px] max-h-[92vh] overflow-hidden relative">
        {/* Notch / Speaker Bar */}
        <div className="w-full bg-white pt-2 pb-1 flex justify-center items-center z-10 shrink-0">
          <div className="w-20 h-4 bg-slate-800 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full mr-2"></div>
            <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
          </div>
        </div>

        {/* Mobile Header: "New Sale", Branch "Batam", Close */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-slate-900 text-base leading-tight">New Sale</h2>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>Batam Branch</span>
            </div>
          </div>
          <button
            onClick={() => setActiveView('pos_desktop')}
            title="Kembali ke Layar POS Desktop"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar / Add Items trigger */}
        <div className="px-4 py-2 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={mobileSearch}
              onFocus={() => setShowCatalog(true)}
              onChange={(e) => {
                setMobileSearch(e.target.value);
                setShowCatalog(true);
              }}
              placeholder="Add items to sale..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-xs"
            />
            {showCatalog && (
              <button
                onClick={() => {
                  setShowCatalog(false);
                  setMobileSearch('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Tutup
              </button>
            )}
          </div>
        </div>

        {/* Content Body: Catalog Dropdown or Cart List */}
        {showCatalog ? (
          <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 bg-white">
            <div className="pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pilih Menu Cepat ({filtered.length} menu)
            </div>
            {filtered.map((prod) => (
              <button
                key={prod.id}
                onClick={() => {
                  addToCart(prod);
                  setShowCatalog(false);
                  setMobileSearch('');
                }}
                className="w-full py-2.5 flex items-center justify-between text-left hover:bg-slate-50 rounded-lg px-2"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                  />
                  <div>
                    <p className="font-semibold text-slate-900 text-xs">{prod.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {formatRupiah(prod.price)}
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center text-xs font-bold">
                  +
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                <ShoppingBag className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">Keranjang Kosong</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Ketik nama menu di atas untuk menambah pesanan pelanggan.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-9 h-9 rounded-md object-cover bg-slate-100"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-xs leading-tight">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.qty} x {formatNumber(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-xs tabular-nums">
                        Rp {formatNumber(item.price * item.qty)}
                      </p>
                      <button
                        onClick={() => removeCartItem(item.id)}
                        className="text-rose-400 hover:text-rose-600 text-[10px] mt-0.5"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  {/* Qty & Price Row as shown in mobile mock in photo */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Qty:</span>
                      <div className="flex items-center border border-slate-200 rounded">
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold tabular-nums">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Staff:</span>
                      <span className="font-medium text-slate-700">{activeStaff.name.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Customer Loyalty Banner (Exact as Emilia Clarke card in photo!) */}
        <div className="px-4 py-2 bg-amber-50/70 border-t border-amber-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs border border-amber-300">
              EC
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs leading-tight">
                {selectedCustomer.name}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-700 font-medium">
                <span>💳 123456789012</span>
                <span>·</span>
                <span className="text-amber-800 font-bold">1000 pts</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('customer')}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Payment Section (Pay + Big Amount) */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <div className="text-center mb-3">
            <span className="text-xs text-slate-400 font-medium">Pay</span>
            <div className="font-extrabold text-2xl text-slate-900 tracking-tight mt-0.5 tabular-nums">
              {formatRupiah(grandTotal)}
            </div>
          </div>

          {/* 4 Quick Pay Buttons (Teal/Emerald Buttons from photo!) */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { id: 'cash', label: 'Cash' },
              { id: 'voucher', label: 'Voucher' },
              { id: 'card', label: 'Card' },
              { id: 'other', label: 'Other' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setSelectedPayMethod(btn.id as any)}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                  selectedPayMethod === btn.id
                    ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-300'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Bottom Actions: More & Complete Sale */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal('discount')}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
            >
              <span>More</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            <button
              onClick={handleMobileCompleteSale}
              disabled={cart.length === 0}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                cart.length > 0
                  ? 'bg-sky-600 hover:bg-sky-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Complete Sale
            </button>
          </div>
        </div>

        {/* Bottom Home Indicator bar */}
        <div className="w-full bg-white pb-2 pt-1 flex justify-center items-center shrink-0">
          <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
