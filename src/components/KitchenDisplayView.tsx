import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { KitchenTicket } from '../types/pos';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Flame,
  BellRing,
  AlertTriangle,
  Utensils,
  Volume2,
  RefreshCw,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export const KitchenDisplayView: React.FC = () => {
  const {
    kitchenTickets,
    updateKitchenTicketStatus,
    toggleKitchenItemDone,
  } = usePOS();

  const [filter, setFilter] = useState<'active' | 'cooking' | 'ready' | 'all'>('active');
  const [, setNow] = useState(Date.now());

  // Re-render every 5 seconds to update elapsed timers
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredTickets = kitchenTickets.filter((t) => {
    if (filter === 'active') return t.status === 'pending' || t.status === 'cooking';
    if (filter === 'cooking') return t.status === 'cooking';
    if (filter === 'ready') return t.status === 'ready';
    return true;
  });

  const getElapsedMinutes = (isoString: string): number => {
    const diff = Date.now() - new Date(isoString).getTime();
    return Math.floor(diff / 60000);
  };

  const formatElapsed = (isoString: string): string => {
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* KDS Header Bar */}
      <div className="h-14 bg-slate-800/90 border-b border-slate-700/80 px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-white text-base tracking-wide">
                Kitchen Display System (KDS)
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-400">
              Sinkronisasi Pesanan Barista & Dapur Real-Time
            </p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-700">
            {[
              { id: 'active', label: 'Pesanan Aktif' },
              { id: 'cooking', label: 'Sedang Dimasak' },
              { id: 'ready', label: 'Siap Disajikan' },
              { id: 'all', label: 'Semua Tiket' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filter === f.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => soundManager.playKitchenDing()}
            title="Tes Suara Bel Dapur"
            className="w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-600 text-amber-400 flex items-center justify-center transition-colors"
          >
            <BellRing className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-4 md:p-6">
        {filteredTickets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-16">
            <ChefHat className="w-16 h-16 stroke-1 text-slate-700 mb-3" />
            <p className="font-semibold text-lg text-slate-300">Dapur Sedang Bersih!</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Tidak ada antrean pesanan aktif saat ini. Tiket baru dari kasir akan muncul secara real-time di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {filteredTickets.map((ticket) => {
              const minutes = getElapsedMinutes(ticket.createdAt);
              const isUrgent = minutes >= 10;
              const isWarning = minutes >= 5 && minutes < 10;

              return (
                <div
                  key={ticket.id}
                  className={`bg-slate-800 rounded-xl border flex flex-col overflow-hidden shadow-lg transition-all ${
                    ticket.status === 'ready'
                      ? 'border-emerald-500/50 ring-1 ring-emerald-500/30'
                      : isUrgent
                      ? 'border-rose-500/70 ring-1 ring-rose-500/40'
                      : isWarning
                      ? 'border-amber-500/50'
                      : 'border-slate-700'
                  }`}
                >
                  {/* Ticket Header */}
                  <div
                    className={`p-3.5 border-b flex items-center justify-between ${
                      ticket.status === 'ready'
                        ? 'bg-emerald-950/40 border-emerald-800/40'
                        : isUrgent
                        ? 'bg-rose-950/40 border-rose-800/40'
                        : 'bg-slate-750 border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-white tracking-wide">
                          {ticket.diningType === 'take_away' ? 'BUNGKUS' : `MEJA ${ticket.tableNumber}`}
                        </span>
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                          #{ticket.orderNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Pelayan: {ticket.servedBy}
                      </p>
                    </div>

                    {/* Timer Badge */}
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                        ticket.status === 'ready'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isUrgent
                          ? 'bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/40'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatElapsed(ticket.createdAt)}</span>
                    </div>
                  </div>

                  {/* Order Notes Banner */}
                  {ticket.orderNotes && (
                    <div className="px-3 py-1.5 bg-amber-950/30 border-b border-amber-900/30 text-amber-300 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{ticket.orderNotes}</span>
                    </div>
                  )}

                  {/* Items list with strike-through completion checkboxes */}
                  <div className="p-3.5 space-y-2 flex-1 max-h-72 overflow-y-auto divide-y divide-slate-700/50">
                    {ticket.items.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleKitchenItemDone(ticket.id, idx)}
                        className={`pt-2 first:pt-0 flex items-start gap-3 cursor-pointer select-none group transition-opacity ${
                          item.done ? 'opacity-40 line-through' : 'opacity-100'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center border transition-colors ${
                            item.done
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-600 group-hover:border-slate-400'
                          }`}
                        >
                          {item.done && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-white text-sm">
                              {item.name}
                            </span>
                            <span className="font-extrabold text-amber-400 text-base font-mono tabular-nums ml-2">
                              x{item.qty}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-xs text-sky-400 font-medium mt-0.5">
                              Catatan: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Status Actions */}
                  <div className="p-3 bg-slate-850 border-t border-slate-700 flex items-center gap-2">
                    {ticket.status === 'pending' && (
                      <button
                        onClick={() => updateKitchenTicketStatus(ticket.id, 'cooking')}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Mulai Masak</span>
                      </button>
                    )}

                    {ticket.status === 'cooking' && (
                      <button
                        onClick={() => {
                          updateKitchenTicketStatus(ticket.id, 'ready');
                          soundManager.playKitchenDing();
                        }}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Pesanan Siap (Ready)</span>
                      </button>
                    )}

                    {ticket.status === 'ready' && (
                      <button
                        onClick={() => updateKitchenTicketStatus(ticket.id, 'completed')}
                        className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>Sajikan ke Pelanggan</span>
                      </button>
                    )}

                    {ticket.status === 'completed' && (
                      <div className="w-full py-1.5 text-center text-xs text-slate-400 font-medium">
                        ✓ Telah Selesai Disajikan
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
