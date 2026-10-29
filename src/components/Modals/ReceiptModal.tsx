import React from 'react';
import { usePOS } from '../../context/POSContext';
import { formatNumber, formatRupiah, formatDateTime } from '../../utils/format';
import { Printer, Download, Check, X, Share2 } from 'lucide-react';
import { Order } from '../../types/pos';

export const ReceiptModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    lastCompletedOrder,
    cart,
    subtotal,
    discountPercent,
    discountNominal,
    deliveryCost,
    taxAmount,
    serviceCharge,
    grandTotal,
    selectedTable,
    diningType,
    pax,
    selectedCustomer,
    activeStaff,
    orderNotes,
  } = usePOS();

  if (activeModal !== 'receipt') return null;

  // Use either the last completed order or generate a preview from active cart
  const order: Partial<Order> = lastCompletedOrder || {
    orderNumber: 'PREVIEW-CHK',
    createdAt: new Date().toISOString(),
    diningType,
    tableNumber: selectedTable?.number,
    pax,
    customer: selectedCustomer,
    servedBy: activeStaff,
    items: cart,
    subtotal,
    discountPercent,
    discountNominal,
    deliveryCost,
    taxAmount,
    total: grandTotal,
    paymentMethod: 'cash',
    amountPaid: grandTotal,
    change: 0,
    notes: orderNotes,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-3 bg-slate-800 text-white flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold">Struk Bukti Pembayaran</span>
          <button
            onClick={() => setActiveModal('none')}
            className="w-7 h-7 rounded-full hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Thermal Receipt Body */}
        <div className="p-6 overflow-y-auto bg-amber-50/20 font-mono text-slate-800 text-xs select-text">
          {/* Cafe Header */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
            <h2 className="font-extrabold text-sm tracking-widest uppercase">
              KEDAI CAFE & KOPI
            </h2>
            <p className="text-[11px] text-slate-500">Cabang Batam Center</p>
            <p className="text-[10px] text-slate-400">Jl. Engku Putri No. 42, Batam</p>
            <p className="text-[10px] text-slate-400">Telp: 0778-456789</p>
          </div>

          {/* Metadata */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>No. Nota:</span>
              <span className="font-bold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu:</span>
              <span>{formatDateTime(order.createdAt || new Date().toISOString())}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{order.servedBy?.name || 'Budi S.'}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span>{order.customer?.name || 'Tamu Umum'}</span>
            </div>
            <div className="flex justify-between">
              <span>Tipe:</span>
              <span className="font-bold">
                {order.diningType === 'dine_in'
                  ? `Dine-In (Meja ${order.tableNumber || '-'}, ${order.pax} Pax)`
                  : 'Take Away / Bungkus'}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-2 text-[11px]">
            {order.items?.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>{item.name}</span>
                  <span className="tabular-nums font-mono">
                    {formatNumber(item.price * item.qty)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>
                    {item.qty} x {formatNumber(item.price)}
                  </span>
                  {item.notes && <span className="italic">{item.notes}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="tabular-nums">{formatRupiah(order.subtotal || 0)}</span>
            </div>
            {(order.discountPercent || 0) > 0 || (order.discountNominal || 0) > 0 ? (
              <div className="flex justify-between text-emerald-700">
                <span>Diskon:</span>
                <span className="tabular-nums">
                  -
                  {formatRupiah(
                    (order.discountPercent || 0) > 0
                      ? ((order.subtotal || 0) * (order.discountPercent || 0)) / 100
                      : order.discountNominal || 0
                  )}
                </span>
              </div>
            ) : null}
            {(order.taxAmount || 0) > 0 && (
              <div className="flex justify-between">
                <span>PPN (10%):</span>
                <span className="tabular-nums">{formatRupiah(order.taxAmount || 0)}</span>
              </div>
            )}
            {order.diningType === 'dine_in' && (
              <div className="flex justify-between">
                <span>Biaya Layanan:</span>
                <span className="tabular-nums">{formatRupiah(3000)}</span>
              </div>
            )}
            {(order.deliveryCost || 0) > 0 && (
              <div className="flex justify-between">
                <span>Ongkir:</span>
                <span className="tabular-nums">{formatRupiah(order.deliveryCost || 0)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-200">
              <span>TOTAL:</span>
              <span className="tabular-nums">{formatRupiah(order.total || 0)}</span>
            </div>
            <div className="flex justify-between pt-1 text-slate-600">
              <span className="uppercase">Metode ({order.paymentMethod || 'TUNAI'}):</span>
              <span className="tabular-nums">{formatRupiah(order.amountPaid || order.total || 0)}</span>
            </div>
            {(order.change || 0) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Kembalian:</span>
                <span className="tabular-nums font-bold">{formatRupiah(order.change || 0)}</span>
              </div>
            )}
          </div>

          {/* Footer & QR */}
          <div className="pt-4 text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-slate-900 rounded p-1 flex items-center justify-center">
                <div className="w-full h-full bg-white flex items-center justify-center text-[9px] font-mono text-slate-900">
                  [QR-STRUK]
                </div>
              </div>
            </div>
            <p className="font-semibold text-[11px]">Terima Kasih Atas Kunjungan Anda!</p>
            <p className="text-[10px] text-slate-400">
              Follow IG: @kedaicafe.nusantara · WiFi: KedaiFree (pass: kopienak)
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Thermal</span>
          </button>
          <button
            onClick={() => setActiveModal('none')}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
