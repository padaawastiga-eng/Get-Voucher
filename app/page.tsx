'use client';

import React, { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { HeaderNav } from '@/components/HeaderNav';
import { StatsBar } from '@/components/StatsBar';
import { LotteryStage } from '@/components/LotteryStage';
import { HistoryTable } from '@/components/HistoryTable';
import { SettingsModal } from '@/components/SettingsModal';
import { ResetConfirmModal } from '@/components/ResetConfirmModal';
import { PoolModal } from '@/components/PoolModal';
import { WinnerBannerModal } from '@/components/WinnerBannerModal';
import {
  LotterySettings,
  DEFAULT_SETTINGS,
  DrawnRecord,
  formatTicketNumber,
} from '@/lib/types';
import { exportToCSV } from '@/lib/export';
import { soundManager } from '@/lib/sound';
import { THEMES } from '@/lib/theme';
import {
  SlidersHorizontal,
  Layers,
  Sparkles,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';

const STORAGE_KEY_SETTINGS = 'pengundian_settings_v1';
const STORAGE_KEY_RECORDS = 'pengundian_records_v1';

const emptySubscribe = () => () => {};

export default function Home() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [settings, setSettings] = useState<LotterySettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            stopDeceleration: parsed.stopDeceleration === 'normal' ? 'instant' : (parsed.stopDeceleration || 'instant'),
          };
        }
      } catch {}
    }
    return DEFAULT_SETTINGS;
  });

  const [drawnRecords, setDrawnRecords] = useState<DrawnRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Modals & overlay states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [winnerBannerRecord, setWinnerBannerRecord] = useState<DrawnRecord | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Save state to LocalStorage
  const persistSettings = useCallback((newSettings: LotterySettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    } catch {}
  }, []);

  const persistRecords = useCallback((newRecords: DrawnRecord[]) => {
    setDrawnRecords(newRecords);
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(newRecords));
    } catch {}
  }, []);

  // Calculate available numbers pool based on participant count & drawn records
  const availableNumbers = useMemo(() => {
    const drawnSet = new Set(drawnRecords.map((r) => r.number));
    const pool: number[] = [];
    for (let i = 1; i <= settings.participantCount; i++) {
      if (!drawnSet.has(i)) {
        pool.push(i);
      }
    }
    return pool;
  }, [settings.participantCount, drawnRecords]);

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcut listener for Fullscreen toggle (F key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  // Sound toggle handler
  const handleToggleSound = () => {
    const newSoundState = !settings.soundEnabled;
    const newSettings = { ...settings, soundEnabled: newSoundState };
    persistSettings(newSettings);
    soundManager.setConfig(newSoundState, settings.soundVolume);
    if (newSoundState) {
      soundManager.playClick();
    }
  };

  // Called by LotteryStage when a number is officially selected
  const handleNumberDrawn = useCallback(
    (winningNum: number) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const newRecord: DrawnRecord = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        order: drawnRecords.length + 1,
        number: winningNum,
        formattedNumber: formatTicketNumber(winningNum, settings.participantCount, settings.digitFormat),
        timestamp: timeStr,
        isoTimestamp: now.toISOString(),
      };

      const updated = [...drawnRecords, newRecord];
      persistRecords(updated);
      setWinnerBannerRecord(newRecord);
    },
    [drawnRecords, settings.participantCount, settings.digitFormat, persistRecords]
  );

  // Update prize note in history
  const handleUpdatePrizeNote = (recordId: string, note: string) => {
    const updated = drawnRecords.map((r) => (r.id === recordId ? { ...r, prizeNote: note } : r));
    persistRecords(updated);
  };

  // Reset all draws
  const handleConfirmReset = () => {
    soundManager.playReset();
    persistRecords([]);
    setWinnerBannerRecord(null);
  };

  // Save new settings from modal
  const handleSaveSettings = (newSettings: LotterySettings) => {
    persistSettings(newSettings);
    // If participant count was reduced below some drawn numbers, clean up or keep valid ones
    const filteredRecords = drawnRecords
      .filter((r) => r.number <= newSettings.participantCount)
      .map((r, idx) => ({
        ...r,
        order: idx + 1,
        formattedNumber: formatTicketNumber(r.number, newSettings.participantCount, newSettings.digitFormat),
      }));

    if (filteredRecords.length !== drawnRecords.length) {
      persistRecords(filteredRecords);
    }
  };

  const handleExport = () => {
    exportToCSV(drawnRecords, settings.eventTitle);
  };

  const currentTheme = THEMES[settings.theme] || THEMES.gold;

  // Initial SSR safety
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-400">Memuat Sistem Pengundian Digital...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar Contract (Wordmark, links/stats, actions) */}
      <HeaderNav
        settings={settings}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenReset={() => setIsResetConfirmOpen(true)}
        onExport={handleExport}
        totalDrawn={drawnRecords.length}
        totalParticipants={settings.participantCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
        {/* Quick Setup Bar (UX requirement: JUMLAH PESERTA -> MULAI -> STOP) */}
        {!isFullscreen && (
          <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Pengaturan Cepat:</span>
              </span>
              <span className="text-slate-400">
                Jumlah Peserta: <strong className="text-amber-300 font-mono">{settings.participantCount}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-700 hidden sm:inline">·</span>
              <span className="text-slate-400">
                Rentang: <strong className="text-slate-200 font-mono">1 s/d {settings.participantCount}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
              >
                Ubah Jumlah Peserta
              </button>
              <button
                type="button"
                onClick={() => setIsPoolModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Periksa Nomor</span>
              </button>
            </div>
          </div>
        )}

        {/* Hero Section: The Grand Centerpiece Lottery Stage */}
        <section aria-label="Panggung Pengundian" className="w-full">
          <LotteryStage
            settings={settings}
            availableNumbers={availableNumbers}
            drawnNumbers={drawnRecords}
            onNumberDrawn={handleNumberDrawn}
            isFullscreen={isFullscreen}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </section>

        {/* Real-time Statistics Summary */}
        <section aria-label="Statistik Pengundian" className="w-full">
          <StatsBar
            totalParticipants={settings.participantCount}
            totalDrawn={drawnRecords.length}
            onOpenPool={() => setIsPoolModalOpen(true)}
          />
        </section>

        {/* History Table & Export */}
        <section aria-label="Riwayat Hasil Undian" className="w-full">
          <HistoryTable
            records={drawnRecords}
            eventTitle={settings.eventTitle}
            onUpdatePrizeNote={handleUpdatePrizeNote}
          />
        </section>

        {/* Professional Stage Guide & Features */}
        {!isFullscreen && (
          <footer className="w-full pt-6 pb-8 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Algoritma acak kriptografis Web Crypto API · Pencegahan nomor duplikat 100% aktif
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Cocok untuk Doorprize · Acara Kantor · Komunitas · Sekolah</span>
            </div>
          </footer>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onOpenReset={() => setIsResetConfirmOpen(true)}
        hasActiveDraws={drawnRecords.length > 0}
      />

      {/* Reset Confirmation Dialog */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirmReset={handleConfirmReset}
        drawnCount={drawnRecords.length}
      />

      {/* Pool Transparency Modal */}
      <PoolModal
        isOpen={isPoolModalOpen}
        onClose={() => setIsPoolModalOpen(false)}
        totalParticipants={settings.participantCount}
        drawnRecords={drawnRecords}
        digitFormat={settings.digitFormat}
      />

      {/* Winner Celebration Modal */}
      <WinnerBannerModal
        winnerRecord={winnerBannerRecord}
        onClose={() => setWinnerBannerRecord(null)}
        onSavePrizeNote={handleUpdatePrizeNote}
      />
    </main>
  );
}
