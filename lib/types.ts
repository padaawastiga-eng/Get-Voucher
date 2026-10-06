export type DigitFormat = 'auto' | '2' | '3' | '4' | 'raw';
export type AnimationSpeed = 'fast' | 'normal' | 'relaxed';
export type DecelerationMode = 'instant' | 'short' | 'normal' | 'dramatic';
export type ThemeColor = 'gold' | 'emerald' | 'sapphire' | 'ruby' | 'dark';

export interface DrawnRecord {
  id: string;
  order: number;
  number: number;
  formattedNumber: string;
  timestamp: string; // e.g. "16:20:15"
  isoTimestamp: string;
  prizeNote?: string;
}

export interface LotterySettings {
  participantCount: number;
  digitFormat: DigitFormat;
  animationSpeed: AnimationSpeed;
  stopDeceleration: DecelerationMode;
  soundEnabled: boolean;
  soundVolume: number;
  confettiEnabled: boolean;
  theme: ThemeColor;
  eventTitle: string;
}

export const DEFAULT_SETTINGS: LotterySettings = {
  participantCount: 100,
  digitFormat: 'auto',
  animationSpeed: 'fast',
  stopDeceleration: 'instant',
  soundEnabled: true,
  soundVolume: 0.7,
  confettiEnabled: true,
  theme: 'gold',
  eventTitle: 'PENGUNDIAN NOMOR DIGITAL',
};

export function formatTicketNumber(
  num: number | null | undefined,
  totalParticipants: number,
  format: DigitFormat
): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '---';
  }

  if (format === 'raw') {
    return String(num);
  }

  if (format === '2') {
    return String(num).padStart(2, '0');
  }

  if (format === '3') {
    return String(num).padStart(3, '0');
  }

  if (format === '4') {
    return String(num).padStart(4, '0');
  }

  // 'auto' mode: calculate minimum digits required
  const digits = Math.max(2, String(Math.max(totalParticipants, 1)).length);
  return String(num).padStart(digits, '0');
}

/**
 * Cryptographically secure random pick from array of numbers
 */
export function secureRandomPick(pool: number[]): { number: number; index: number } | null {
  if (!pool || pool.length === 0) return null;

  let randomIndex: number;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    randomIndex = array[0] % pool.length;
  } else {
    randomIndex = Math.floor(Math.random() * pool.length);
  }

  return {
    number: pool[randomIndex],
    index: randomIndex,
  };
}
