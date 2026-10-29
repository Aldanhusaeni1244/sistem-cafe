import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatNumber, formatRupiah, formatDateTime } from '../../utils/format';
import { STAFF_LIST, CUSTOMER_LIST } from '../../data/mockData';
import {
  X,
  Percent,
  Truck,
  MessageSquare,
  User,
  Users,
  Layers,
  UtensilsCrossed,
  Check,
  Search,
  RotateCcw,
} from 'lucide-react';
import { Order } from '../../types/pos';

export const PosActionModals: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    discountPercent,
    discountNominal,
    setDiscount,
    deliveryCost,
    setDeliveryCost,
    orderNotes,
    setOrderNotes,
    activeStaff,
    setActiveStaff,
    selectedCustomer,
    setSelectedCustomer,
    selectedTable,
    selectTable,
    tables,
    orders,
    loadOrderToCart,
    setLastCompletedOrder,
  } = usePOS();

  // Local state for discount
  const [localPercent, setLocalPercent] = useState<number>(discountPercent);
  const [localNominal, setLocalNominal] = useState<number>(discountNominal);

  // Local state for delivery
  const [localDelivery, setLocalDelivery] = useState<number>(deliveryCost);

  // Local state for notes
  const [localNotes, setLocalNotes] = useState<string>(orderNotes);

  // Search orders
  const [orderSearch, setOrderSearch] = useState('');

  if (activeModal === 'none' || activeModal === 'checkout' || activeModal === 'receipt') {
    return null;
  }

  // ================= 1. DISCOUNT MODAL =================
  if (activeModal === 'discount') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Diskon Pesanan</h3>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Quick Percentage Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Persentase Diskon (%)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      setLocalPercent(pct);
                      setLocalNominal(0);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      localPercent === pct
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Nominal Discount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Atau Potongan Nominal Tetap (Rp)
              </label>
              <input
                type="number"
                step="1000"
                value={localNominal || ''}
                onChange={(e) => {
                  setLocalNominal(Number(e.target.value));
                  setLocalPercent(0);
                }}
                placeholder="Contoh: 10000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDiscount(0, 0);
                  setActiveModal('none');
                }}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Hapus Diskon
              </button>
              <button
                type="button"
                onClick={() => {
                  setDiscount(localPercent, localNominal);
                  setActiveModal('none');
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
              >
                Terapkan Diskon
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. DELIVERY MODAL =================
  if (activeModal === 'delivery') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Biaya Pengiriman (Delivery)</h3>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ongkos Kirim (Rp)
              </label>
              <input
                type="number"
                step="1000"
                value={localDelivery || ''}
                onChange={(e) => setLocalDelivery(Number(e.target.value))}
                placeholder="Contoh: 15000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[10000, 15000, 20000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setLocalDelivery(amt)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border ${
                    localDelivery === amt
                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {formatNumber(amt)}
                </button>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeliveryCost(0);
                  setActiveModal('none');
                }}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Reset (0)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeliveryCost(localDelivery);
                  setActiveModal('none');
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= 3. NOTES MODAL =================
  if (activeModal === 'notes') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Catatan Pesanan Dapur</h3>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instruksi Khusus untuk Dapur / Barista
              </label>
              <textarea
                rows={3}
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                placeholder="Contoh: Sambal dipisah, kopi jangan terlalu manis, sajikan minuman lebih dulu..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOrderNotes('');
                  setActiveModal('none');
                }}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Hapus Catatan
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderNotes(localNotes);
                  setActiveModal('none');
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= 4. STAFF MODAL =================
  if (activeModal === 'staff') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Pilih Kasir / Pelayan</h3>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {STAFF_LIST.map((staff) => {
              const isSelected = activeStaff.id === staff.id;
              return (
                <button
                  key={staff.id}
                  onClick={() => {
                    setActiveStaff(staff);
                    setActiveModal('none');
                  }}
                  className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-sky-50 border border-sky-300 ring-1 ring-sky-300'
                      : 'hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{staff.name}</p>
                      <p className="text-[11px] text-slate-400">{staff.role}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-600" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ================= 5. CUSTOMER MODAL =================
  if (activeModal === 'customer') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Member & Pelanggan</h3>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {CUSTOMER_LIST.map((cust) => {
              const isSelected = selectedCustomer.id === cust.id;
              return (
                <button
                  key={cust.id}
                  onClick={() => {
                    setSelectedCustomer(cust);
                    setActiveModal('none');
                  }}
                  className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-amber-50 border border-amber-300 ring-1 ring-amber-300'
                      : 'hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{cust.name}</span>
                        {cust.tier !== 'Regular' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                            {cust.tier}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {cust.phone || 'Non-member'} · {cust.loyaltyPoints} Poin
                      </p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ================= 6. ORDERS DRAWER / MODAL =================
  if (activeModal === 'orders') {
    const filteredOrders = orders.filter((o) =>
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(orderSearch.toLowerCase())
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Daftar Transaksi Kasir</h3>
                <p className="text-xs text-slate-400">Semua pesanan hari ini ({orders.length} nota)</p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Cari no. nota atau nama pelanggan..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12">Tidak ada pesanan.</p>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {order.diningType === 'dine_in' ? `Meja ${order.tableNumber}` : 'Bungkus'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {order.customer.name} · Kasir: {order.servedBy.name} ·{' '}
                      {formatDateTime(order.createdAt)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {order.items.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm font-mono text-slate-900 tabular-nums">
                      {formatRupiah(order.total)}
                    </span>
                    <button
                      onClick={() => {
                        setLastCompletedOrder(order);
                        setActiveModal('receipt');
                      }}
                      className="px-2.5 py-1.5 border border-slate-200 hover:bg-sky-50 hover:text-sky-600 rounded-lg text-xs font-semibold"
                    >
                      Struk
                    </button>
                    {order.status !== 'paid' && (
                      <button
                        onClick={() => {
                          loadOrderToCart(order);
                          setActiveModal('none');
                        }}
                        className="px-2.5 py-1.5 bg-sky-600 text-white hover:bg-sky-700 rounded-lg text-xs font-semibold"
                      >
                        Buka
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================= 7. TABLES MODAL =================
  if (activeModal === 'tables') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Pilih Meja untuk Pesanan</h3>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
            {tables.map((t) => {
              const isSelected = selectedTable?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    selectTable(t);
                    setActiveModal('none');
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-300'
                      : t.status === 'occupied'
                      ? 'border-amber-200 bg-amber-50/50 text-amber-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <p className="font-extrabold text-base">{t.number}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{t.name}</p>
                  <span
                    className={`inline-block mt-1 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                      t.status === 'occupied'
                        ? 'bg-amber-100 text-amber-800'
                        : t.status === 'reserved'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {t.status === 'occupied' ? 'Terisi' : t.status === 'reserved' ? 'Booking' : 'Kosong'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
