import type { Track } from './types';

export type PlayerSnapshot = {
  queue: Track[];
  index: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
};

type Listener = (s: PlayerSnapshot) => void;

export class Player {
  private audio: HTMLAudioElement;
  private state: PlayerSnapshot = { queue: [], index: -1, isPlaying: false, currentTime: 0, duration: 0 };
  private listeners = new Set<Listener>();

  constructor(audio?: HTMLAudioElement) {
    this.audio = audio ?? new Audio();
    this.audio.addEventListener('timeupdate', () => {
      this.state.currentTime = this.audio.currentTime || 0;
      this.state.duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
      this.emit();
    });
    this.audio.addEventListener('ended', () => this.next());
    this.audio.addEventListener('play',  () => { this.state.isPlaying = true;  this.emit(); });
    this.audio.addEventListener('pause', () => { this.state.isPlaying = false; this.emit(); });
  }

  onChange(fn: Listener) { this.listeners.add(fn); fn(this.snapshot()); return () => this.listeners.delete(fn); }
  private emit() { const snap = this.snapshot(); this.listeners.forEach(l => l(snap)); }
  snapshot(): PlayerSnapshot { return { ...this.state, queue: [...this.state.queue] }; }

  private load(i: number) {
    if (i < 0 || i >= this.state.queue.length) return;
    this.state.index = i;
    this.audio.src = '/stream/' + this.state.queue[i].id;
    this.audio.load();
    this.emit();
  }

  async play(i?: number) {
    if (typeof i === 'number') this.load(i);
    if (this.state.index === -1 && this.state.queue.length) this.load(0);
    await this.audio.play().catch(() => void 0);
    this.state.isPlaying = !this.audio.paused;
    this.emit();
  }
  pause() { this.audio.pause(); }
  stop() { this.audio.pause(); this.audio.currentTime = 0; this.emit(); }
  seek(s: number) { this.audio.currentTime = Math.max(0, s); }
  next() { const n = this.state.index + 1; if (n < this.state.queue.length) { this.load(n); void this.play(); } }
  prev() { const p = this.state.index - 1; if (p >= 0) { this.load(p); void this.play(); } }

  clear() { this.state.queue = []; this.state.index = -1; this.stop(); }
  enqueue(items: Track | Track[]) { const a = Array.isArray(items) ? items : [items]; this.state.queue.push(...a); this.emit();}
  removeAt(i: number) {
    if (i < 0 || i >= this.state.queue.length) return;
    const wasCurrent = i === this.state.index;
    this.state.queue.splice(i, 1);
    if (wasCurrent) {
      if (this.state.index >= this.state.queue.length) this.state.index = this.state.queue.length - 1;
      if (this.state.index >= 0) { this.load(this.state.index); void this.play(); } else this.stop();
    } else if (i < this.state.index) this.state.index--;
    this.emit();
  }
}
