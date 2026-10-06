'use client';

import React, { useState } from 'react';
import {
  X,
  Sliders,
  Hash,
  Gauge,
  Volume2,
  Sparkles,
  Palette,
  RotateCcw,
  AlertTriangle,
  Check,
} from 'lucide-react';
import {
  LotterySettings,
  DigitFormat,
  AnimationSpeed,
  DecelerationMode,
  ThemeColor,
} from '@/lib/types';
import { THEMES } from '@/lib/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: LotterySettings;
  onSaveSettings: (newSettings: LotterySettings) => void;
  onOpenReset: () => void;
  hasActiveDraws: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenReset,
  hasActiveDraws,
}) => {
  const [participantInput, setParticipantInput] = useState<string>(
    String(settings.participantCount)
  );
  const [digitFormat, setDigitFormat] = useState<DigitFormat>(settings.digitFormat);
  const [animationSpeed, setAnimationSpeed] = useState<AnimationSpeed>(settings.animationSpeed);
  const [stopDeceleration, setStopDeceleration] = useState<DecelerationMode>(settings.stopDeceleration);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);
  const [soundVolume, setSoundVolume] = useState<number>(settings.soundVolume);
  const [confettiEnabled, setConfettiEnabled] = useState<boolean>(settings.confettiEnabled);
  const [theme, setTheme] = useState<ThemeColor>(settings.theme);
  const [eventTitle, setEventTitle] = useState<string>(settings.eventTitle);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const presetCounts = [10, 50, 100, 250, 500, 1000, 5000];

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const count = parseInt(participantInput, 10);

    if (isNaN(count)) {
      setErrorMsg('Jumlah peserta harus berupa angka.');
      return;
    }
    if (count < 1) {
      setErrorMsg('Jumlah peserta minimal 1.');
      return;
    }
    if (count > 10000) {
      setErrorMsg('Jumlah peserta maksimal 10.000.');
      return;
    }

    setErrorMsg(null);
    onSaveSettings({
      participantCount: count,
      digitFormat,
      animationSpeed,
      stopDeceleration,
      soundEnabled,
      soundVolume,
      confettiEnabled,
      theme,
      eventTitle: eventTitle.trim() || 'PENGUNDIAN NOMOR DIGITAL',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pengaturan Pengundian</h3>
              <p className="text-xs text-slate-400">
                Konfigurasi jumlah peserta, format nomor, audio, dan tampilan
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

        <form onSubmit={handleApply} className="space-y-6 mt-6">
          {/* Judul Acara */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Judul Acara / Header Panggung
            </label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Contoh: Doorprize Acara HUT 2026"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 1. Pengaturan Jumlah Peserta */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-amber-400" />
                Jumlah Peserta (Min 1 – Max 10.000)
              </label>
              <span className="text-xs text-slate-400">Default: 100</span>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={10000}
                value={participantInput}
                onChange={(e) => {
                  setParticipantInput(e.target.value);
                  setErrorMsg(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-base font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500 tabular-nums"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400">Pilihan Cepat:</span>
              {presetCounts.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setParticipantInput(String(preset))}
                  className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-colors ${
                    participantInput === String(preset)
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {hasActiveDraws && (
              <p className="text-xs text-amber-400/90 flex items-center gap-1.5 pt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Catatan: Sudah ada nomor yang terundi. Mengubah jumlah peserta akan menyesuaikan pool nomor yang tersedia.
              </p>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
            )}
          </div>

          {/* 2. Format Digit Nomor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Format Tampilan Digit Nomor
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'auto', label: 'Otomatis', sample: '001 / 01' },
                { id: '2', label: '2 Digit', sample: '01 s/d 99' },
                { id: '3', label: '3 Digit', sample: '001 s/d 999' },
                { id: '4', label: '4 Digit', sample: '0001 s/d 9999' },
                { id: 'raw', label: 'Tanpa Nol', sample: '1, 2, 3...' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setDigitFormat(opt.id as DigitFormat)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    digitFormat === opt.id
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-200">{opt.label}</div>
                  <div className="text-[11px] font-mono text-amber-400/80 mt-0.5">{opt.sample}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Kecepatan & Durasi Berhenti */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kecepatan Animasi */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                Kecepatan Putaran (MULAI)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'fast', label: 'Cepat' },
                  { id: 'normal', label: 'Sedang' },
                  { id: 'relaxed', label: 'Santai' },
                ].map((spd) => (
                  <button
                    type="button"
                    key={spd.id}
                    onClick={() => setAnimationSpeed(spd.id as AnimationSpeed)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-colors ${
                      animationSpeed === spd.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Durasi Deselerasi */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                Respon Tombol STOP
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'instant', label: 'Seketika (Tanpa Jeda)' },
                  { id: 'short', label: 'Singkat (~1s)' },
                  { id: 'normal', label: 'Bertahap (~2s)' },
                  { id: 'dramatic', label: 'Tegang (~3s)' },
                ].map((mode) => (
                  <button
                    type="button"
                    key={mode.id}
                    onClick={() => setStopDeceleration(mode.id as DecelerationMode)}
                    className={`py-2 px-1 text-center text-xs font-medium rounded-xl border transition-colors ${
                      stopDeceleration === mode.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Suara & Confetti */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            {/* Sound options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                  Efek Suara (Web Audio)
                </label>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
              {soundEnabled && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">Volume</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                    {Math.round(soundVolume * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Confetti options */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Animasi Confetti Kemenangan
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ledakan pita kertas perayaan saat nomor terpilih
                </p>
              </div>
              <input
                type="checkbox"
                checked={confettiEnabled}
                onChange={(e) => setConfettiEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* 5. Warna Tema Tampilan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              Tema Warna Panggung
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(Object.keys(THEMES) as ThemeColor[]).map((themeKey) => {
                const t = THEMES[themeKey];
                return (
                  <button
                    type="button"
                    key={themeKey}
                    onClick={() => setTheme(themeKey)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                      theme === themeKey
                        ? 'border-white bg-slate-800 text-white font-semibold'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: t.accentColor }}
                    />
                    <span className="text-xs">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Danger Zone: Reset Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReset();
              }}
              className="px-3 py-2 text-xs font-medium rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors flex items-center gap-1.5 border border-rose-900/40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Seluruh Data Undian</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>ATUR / SIMPAN</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
