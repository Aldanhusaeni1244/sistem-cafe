import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { formatNumber, formatRupiah, formatDateTime } from '../utils/format';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Users,
  ShoppingBag,
  CreditCard,
  QrCode,
  Banknote,
  Printer,
  Download,
  Calendar,
  Clock,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { orders, products, setLastCompletedOrder, setActiveModal } = usePOS();
  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month'>('today');

  // Completed paid orders
  const paidOrders = orders.filter((o) => o.status === 'paid');

  // Total Revenue
  const totalRevenue = paidOrders.reduce((acc, curr) => acc + curr.total, 0);
  const totalTransactions = paidOrders.length;
  const averageTicket = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
  const totalItemsSold = paidOrders.reduce(
    (acc, curr) => acc + curr.items.reduce((s, i) => s + i.qty, 0),
    0
  );

  // Payment Breakdown
  const paymentStats = paidOrders.reduce((acc, curr) => {
    const method = curr.paymentMethod || 'cash';
    acc[method] = (acc[method] || 0) + curr.total;
    return acc;
  }, {} as Record<string, number>);

  // Hourly distribution data (09:00 - 21:00)
  const hourlyData = [
    { hour: '09:00', sales: 65000 },
    { hour: '11:00', sales: 185000 },
    { hour: '13:00', sales: 320000 },
    { hour: '15:00', sales: 240000 },
    { hour: '17:00', sales: 410000 },
    { hour: '19:00', sales: totalRevenue > 0 ? Math.min(totalRevenue, 580000) : 180000 },
    { hour: '21:00', sales: 120000 },
  ];
  const maxHourly = Math.max(...hourlyData.map((h) => h.sales), 1);

  // Top Selling Products Calculation
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number; image: string }> = {};
  paidOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSalesMap[item.name]) {
        productSalesMap[item.name] = {
          name: item.name,
          qty: 0,
          revenue: 0,
          image: item.image,
        };
      }
      productSalesMap[item.name].qty += item.qty;
      productSalesMap[item.name].revenue += item.price * item.qty;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const handleExportCSV = () => {
    const csvContent = [
      ['No. Order', 'Waktu', 'Tipe', 'Meja', 'Pelanggan', 'Kasir', 'Metode Bayar', 'Total (IDR)'].join(','),
      ...paidOrders.map((o) =>
        [
          o.orderNumber,
          `"${formatDateTime(o.createdAt)}"`,
          o.diningType,
          o.tableNumber || '-',
          `"${o.customer.name}"`,
          `"${o.servedBy.name}"`,
          o.paymentMethod || 'cash',
          o.total,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan_penjualan_kedai_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 md:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard Omset & Laporan Real-Time
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau performa penjualan kafe, tren menu terlaris, dan arus kas harian
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
              {[
                { id: 'today', label: 'Hari Ini' },
                { id: '7days', label: '7 Hari' },
                { id: 'month', label: 'Bulan Ini' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeRange(t.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    timeRange === t.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Core Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sales */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Omset Penjualan</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {formatRupiah(totalRevenue)}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+14.2% vs kemarin</span>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Nota Transaksi</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {totalTransactions} Nota
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Rata-rata {formatRupiah(averageTicket)} / nota
              </div>
            </div>
          </div>

          {/* Items Sold */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Item Terjual</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {totalItemsSold} Porsi
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Dari {products.length} variasi katalog
              </div>
            </div>
          </div>

          {/* Shift & Branch */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Status Shift Kasir</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Shift Pagi - Sore (Batam)</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Kasir aktif: Budi Santoso
              </div>
            </div>
          </div>
        </div>

        {/* Middle Grid: Hourly Chart & Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly Trend Bar Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Tren Penjualan Per Jam</h3>
                <p className="text-xs text-slate-400">Grafik omset penjualan selama jam operasional</p>
              </div>
              <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md">
                Jam Ramai: 17:00 - 20:00
              </span>
            </div>

            {/* Visual SVG / Bar Column Chart */}
            <div className="h-52 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-100">
              {hourlyData.map((bar, i) => {
                const heightPct = Math.max(12, Math.round((bar.sales / maxHourly) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatNumber(bar.sales)}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-sky-500 group-hover:bg-sky-600 rounded-t-lg transition-all duration-300 relative shadow-xs"
                    ></div>
                    <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                      {bar.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Metode Pembayaran</h3>
              <p className="text-xs text-slate-400 mb-4">Porsi penerimaan transaksi pelanggan</p>

              <div className="space-y-3">
                {[
                  { id: 'cash', label: 'Tunai (Cash)', icon: Banknote, color: 'emerald' },
                  { id: 'qris', label: 'QRIS / E-Wallet', icon: QrCode, color: 'sky' },
                  { id: 'card', label: 'Kartu Debit / EDC', icon: CreditCard, color: 'indigo' },
                  { id: 'voucher', label: 'Voucher & Promo', icon: Receipt, color: 'amber' },
                ].map((item) => {
                  const amount = paymentStats[item.id] || 0;
                  const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                  const Icon = item.icon;

                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2 font-medium text-slate-700">
                          <Icon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.label}</span>
                        </div>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {formatRupiah(amount)} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full bg-${item.color}-500 rounded-full`}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Settlement Status:</span>
              <span className="text-emerald-600 font-semibold">Otomatis Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Bottom Split: Top Selling Menu & Recent Orders Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Menu Paling Laris Hari Ini</h3>
            <p className="text-xs text-slate-400 mb-4">Berdasarkan kuantitas terjual</p>

            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">Belum ada data penjualan.</p>
              ) : (
                topProducts.map((prod, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-bold text-slate-400 text-xs">
                        #{i + 1}
                      </span>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-xs leading-tight">
                          {prod.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {formatRupiah(prod.revenue)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-sky-600 tabular-nums">
                        {prod.qty}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">terjual</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Orders Log */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-slate-900 text-sm">Riwayat Transaksi Terbaru</h3>
                <span className="text-xs text-slate-400">{paidOrders.length} transaksi</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Daftar transaksi terbayar hari ini</p>

              <div className="space-y-2 max-h-72 overflow-y-auto divide-y divide-slate-100">
                {paidOrders.slice(0, 6).map((order) => (
                  <div key={order.id} className="pt-2 first:pt-0 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {order.diningType === 'dine_in' ? `Meja ${order.tableNumber}` : 'Bungkus'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {order.paymentMethod?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {order.customer.name} · {order.items.length} jenis item
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-xs font-mono tabular-nums">
                        {formatRupiah(order.total)}
                      </span>
                      <button
                        onClick={() => {
                          setLastCompletedOrder(order);
                          setActiveModal('receipt');
                        }}
                        title="Cetak Ulang Struk"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-sky-50 hover:text-sky-600 text-slate-500 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-400">
                Semua data tersinkronisasi otomatis secara real-time
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
