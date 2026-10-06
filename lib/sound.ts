/**
 * Web Audio API synthesized sound generator
 * Requires zero external audio assets, works 100% offline.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.7;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setConfig(enabled: boolean, volume: number) {
    this.isEnabled = enabled;
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Fast click / rolling tick sound
   */
  public playRollingTick(pitchVariation: number = 1.0) {
    if (!this.isEnabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = 450 + Math.random() * 80 + (pitchVariation - 1) * 200;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore audio errors gracefully
    }
  }

  /**
   * Slowing down tick as the machine approaches winner
   */
  public playTensionTick(step: number, totalSteps: number) {
    if (!this.isEnabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch rises as we get closer to the final number
      const progress = Math.min(1, step / Math.max(1, totalSteps));
      const freq = 500 + progress * 400;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq + 150, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.18 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Ignore audio errors gracefully
    }
  }

  /**
   * Triumphant fanfare sound when winner is selected
   */
  public playWinFanfare() {
    if (!this.isEnabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High-energy triumphant notes: C5, E5, G5, C6 arpeggio followed by sustained rich chord
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.12 }, // C5
        { freq: 659.25, time: 0.12, dur: 0.12 }, // E5
        { freq: 783.99, time: 0.24, dur: 0.16 }, // G5
        { freq: 1046.50, time: 0.40, dur: 0.60 }, // C6 (climax)
        { freq: 1318.51, time: 0.40, dur: 0.60 }, // E6 harmonic
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = freq > 1000 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        const currentVol = 0.25 * this.volume;
        gain.gain.setValueAtTime(0.001, now + time);
        gain.gain.linearRampToValueAtTime(currentVol, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
    } catch {
      // Ignore audio errors gracefully
    }
  }

  /**
   * UI Click sound
   */
  public playClick() {
    if (!this.isEnabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore audio errors gracefully
    }
  }

  /**
   * Reset swoosh sound
   */
  public playReset() {
    if (!this.isEnabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // Ignore audio errors gracefully
    }
  }
}

export const soundManager = new SoundController();
