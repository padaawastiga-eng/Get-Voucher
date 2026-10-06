'use client';

import React from 'react';
import { Users, CheckCircle2, HelpCircle, Eye } from 'lucide-react';

interface StatsBarProps {
  totalParticipants: number;
  totalDrawn: number;
  onOpenPool: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalParticipants,
  totalDrawn,
  onOpenPool,
}) => {
  const remaining = Math.max(0, totalParticipants - totalDrawn);
  const percentage = totalParticipants > 0 ? Math.round((totalDrawn / totalParticipants) * 100) : 0;

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-5 backdrop-blur-sm">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
        {/* Total Peserta */}
        <div className="flex items-center gap-3 sm:px-3 first:pl-0">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Peserta
            </div>
            <div className="text-2xl font-bold text-slate-100 tabular-nums">
              {totalParticipants.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Sudah Diundi */}
        <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:px-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Sudah Diundi
            </div>
            <div className="text-2xl font-bold text-amber-300 tabular-nums">
              {totalDrawn.toLocaleString('id-ID')}
              <span className="text-xs font-normal text-slate-400 ml-1.5">
                ({percentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Belum Diundi */}
        <div className="flex items-center justify-between pt-3 sm:pt-0 sm:px-4 last:pr-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Belum Diundi
              </div>
              <div className="text-2xl font-bold text-emerald-300 tabular-nums">
                {remaining.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenPool}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/60 transition-colors flex items-center gap-1.5"
            title="Lihat seluruh daftar nomor yang belum / sudah diundi"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Lihat Pool</span>
          </button>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>Progres Pengundian</span>
          <span className="tabular-nums font-mono">{totalDrawn} dari {totalParticipants} selesai</span>
        </div>
        <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
