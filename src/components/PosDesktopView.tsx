import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { Product } from '../types/pos';
import { formatNumber, formatRupiah } from '../utils/format';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Percent,
  Truck,
  MessageSquare,
  User,
  Utensils,
  X,
  UserCircle,
  Barcode as BarcodeIcon,
  Check,
  Tag,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface PosDesktopViewProps {
  productTab: 'products' | 'barcode' | 'custom';
}

export const PosDesktopView: React.FC<PosDesktopViewProps> = ({ productTab }) => {
  const {
    cart,
    addToCart,
    updateCartQty,
    removeCartItem,
    diningType,
    pax,
    setPax,
    selectedTable,
    selectedCustomer,
    activeStaff,
    subtotal,
    discountPercent,
    discountNominal,
    deliveryCost,
    taxAmount,
    serviceCharge,
    grandTotal,
    products,
    sendToKitchen,
    cancelActiveOrder,
    setActiveModal,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeError, setBarcodeError] = useState('');

  // Custom Item inputs
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery));
      const matchCategory =
        selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Handle barcode search
  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.sku === barcodeInput.trim()
    );
    if (matched) {
      addToCart(matched);
      setBarcodeInput('');
      setBarcodeError('');
    } else {
      setBarcodeError(`Item dengan barcode "${barcodeInput}" tidak ditemukan`);
      setTimeout(() => setBarcodeError(''), 3000);
    }
  };

  // Add custom item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(customPrice.replace(/[^0-9]/g, ''), 10);
    if (!customName.trim() || isNaN(priceNum) || priceNum <= 0) return;

    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      sku: 'CUSTOM',
      name: customName.trim(),
      category: 'meals',
      price: priceNum,
      image: '/src/assets/images/cafe_chicken_snacks_1792029235174.jpg',
      stock: 999,
      isAvailable: true,
      description: customNotes,
    };

    addToCart(customProduct, customNotes || undefined);
    setCustomName('');
    setCustomPrice('');
    setCustomNotes('');
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-100">
      {/* ================= LEFT COLUMN: ORDER TICKET / SLIP ================= */}
      <section
        aria-label="Tiket Pesanan Kasir"
        className="w-full lg:w-[420px] xl:w-[460px] bg-white flex flex-col border-r border-slate-200 shadow-sm shrink-0 h-full"
      >
        {/* Customer & Dine-In Status Bar (Matching photo header) */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveModal('customer')}
              title="Ganti Customer / Member"
              className="w-9 h-9 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-100 transition-colors border border-sky-200"
            >
              <UserCircle className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sky-600 text-sm tracking-wide">
                  {diningType === 'dine_in' ? 'DINE-IN' : 'TAKE-AWAY'}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  ({pax} Pax)
                </span>
                {selectedTable && diningType === 'dine_in' && (
                  <span className="text-xs text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded font-medium">
                    Meja {selectedTable.number}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                {selectedCustomer.name}{' '}
                {selectedCustomer.loyaltyPoints > 0 &&
                  `· ${selectedCustomer.loyaltyPoints} Pts`}
              </p>
            </div>
          </div>

          {/* Quick Pax Increment Button */}
          <div className="flex items-center gap-1">
            {pax > 1 && (
              <button
                onClick={() => setPax(Math.max(1, pax - 1))}
                aria-label="Kurangi Pax"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setPax(pax + 1)}
              aria-label="Tambah Pax"
              className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Column Header: Item, Qty, Total (Matching Photo slate bar) */}
        <div className="grid grid-cols-12 px-4 py-2 bg-slate-500 text-white text-xs font-semibold uppercase tracking-wider shrink-0">
          <div className="col-span-6">Item</div>
          <div className="col-span-3 text-center">Qty</div>
          <div className="col-span-3 text-right">Total</div>
        </div>

        {/* Order Item Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 px-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Utensils className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600 text-sm">Pesanan Kosong</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                Pilih menu dari panel kanan atau scan barcode untuk menambahkan item.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="group py-3 px-2 hover:bg-sky-50/50 rounded-lg transition-colors"
              >
                <div className="grid grid-cols-12 items-start gap-1">
                  {/* Item Details */}
                  <div className="col-span-6 pr-1">
                    <p className="font-semibold text-slate-900 text-sm leading-tight">
                      {item.name}
                    </p>
                    {item.notes ? (
                      <p className="text-[11px] text-slate-500 mt-0.5 italic">
                        {item.notes}
                      </p>
                    ) : null}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.qty}x {formatNumber(item.price)}
                      </span>
                      {item.sku && (
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1 rounded">
                          #{item.sku}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="col-span-3 flex items-center justify-center gap-1.5 pt-1">
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      aria-label="Kurangi 1"
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-slate-800 text-sm tabular-nums w-5 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      aria-label="Tambah 1"
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-600 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Total & Delete Button */}
                  <div className="col-span-3 text-right pt-1">
                    <p className="font-bold text-slate-900 text-sm tabular-nums">
                      {formatNumber(item.price * item.qty)}
                    </p>
                    <button
                      onClick={() => removeCartItem(item.id)}
                      title="Hapus Item"
                      className="text-slate-300 hover:text-rose-500 transition-colors mt-1 p-0.5 inline-flex"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Price Breakdown Preview (Compact) */}
        {cart.length > 0 && (
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 space-y-1 shrink-0">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="tabular-nums font-medium">{formatRupiah(subtotal)}</span>
            </div>
            {discountPercent > 0 || discountNominal > 0 ? (
              <div className="flex justify-between text-emerald-600">
                <span>Diskon {discountPercent > 0 ? `(${discountPercent}%)` : ''}:</span>
                <span className="tabular-nums font-medium">
                  -
                  {formatRupiah(
                    discountPercent > 0
                      ? (subtotal * discountPercent) / 100
                      : discountNominal
                  )}
                </span>
              </div>
            ) : null}
            {taxAmount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>PPN (10%):</span>
                <span className="tabular-nums">{formatRupiah(taxAmount)}</span>
              </div>
            )}
            {serviceCharge > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Biaya Layanan:</span>
                <span className="tabular-nums">{formatRupiah(serviceCharge)}</span>
              </div>
            )}
            {deliveryCost > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Ongkos Kirim:</span>
                <span className="tabular-nums">{formatRupiah(deliveryCost)}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons Row (Exact round icon buttons as in photo!) */}
        <div className="px-3 py-2.5 bg-white border-t border-slate-200 grid grid-cols-7 gap-1 text-center shrink-0">
          {/* 1. Print Check */}
          <button
            onClick={() => setActiveModal('receipt')}
            className="flex flex-col items-center group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full border-2 border-sky-500 text-sky-600 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all shadow-xs">
              <Printer className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-600 font-medium mt-1 leading-tight">
              Print Check
            </span>
          </button>

          {/* 2. Disc. Order */}
          <button
            onClick={() => setActiveModal('discount')}
            className="flex flex-col items-center group focus:outline-none"
          >
            <div
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all shadow-xs ${
                discountPercent > 0 || discountNominal > 0
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-600 font-bold'
                  : 'border-sky-500 text-sky-600 group-hover:bg-sky-500 group-hover:text-white'
              }`}
            >
              <Percent className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-600 font-medium mt-1 leading-tight">
              Disc. Order
            </span>
          </button>

          {/* 3. Delivery Cost */}
          <button
            onClick={() => setActiveModal('delivery')}
            className="flex flex-col items-center group focus:outline-none"
          >
            <div
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all shadow-xs ${
                deliveryCost > 0
                  ? 'border-amber-500 bg-amber-50 text-amber-600'
                  : 'border-sky-500 text-sky-600 group-hover:bg-sky-500 group-hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-600 font-medium mt-1 leading-tight">
              Delivery Cost
            </span>
          </button>

          {/* 4. Order Notes */}
          <button
            onClick={() => setActiveModal('notes')}
            className="flex flex-col items-center group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full border-2 border-sky-500 text-sky-600 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-600 font-medium mt-1 leading-tight">
              Order Notes
            </span>
          </button>

          {/* 5. Served By */}
          <button
            onClick={() => setActiveModal('staff')}
            className="flex flex-col items-center group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full border-2 border-sky-500 text-sky-600 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-600 font-medium mt-1 leading-tight">
              Served By
            </span>
          </button>

          {/* 6. Send to Kitchen */}
          <button
            onClick={sendToKitchen}
            disabled={cart.length === 0}
            className={`flex flex-col items-center group focus:outline-none ${
              cart.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-full border-2 border-sky-500 text-sky-600 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all shadow-xs">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-600 font-medium mt-1 leading-tight">
              Send to Kitchen
            </span>
          </button>

          {/* 7. Cancel Order (Red Circle) */}
          <button
            onClick={() => {
              if (cart.length > 0 && confirm('Batalkan seluruh pesanan yang sedang aktif?')) {
                cancelActiveOrder();
              }
            }}
            disabled={cart.length === 0}
            className={`flex flex-col items-center group focus:outline-none ${
              cart.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center group-hover:bg-rose-600 transition-all shadow-xs">
              <X className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[10px] text-rose-600 font-semibold mt-1 leading-tight">
              Cancel Order
            </span>
          </button>
        </div>

        {/* Big Bottom Green Total Bar (Matching exact photo!) */}
        <button
          onClick={() => {
            if (cart.length > 0) setActiveModal('checkout');
          }}
          disabled={cart.length === 0}
          className={`w-full py-4 px-6 text-white text-center font-bold text-xl md:text-2xl transition-all flex items-center justify-center gap-2 select-none shadow-inner shrink-0 ${
            cart.length > 0
              ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 cursor-pointer'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span className="tabular-nums tracking-wide">{formatRupiah(grandTotal)}</span>
        </button>
      </section>

      {/* ================= RIGHT COLUMN: PRODUCTS & CATALOG ================= */}
      <main className="flex-1 flex flex-col bg-slate-100 overflow-hidden min-w-0">
        {/* Top Control Bar: Search & Categories */}
        <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu, SKU atau scan barcode..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'drinks', label: 'Drinks' },
              { id: 'coffee', label: 'Coffee' },
              { id: 'chicken_snacks', label: 'Snacks & Chicken' },
              { id: 'cake_dessert', label: 'Cakes & Dessert' },
              { id: 'meals', label: 'Meals' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Product Grid View */}
        {productTab === 'products' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-sky-400 shadow-xs hover:shadow-md transition-all text-left flex flex-col overflow-hidden relative active:scale-[0.98]"
                >
                  {/* Image container */}
                  <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.stock <= 10 && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                        Sisa {product.stock}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
                        {product.name}
                      </p>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between pt-1 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {product.sku ? product.sku : ''}
                      </span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm tabular-nums">
                        {formatNumber(product.price)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <Search className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="font-medium text-slate-600">Tidak ada produk ditemukan</p>
                <p className="text-xs text-slate-400 mt-1">
                  Coba ubah kata kunci pencarian atau kategori.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Barcode Scanner Simulation View */}
        {productTab === 'barcode' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <BarcodeIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Input Barcode Scanner</h3>
                  <p className="text-xs text-slate-500">
                    Gunakan scanner fisik atau ketik kode barcode di bawah ini
                  </p>
                </div>
              </div>

              <form onSubmit={handleBarcodeSubmit} className="flex gap-2 mb-4">
                <input
                  type="text"
                  autoFocus
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Ketik barcode atau SKU (contoh: 883, 875, 610)..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-lg transition-colors"
                >
                  Scan & Tambah
                </button>
              </form>

              {barcodeError && (
                <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{barcodeError}</span>
                </div>
              )}

              {/* Quick Barcode Clickers */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  Simulasi Cepat (Klik untuk Scan):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {products.slice(0, 9).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        addToCart(p);
                        setBarcodeInput('');
                      }}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-sky-500 bg-slate-50 hover:bg-sky-50 text-left transition-all group"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-sky-600 font-bold">
                          #{p.barcode || p.sku}
                        </span>
                        <span className="font-semibold text-slate-800 tabular-nums">
                          {formatNumber(p.price)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 truncate mt-1">{p.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Custom Item View */}
        {productTab === 'custom' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-xl mx-auto w-full">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Tambah Menu Khusus (Custom)</h3>
                  <p className="text-xs text-slate-500">
                    Masukkan menu pesanan manual di luar daftar katalog
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddCustomItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Menu / Item *
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Contoh: Paket Nasi Bakar Spesial"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Satuan (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Contoh: 35000"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Khusus (Opsional)
                  </label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Contoh: Pedas sedang, tanpa timun"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan ke Pesanan</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
