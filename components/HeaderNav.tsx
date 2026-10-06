'use client';

import React from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  RotateCcw,
  Download,
  Dices,
} from 'lucide-react';
import { LotterySettings } from '@/lib/types';
import { THEMES } from '@/lib/theme';

interface HeaderNavProps {
  settings: LotterySettings;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenReset: () => void;
  onExport: () => void;
  totalDrawn: number;
  totalParticipants: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  settings,
  isFullscreen,
  onToggleFullscreen,
  onToggleSound,
  onOpenSettings,
  onOpenReset,
  onExport,
  totalDrawn,
}) => {
  const currentTheme = THEMES[settings.theme] || THEMES.gold;

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark (single text element as per Top Bar Contract) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-slate-800 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Dices className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
              {settings.eventTitle || 'Pengundian Digital Nomor Otomatis'}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Sistem Undian Acak Terverifikasi & Anti-Duplikat
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation / Quick stats summary */}
        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-400">
          <span>
            Total: <strong className="text-slate-200 tabular-nums">{settings.participantCount}</strong>
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>
            Terundi: <strong className="text-amber-400 tabular-nums">{totalDrawn}</strong>
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>
            Sisa: <strong className="text-emerald-400 tabular-nums">{Math.max(0, settings.participantCount - totalDrawn)}</strong>
          </span>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={settings.soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            title={settings.soundEnabled ? 'Suara Aktif (Klik untuk Mematikan)' : 'Suara Mati (Klik untuk Mengaktifkan)'}
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <span className="hidden lg:inline">{settings.soundEnabled ? 'Suara ON' : 'Suara OFF'}</span>
          </button>

          {/* Export Results */}
          <button
            type="button"
            onClick={onExport}
            disabled={totalDrawn === 0}
            title={totalDrawn === 0 ? 'Belum ada nomor yang diundi' : 'Ekspor Hasil Undian ke Excel / CSV'}
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Ekspor</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Keluar Mode Layar Penuh (Esc)' : 'Mode Layar Penuh (F)'}
            className={`p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              isFullscreen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isFullscreen ? 'Normal' : 'Layar Penuh'}</span>
          </button>

          {/* Reset All */}
          <button
            type="button"
            onClick={onOpenReset}
            title="Reset Seluruh Pengundian"
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-lg border border-slate-800 bg-slate-900 text-rose-300 hover:bg-rose-950/40 hover:border-rose-800/50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span className="hidden lg:inline">Reset</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Pengaturan Aplikasi"
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
