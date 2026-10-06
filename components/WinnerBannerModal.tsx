'use client';

import React, { useState } from 'react';
import { Award, Sparkles, Check, X, Tag } from 'lucide-react';
import { DrawnRecord } from '@/lib/types';
import { soundManager } from '@/lib/sound';

interface WinnerBannerModalProps {
  winnerRecord: DrawnRecord | null;
  onClose: () => void;
  onSavePrizeNote: (recordId: string, note: string) => void;
}

export const WinnerBannerModal: React.FC<WinnerBannerModalProps> = ({
  winnerRecord,
  onClose,
  onSavePrizeNote,
}) => {
  const [note, setNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!winnerRecord) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePrizeNote(winnerRecord.id, note.trim());
    setIsSaved(true);
    soundManager.playClick();
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.35)] p-6 sm:p-8 text-center text-slate-100 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4">
          <Award className="w-4 h-4 text-amber-400" />
          <span>NOMOR UNDIAN ANDA</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        {/* Winner round */}
        <p className="text-xs sm:text-sm text-slate-400">
          Pengundian Putaran Ke-{winnerRecord.order} ({winnerRecord.timestamp})
        </p>

        {/* Big Winner Number Display */}
        <div className="my-6">
          <div className="text-7xl sm:text-8xl font-black font-mono tracking-tight text-amber-300 drop-shadow-[0_0_35px_rgba(245,158,11,0.85)] tabular-nums">
            {winnerRecord.formattedNumber}
          </div>
        </div>

        {/* Quick Prize Note Tagger */}
        <form onSubmit={handleSave} className="mt-4 pt-4 border-t border-slate-800/80">
          <label className="block text-xs font-medium text-slate-300 mb-2 text-left flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Nama Peserta:</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="masukan data peserta atau nama"
              className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shrink-0 flex items-center gap-1"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-950" /> : null}
              <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
            </button>
          </div>
        </form>

        {/* CTA to continue */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors"
          >
            Lanjut Pengundian Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
};
