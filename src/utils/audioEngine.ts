"use client";

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  public isMuted: boolean = false;

  private getAC() {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    return this.audioCtx;
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
  }

  private playNote(freq: number, type: OscillatorType, dur: number, vol: number, delay = 0, fe: number | null = null) {
    if (this.isMuted) return;
    try {
      const ac = this.getAC();
      if (!ac) return;
      const o = ac.createOscillator();
      const g = ac.createGain();
      const comp = ac.createDynamicsCompressor();
      o.connect(g);
      g.connect(comp);
      comp.connect(ac.destination);
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, ac.currentTime + delay);
      if (fe) o.frequency.exponentialRampToValueAtTime(fe, ac.currentTime + delay + dur);
      g.gain.setValueAtTime(0, ac.currentTime + delay);
      g.gain.linearRampToValueAtTime(vol || 0.2, ac.currentTime + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + dur);
      o.start(ac.currentTime + delay);
      o.stop(ac.currentTime + delay + dur + 0.02);
    } catch (e) {}
  }

  public playTap() {
    this.playNote(800, 'sine', 0.05, 0.12);
  }

  public playAddCart() {
    [[523, 0], [659, 0.08], [784, 0.16], [1047, 0.26]].forEach(([f, d]) => 
      this.playNote(f, 'sine', 0.22, 0.18, d)
    );
  }

  public playRemoveItem() {
    this.playNote(330, 'sine', 0.15, 0.2, 0, 180);
    this.playNote(220, 'sine', 0.2, 0.12, 0.08);
  }

  public playSuccess() {
    [[523, 0, 0.4], [659, 0.1, 0.4], [784, 0.2, 0.5], [1047, 0.32, 0.6], [784, 0.5, 0.4], [1047, 0.65, 0.8]].forEach(([f, d, dur]) => 
      this.playNote(f, 'sine', dur, 0.18, d)
    );
  }

  public playError() {
    this.playNote(180, 'sawtooth', 0.08, 0.15, 0, 150);
    this.playNote(140, 'sawtooth', 0.1, 0.1, 0.1);
  }

  public playPageChange() {
    this.playNote(600, 'sine', 0.07, 0.1);
    this.playNote(750, 'sine', 0.1, 0.08, 0.06);
  }
}

export const audio = new AudioEngine();
