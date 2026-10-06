'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, CheckCircle2, HelpCircle, Layers } from 'lucide-react';
import { DrawnRecord, formatTicketNumber, DigitFormat } from '@/lib/types';

interface PoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalParticipants: number;
  drawnRecords: DrawnRecord[];
  digitFormat: DigitFormat;
}

export const PoolModal: React.FC<PoolModalProps> = ({
  isOpen,
  onClose,
  totalParticipants,
  drawnRecords,
  digitFormat,
}) => {
  const [filter, setFilter] = useState<'all' | 'remaining' | 'drawn'>('all');
  const [search, setSearch] = useState('');

  const drawnMap = useMemo(() => {
    const map = new Map<number, DrawnRecord>();
    drawnRecords.forEach((r) => map.set(r.number, r));
    return map;
  }, [drawnRecords]);

  const allNumbers = useMemo(() => {
    const list: number[] = [];
    for (let i = 1; i <= totalParticipants; i++) {
      list.push(i);
    }
    return list;
  }, [totalParticipants]);

  const filteredNumbers = useMemo(() => {
    return allNumbers.filter((num) => {
      const isDrawn = drawnMap.has(num);
      if (filter === 'drawn' && !isDrawn) return false;
      if (filter === 'remaining' && isDrawn) return false;

      if (search) {
        const formatted = formatTicketNumber(num, totalParticipants, digitFormat);
        return String(num).includes(search) || formatted.includes(search);
      }
      return true;
    });
  }, [allNumbers, drawnMap, filter, search, totalParticipants, digitFormat]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh] text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Transparansi Pool Nomor Undian</h3>
              <p className="text-xs text-slate-400">
                Pemeriksaan status seluruh {totalParticipants.toLocaleString('id-ID')} nomor peserta
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-4 shrink-0">
          {/* Segmented filter buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-slate-800 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({totalParticipants})
            </button>
            <button
              type="button"
              onClick={() => setFilter('remaining')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filter === 'remaining'
                  ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sisa ({totalParticipants - drawnRecords.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('drawn')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                filter === 'drawn'
                  ? 'bg-amber-950/80 text-amber-300 font-bold border border-amber-800/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Terundi ({drawnRecords.length})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor peserta..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Numbers Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredNumbers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Tidak ada nomor yang sesuai filter.
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {filteredNumbers.map((num) => {
                const record = drawnMap.get(num);
                const isDrawn = !!record;
                const formatted = formatTicketNumber(num, totalParticipants, digitFormat);

                return (
                  <div
                    key={num}
                    title={
                      isDrawn
                        ? `Terundi pada #${record.order} (${record.timestamp})${
                            record.prizeNote ? ` - ${record.prizeNote}` : ''
                          }`
                        : 'Belum diundi (Tersedia)'
                    }
                    className={`p-2 rounded-xl text-center font-mono border transition-all ${
                      isDrawn
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold'
                        : 'bg-slate-950/60 border-slate-800/70 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-bold tabular-nums">{formatted}</div>
                    <div className="text-[10px] mt-0.5 opacity-70">
                      {isDrawn ? (
                        <span className="text-amber-400">#{record.order}</span>
                      ) : (
                        <span className="text-emerald-400/80">Tersedia</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 mt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Tersedia: {totalParticipants - drawnRecords.length}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Terundi: {drawnRecords.length}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
