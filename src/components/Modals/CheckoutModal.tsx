import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { formatNumber, formatRupiah } from '../../utils/format';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  Ticket,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentMethod } from '../../types/pos';

export const CheckoutModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    grandTotal,
    subtotal,
    cart,
    completeSale,
    selectedTable,
    diningType,
  } = usePOS();

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [cardRef, setCardRef] = useState<string>('EDC-8891');
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  // Initialize cash tendered to nearest 50k / exact
  useEffect(() => {
    if (activeModal === 'checkout') {
      const rounded = Math.ceil(grandTotal / 50000) * 50000;
      setCashTendered(rounded >= grandTotal ? rounded : grandTotal);
    }
  }, [activeModal, grandTotal]);

  if (activeModal !== 'checkout') return null;

  const change = Math.max(0, cashTendered - grandTotal);
  const isCashInsufficient = method === 'cash' && cashTendered < grandTotal;

  const handleFinishPayment = () => {
    if (isCashInsufficient) return;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const paidAmount = method === 'cash' ? cashTendered : grandTotal;
    completeSale(method, paidAmount);
  };

  // Quick cash buttons
  const quickCashOptions = [
    { label: 'Uang Pas', amount: grandTotal },
    { label: 'Rp 150.000', amount: 150000 },
    { label: 'Rp 200.000', amount: 200000 },
    { label: 'Rp 300.000', amount: 300000 },
    { label: 'Rp 500.000', amount: 500000 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base tracking-tight">Pembayaran Kasir</h2>
            <p className="text-xs text-slate-400">
              {diningType === 'dine_in' ? `Meja ${selectedTable?.number || '04'}` : 'Bungkus / Take Away'} · {cart.length} item
            </p>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total to pay banner */}
        <div className="p-5 bg-sky-50/70 border-b border-sky-100 text-center">
          <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
            Total Tagihan Bersih
          </span>
          <div className="text-3xl font-extrabold text-sky-950 mt-1 tabular-nums">
            {formatRupiah(grandTotal)}
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="p-4 border-b border-slate-100">
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'cash', label: 'Tunai', icon: Banknote },
              { id: 'qris', label: 'QRIS', icon: QrCode },
              { id: 'card', label: 'Kartu', icon: CreditCard },
              { id: 'voucher', label: 'Voucher', icon: Ticket },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = method === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id as PaymentMethod)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Specific Content */}
        <div className="p-5 space-y-4">
          {/* Method 1: Cash */}
          {method === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uang Diterima dari Pelanggan (Rp)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={cashTendered || ''}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {quickCashOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setCashTendered(opt.amount)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      cashTendered === opt.amount
                        ? 'border-sky-500 bg-sky-50 text-sky-700 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Change calculation */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isCashInsufficient
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div>
                  <span className="text-xs font-medium">
                    {isCashInsufficient ? 'Uang Kurang:' : 'Uang Kembalian:'}
                  </span>
                  <p className="font-extrabold text-xl font-mono tabular-nums mt-0.5">
                    {isCashInsufficient
                      ? formatRupiah(grandTotal - cashTendered)
                      : formatRupiah(change)}
                  </p>
                </div>
                {isCashInsufficient ? (
                  <AlertCircle className="w-6 h-6 text-rose-500" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                )}
              </div>
            </div>
          )}

          {/* Method 2: QRIS */}
          {method === 'qris' && (
            <div className="text-center space-y-3">
              <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md">
                {/* Simulated dynamic QRIS code */}
                <div className="w-48 h-48 bg-slate-900 p-2 rounded-xl flex flex-col items-center justify-center text-white relative">
                  <div className="w-full bg-white text-rose-600 font-black text-[10px] py-0.5 text-center tracking-widest uppercase rounded-xs">
                    QRIS · STANDAR PEMBAYARAN NASIONAL
                  </div>
                  <div className="my-auto grid grid-cols-6 gap-1 p-2 bg-white rounded-lg">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-xs ${
                          (i + (i % 3)) % 2 === 0 ? 'bg-slate-900' : 'bg-white'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-300">
                    KedaiPOS - {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Mendukung GoPay, OVO, Dana, BCA Mobile, Livin Mandiri, ShopeePay
              </p>
            </div>
          )}

          {/* Method 3: Card */}
          {method === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Referensi EDC / Approval Code
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="Contoh: EDC-BCA-981240"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Instruksi Kasir:</p>
                <p>1. Gesek atau masukkan kartu ke mesin EDC.</p>
                <p>2. Pastikan nominal Rp {formatNumber(grandTotal)} telah tertera di mesin.</p>
                <p>3. Masukkan kode persetujuan transaksi di atas.</p>
              </div>
            </div>
          )}

          {/* Method 4: Voucher */}
          {method === 'voucher' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Voucher Promosi
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: CAFEHEMAT20"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono uppercase"
                  />
                  <button
                    onClick={() => {
                      if (voucherCode.trim()) {
                        setVoucherSuccess(`Voucher ${voucherCode} berhasil diverifikasi!`);
                      }
                    }}
                    className="px-3.5 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              {voucherSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{voucherSuccess}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={() => setActiveModal('none')}
            className="flex-1 py-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleFinishPayment}
            disabled={isCashInsufficient}
            className={`flex-1 py-3 text-xs font-bold text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
              isCashInsufficient
                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99]'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Selesaikan & Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
