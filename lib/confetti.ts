import confetti from 'canvas-confetti';

export function fireWinnerConfetti() {
  if (typeof window === 'undefined') return;

  // Center burst
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#EC4899', '#FBBF24'],
  });

  // Left cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#F59E0B', '#FCD34D', '#F43F5E', '#10B981'],
    });
  }, 150);

  // Right cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#F59E0B', '#FCD34D', '#F43F5E', '#10B981'],
    });
  }, 300);
}
