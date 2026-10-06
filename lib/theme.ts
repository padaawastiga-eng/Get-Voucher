import { ThemeColor } from './types';

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  glowStyle: string;
  numberGlow: string;
  buttonStart: string;
  buttonStartHover: string;
  cardBorder: string;
  cardBg: string;
  accentBorder: string;
  tagColor: string;
}

export const THEMES: Record<ThemeColor, ThemeConfig> = {
  gold: {
    id: 'gold',
    name: 'Luxury Gold',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    badgeText: 'text-amber-400',
    accentColor: '#F59E0B',
    glowStyle: 'shadow-[0_0_80px_rgba(245,158,11,0.25)]',
    numberGlow: 'text-amber-300 drop-shadow-[0_0_40px_rgba(245,158,11,0.8)]',
    buttonStart: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.35)]',
    buttonStartHover: 'hover:bg-emerald-500',
    cardBorder: 'border-amber-500/20',
    cardBg: 'bg-slate-900/90',
    accentBorder: 'border-amber-500/40',
    tagColor: 'text-amber-400',
  },
  emerald: {
    id: 'emerald',
    name: 'Cyber Emerald',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    badgeText: 'text-emerald-400',
    accentColor: '#10B981',
    glowStyle: 'shadow-[0_0_80px_rgba(16,185,129,0.25)]',
    numberGlow: 'text-emerald-300 drop-shadow-[0_0_40px_rgba(16,185,129,0.8)]',
    buttonStart: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]',
    buttonStartHover: 'hover:bg-emerald-500',
    cardBorder: 'border-emerald-500/20',
    cardBg: 'bg-slate-900/90',
    accentBorder: 'border-emerald-500/40',
    tagColor: 'text-emerald-400',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Royal Sapphire',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    badgeText: 'text-blue-400',
    accentColor: '#3B82F6',
    glowStyle: 'shadow-[0_0_80px_rgba(59,130,246,0.25)]',
    numberGlow: 'text-sky-300 drop-shadow-[0_0_40px_rgba(56,189,248,0.8)]',
    buttonStart: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.35)]',
    buttonStartHover: 'hover:bg-emerald-500',
    cardBorder: 'border-blue-500/20',
    cardBg: 'bg-slate-900/90',
    accentBorder: 'border-blue-500/40',
    tagColor: 'text-sky-400',
  },
  ruby: {
    id: 'ruby',
    name: 'Crimson Ruby',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    badgeText: 'text-rose-400',
    accentColor: '#F43F5E',
    glowStyle: 'shadow-[0_0_80px_rgba(244,63,94,0.25)]',
    numberGlow: 'text-rose-300 drop-shadow-[0_0_40px_rgba(244,63,94,0.8)]',
    buttonStart: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.35)]',
    buttonStartHover: 'hover:bg-emerald-500',
    cardBorder: 'border-rose-500/20',
    cardBg: 'bg-slate-900/90',
    accentBorder: 'border-rose-500/40',
    tagColor: 'text-rose-400',
  },
  dark: {
    id: 'dark',
    name: 'Titanium Dark',
    badgeBg: 'bg-slate-500/10 text-slate-200 border-slate-500/30',
    badgeText: 'text-slate-200',
    accentColor: '#94A3B8',
    glowStyle: 'shadow-[0_0_80px_rgba(148,163,184,0.15)]',
    numberGlow: 'text-slate-100 drop-shadow-[0_0_40px_rgba(255,255,255,0.7)]',
    buttonStart: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.35)]',
    buttonStartHover: 'hover:bg-emerald-500',
    cardBorder: 'border-slate-700/60',
    cardBg: 'bg-slate-900/90',
    accentBorder: 'border-slate-500/40',
    tagColor: 'text-slate-300',
  },
};
