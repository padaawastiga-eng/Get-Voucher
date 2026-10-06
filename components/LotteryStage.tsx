'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Play, Square, Sparkles, CheckCircle2, Award } from 'lucide-react';
import {
  LotterySettings,
  DrawnRecord,
  formatTicketNumber,
  secureRandomPick,
} from '@/lib/types';
import { soundManager } from '@/lib/sound';
import { fireWinnerConfetti } from '@/lib/confetti';
import { THEMES } from '@/lib/theme';

export type StageState = 'IDLE' | 'ROLLING' | 'STOPPING' | 'WINNER' | 'COMPLETED';

interface LotteryStageProps {
  settings: LotterySettings;
  availableNumbers: number[];
  drawnNumbers: DrawnRecord[];
  onNumberDrawn: (drawnNumber: number) => void;
  isFullscreen: boolean;
  onOpenSettings: () => void;
}

export const LotteryStage: React.FC<LotteryStageProps> = ({
  settings,
  availableNumbers,
  drawnNumbers,
  onNumberDrawn,
  isFullscreen,
  onOpenSettings,
}) => {
  const [stageState, setStageState] = useState<StageState>('IDLE');
  const [activeRollDisplay, setActiveRollDisplay] = useState<string | null>(null);

  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stoppingTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const currentTheme = THEMES[settings.theme] || THEMES.gold;

  // Track if all numbers are drawn
  const isCompleted = availableNumbers.length === 0 && drawnNumbers.length > 0;

  // Derived display number when not actively rolling
  const defaultDisplay = useMemo(() => {
    if (drawnNumbers.length > 0) {
      const lastWinner = drawnNumbers[drawnNumbers.length - 1];
      return formatTicketNumber(lastWinner.number, settings.participantCount, settings.digitFormat);
    }
    const sample = formatTicketNumber(0, settings.participantCount, settings.digitFormat);
    return sample.replace(/0/g, '-');
  }, [drawnNumbers, settings.participantCount, settings.digitFormat]);

  const displayNumber = activeRollDisplay !== null ? activeRollDisplay : defaultDisplay;

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
      stoppingTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Update sound controller settings
  useEffect(() => {
    soundManager.setConfig(settings.soundEnabled, settings.soundVolume);
  }, [settings.soundEnabled, settings.soundVolume]);

  /**
   * START DRAWING
   */
  const handleStart = useCallback(() => {
    if (stageState === 'ROLLING' || stageState === 'STOPPING') return;
    if (availableNumbers.length === 0) {
      setStageState('COMPLETED');
      return;
    }

    soundManager.playClick();
    setStageState('ROLLING');

    // Determine speed interval
    const speedMs =
      settings.animationSpeed === 'fast' ? 40 : settings.animationSpeed === 'relaxed' ? 120 : 70;

    let tickCounter = 0;
    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);

    rollIntervalRef.current = setInterval(() => {
      // Pick random number from available pool for animation
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const tempNum = availableNumbers[randomIndex];
      setActiveRollDisplay(formatTicketNumber(tempNum, settings.participantCount, settings.digitFormat));

      tickCounter++;
      if (tickCounter % 2 === 0) {
        soundManager.playRollingTick();
      }
    }, speedMs);
  }, [stageState, availableNumbers, settings]);

  /**
   * STOP DRAWING & DECELERATE TO WINNER
   */
  const handleStop = useCallback(() => {
    if (stageState !== 'ROLLING') return;

    soundManager.playClick();

    // 1. Pick the true winning number securely from available numbers
    const pickResult = secureRandomPick(availableNumbers);
    if (!pickResult) {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
      setStageState('COMPLETED');
      return;
    }

    const finalWinner = pickResult.number;

    // Stop fast continuous interval
    if (rollIntervalRef.current) {
      clearInterval(rollIntervalRef.current);
      rollIntervalRef.current = null;
    }

    // Handle instant stop
    if (settings.stopDeceleration === 'instant') {
      const formatted = formatTicketNumber(finalWinner, settings.participantCount, settings.digitFormat);
      setActiveRollDisplay(formatted);
      setStageState('WINNER');
      onNumberDrawn(finalWinner);
      if (settings.confettiEnabled) fireWinnerConfetti();
      soundManager.playWinFanfare();
      return;
    }

    // Handle smooth deceleration
    setStageState('STOPPING');
    stoppingTimeoutsRef.current.forEach(clearTimeout);
    stoppingTimeoutsRef.current = [];

    // Build deceleration curve steps
    let steps: number[] = [];
    if (settings.stopDeceleration === 'short') {
      steps = [60, 100, 160, 240, 360, 520];
    } else if (settings.stopDeceleration === 'dramatic') {
      steps = [60, 90, 130, 180, 250, 340, 460, 620, 850, 1100];
    } else {
      // 'normal' deceleration (~2.2s)
      steps = [70, 110, 160, 230, 330, 470, 660, 900];
    }

    let cumulativeTime = 0;

    steps.forEach((delay, index) => {
      cumulativeTime += delay;
      const isLast = index === steps.length - 1;

      const timeoutId = setTimeout(() => {
        if (isLast) {
          // Final landing on the verified winner!
          const formatted = formatTicketNumber(finalWinner, settings.participantCount, settings.digitFormat);
          setActiveRollDisplay(formatted);
          setStageState('WINNER');
          onNumberDrawn(finalWinner);

          if (settings.confettiEnabled) {
            fireWinnerConfetti();
          }
          soundManager.playWinFanfare();
        } else {
          // Rolling tension step: show random candidate from pool
          const randomIdx = Math.floor(Math.random() * availableNumbers.length);
          const rollingNum = availableNumbers[randomIdx];
          setActiveRollDisplay(formatTicketNumber(rollingNum, settings.participantCount, settings.digitFormat));
          soundManager.playTensionTick(index + 1, steps.length);
        }
      }, cumulativeTime);

      stoppingTimeoutsRef.current.push(timeoutId);
    });
  }, [stageState, availableNumbers, settings, onNumberDrawn]);

  // Spacebar hotkey listener for stage convenience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (stageState === 'ROLLING') {
          handleStop();
        } else if (stageState === 'IDLE' || stageState === 'WINNER') {
          handleStart();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stageState, handleStart, handleStop]);

  // Status message text and style
  const getStatusContent = () => {
    if (isCompleted) {
      return {
        label: 'SEMUA NOMOR TELAH DIUNDI',
        sub: 'Seluruh peserta dalam daftar telah mendapatkan nomor.',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      };
    }
    if (stageState === 'ROLLING') {
      return {
        label: 'SEDANG MENGUNDI NOMOR...',
        sub: 'Tekan STOP untuk menentukan pemenang acak',
        icon: <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />,
        badgeClass: 'text-amber-300 bg-amber-500/10 border-amber-500/40 animate-pulse',
      };
    }
    if (stageState === 'STOPPING') {
      return {
        label: 'MENENTUKAN PEMENANG...',
        sub: 'Memperlambat putaran mesin pengundi...',
        icon: <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />,
        badgeClass: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/40',
      };
    }
    if (stageState === 'WINNER') {
      return {
        label: 'NOMOR PEMENANG TERPILIH!',
        sub: 'Nomor ini telah resmi keluar dan tidak akan terundi kembali',
        icon: <Award className="w-5 h-5 text-amber-400" />,
        badgeClass: 'text-amber-300 bg-amber-500/20 border-amber-500/50',
      };
    }
    return {
      label: 'NOMOR TERPILIH',
      sub: availableNumbers.length > 0 ? 'Tekan tombol MULAI untuk mengundi' : 'Silakan atur jumlah peserta terlebih dahulu',
      icon: <Sparkles className="w-5 h-5 text-slate-400" />,
      badgeClass: 'text-slate-300 bg-slate-800/80 border-slate-700',
    };
  };

  const status = getStatusContent();
  const canStart = (stageState === 'IDLE' || stageState === 'WINNER') && availableNumbers.length > 0;
  const canStop = stageState === 'ROLLING';

  return (
    <div
      className={`relative w-full rounded-2xl border transition-all duration-500 ${
        currentTheme.cardBorder
      } ${currentTheme.cardBg} ${
        stageState === 'ROLLING' || stageState === 'STOPPING'
          ? 'ring-2 ring-amber-400/30 ' + currentTheme.glowStyle
          : stageState === 'WINNER'
          ? 'ring-2 ring-amber-400/50 ' + currentTheme.glowStyle
          : 'shadow-2xl'
      } ${isFullscreen ? 'p-6 sm:p-10 my-auto' : 'p-6 sm:p-8 md:p-12'}`}
    >
      {/* Subtle projector beam backdrop effect */}
      <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none rounded-2xl" />

      {/* Top Banner: Status Indicator */}
      <div className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all ${status.badgeClass}`}
        >
          {status.icon}
          <span>{status.label}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md">
          {status.sub}
        </p>
      </div>

      {/* Center Giant Number Display */}
      <div className="relative flex flex-col items-center justify-center my-4 sm:my-8 min-h-[180px] sm:min-h-[260px] md:min-h-[320px]">
        {/* Glow backdrop behind number */}
        <div
          className={`absolute w-72 sm:w-96 h-36 sm:h-48 rounded-full blur-3xl opacity-30 transition-all duration-700 pointer-events-none ${
            stageState === 'WINNER'
              ? 'bg-amber-400 scale-125 opacity-50'
              : stageState === 'ROLLING'
              ? 'bg-emerald-400 scale-110 opacity-40'
              : 'bg-slate-700'
          }`}
        />

        {/* The Huge Ticket Number */}
        <div
          className={`relative z-10 font-mono font-black select-none tracking-tight tabular-nums transition-transform duration-150 ${
            stageState === 'WINNER'
              ? 'scale-105 ' + currentTheme.numberGlow
              : stageState === 'ROLLING' || stageState === 'STOPPING'
              ? 'text-yellow-300 drop-shadow-[0_0_25px_rgba(253,224,71,0.6)]'
              : 'text-slate-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]'
          } ${
            isFullscreen
              ? 'text-8xl sm:text-9xl md:text-[13rem] lg:text-[16rem]'
              : 'text-7xl sm:text-8xl md:text-9xl lg:text-[11rem]'
          }`}
          style={{ lineHeight: 1.05 }}
        >
          {displayNumber}
        </div>

        {/* Small subtitle indicator below number */}
        <div className="mt-3 sm:mt-5 text-xs sm:text-sm font-medium tracking-widest text-slate-500 uppercase">
          {stageState === 'WINNER' ? (
            <span className="text-amber-400 flex items-center gap-1 font-semibold">
              <Sparkles className="w-4 h-4" /> TERPILIH SECARA ACAK DARI POOL
            </span>
          ) : stageState === 'ROLLING' ? (
            <span className="text-emerald-400 animate-pulse">
              PUTARAN MESIN AKTIF...
            </span>
          ) : (
            <span>Rentang Nomor: 1 – {settings.participantCount}</span>
          )}
        </div>
      </div>

      {/* Prominent Action Buttons: MULAI & STOP */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-10">
        {/* MULAI (START) BUTTON */}
        <button
          type="button"
          onClick={handleStart}
          disabled={!canStart}
          className={`w-full sm:w-auto min-w-[200px] sm:min-w-[240px] px-8 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-3 border ${
            canStart
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-800/60 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-50'
          }`}
        >
          <Play className={`w-6 h-6 fill-current ${canStart ? 'animate-pulse' : ''}`} />
          <span>MULAI</span>
          <span className="text-xs font-normal opacity-70 border border-white/20 px-1.5 py-0.5 rounded ml-1 hidden md:inline">
            SPASI
          </span>
        </button>

        {/* STOP BUTTON */}
        <button
          type="button"
          onClick={handleStop}
          disabled={!canStop}
          className={`w-full sm:w-auto min-w-[200px] sm:min-w-[240px] px-8 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-3 border ${
            canStop
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-400/60 shadow-[0_0_50px_rgba(244,63,94,0.5)] hover:shadow-[0_0_60px_rgba(244,63,94,0.7)] animate-pulse hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-800/60 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-40'
          }`}
        >
          <Square className="w-6 h-6 fill-current" />
          <span>STOP</span>
          <span className="text-xs font-normal opacity-70 border border-white/20 px-1.5 py-0.5 rounded ml-1 hidden md:inline">
            SPASI
          </span>
        </button>
      </div>

      {/* Helper notice if completed */}
      {isCompleted && (
        <div className="mt-8 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>SEMUA NOMOR TELAH DIUNDI!</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Total {drawnNumbers.length} nomor telah diundi. Anda dapat mengekspor hasil ke Excel atau melakukan reset untuk memulai kembali.
          </p>
        </div>
      )}

      {/* Stage Bottom Footer Info */}
      <div className="mt-8 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span>Kontrol Cepat:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono">
            [SPASI]
          </kbd>
          <span>Mulai / Stop</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono">
            [F]
          </kbd>
          <span>Layar Penuh</span>
        </div>

        <div>
          <span>Anti-Duplikat: </span>
          <strong className="text-emerald-400 font-semibold">Aktif & Terverifikasi</strong>
        </div>
      </div>
    </div>
  );
};
