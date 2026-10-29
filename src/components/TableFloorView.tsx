import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { TableItem } from '../types/pos';
import { formatRupiah, formatTimeAgo } from '../utils/format';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const TableFloorView: React.FC = () => {
  const {
    tables,
    updateTableStatus,
    selectTable,
    setActiveView,
    selectedTable,
  } = usePOS();

  const [activeSection, setActiveSection] = useState<string>('all');

  const filteredTables = tables.filter((t) =>
    activeSection === 'all' ? true : t.section === activeSection
  );

  const totalTables = tables.length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const availableCount = tables.filter((t) => t.status === 'available').length;
  const reservedCount = tables.filter((t) => t.status === 'reserved').length;
  const occupancyRate = Math.round((occupiedCount / totalTables) * 100);

  const handleSelectTableForPOS = (table: TableItem) => {
    selectTable(table);
    setActiveView('pos_desktop');
  };

  return (
    <div className="flex-1 bg-slate-100 p-4 md:p-6 overflow-y-auto">
      {/* Top Header & Metrics */}
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Denah Meja & Ruangan Kafe
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola status meja, pesanan aktif tamu, dan ketersediaan tempat duduk
            </p>
          </div>

          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            {[
              { id: 'all', label: 'Semua Meja' },
              { id: 'indoor', label: 'Indoor Hall' },
              { id: 'bar', label: 'Bar Counter' },
              { id: 'outdoor', label: 'Outdoor Teras' },
              { id: 'vip', label: 'VIP Lounge' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeSection === s.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Occupancy Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Tingkat Okupansi</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {occupancyRate}%
              </span>
              <span className="text-xs text-slate-400">({occupiedCount}/{totalTables} Meja)</span>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Meja Kosong / Siap</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-emerald-600 tabular-nums">
                {availableCount}
              </span>
              <span className="text-xs text-emerald-600/80 font-medium">Tersedia</span>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Meja Terisi</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-sky-600 tabular-nums">
                {occupiedCount}
              </span>
              <span className="text-xs text-sky-600/80 font-medium">Sedang Makan</span>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Reservasi</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-purple-600 tabular-nums">
                {reservedCount}
              </span>
              <span className="text-xs text-purple-600/80 font-medium">Booking</span>
            </div>
          </div>
        </div>

        {/* Tables Floor Plan Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            const isSelected = selectedTable?.id === table.id;
            const isOccupied = table.status === 'occupied';
            const isReserved = table.status === 'reserved';

            return (
              <div
                key={table.id}
                className={`bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-sky-500 ring-2 ring-sky-300'
                    : isOccupied
                    ? 'border-amber-200 bg-amber-50/20'
                    : isReserved
                    ? 'border-purple-200 bg-purple-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                          {table.number}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isOccupied
                              ? 'bg-amber-100 text-amber-800'
                              : isReserved
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOccupied ? 'Terisi' : isReserved ? 'Reservasi' : 'Tersedia'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{table.name}</p>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500 text-xs bg-slate-100 px-2 py-1 rounded-lg">
                      <Users className="w-3.5 h-3.5" />
                      <span className="font-semibold">{table.capacity}</span>
                    </div>
                  </div>

                  {/* Occupied Bill Info */}
                  {isOccupied && (
                    <div className="mt-4 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-amber-800 font-medium">Tagihan Berjalan:</span>
                        <span className="font-bold text-amber-950 font-mono">
                          {formatRupiah(table.currentTotal || 0)}
                        </span>
                      </div>
                      {table.occupiedSince && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-700">
                          <Clock className="w-3 h-3" />
                          <span>Makan sejak: {formatTimeAgo(table.occupiedSince)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Table Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleSelectTableForPOS(table)}
                    className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Pilih di Kasir</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {isOccupied ? (
                    <button
                      onClick={() => updateTableStatus(table.id, 'available')}
                      title="Kosongkan Meja"
                      className="px-2.5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs rounded-lg transition-colors"
                    >
                      Bebaskan
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        updateTableStatus(
                          table.id,
                          isReserved ? 'available' : 'reserved'
                        )
                      }
                      title="Ubah Status Reservasi"
                      className="px-2.5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs rounded-lg transition-colors"
                    >
                      {isReserved ? 'Batalkan' : 'Reservasi'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
