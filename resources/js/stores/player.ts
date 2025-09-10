// src/stores/player.ts
import { defineStore } from 'pinia';
import type { Track } from '../types';
import { Player } from '../Player';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    queue: [] as Track[],
    index: -1,
    isPlaying: false,
    isShuffling: false,
    repeatMode: 'none' as 'none' | 'one' | 'all',
    currentTime: 0,
    duration: 0,
    volume: 1,
    // Internal
    _player: null as Player | null,
    _unsub: null as null | (() => void),
  }),
  getters: {
    nowPlaying: (s) => s.queue[s.index] ?? null,
    canPrev: (s) => s.index > 0,
    canNext: (s) => s.index >= 0 && s.index + 1 < s.queue.length,
    getVolume: (s) => s.volume,
  },
  actions: {
    init() {
      if (this._player) return;
      const p = new Player();
      this._player = p;
      this._unsub = p.onChange(s => {
        // We only mirror state coming from Player
        this.queue = s.queue;
        this.index = s.index;
        this.isPlaying = s.isPlaying;
        this.isShuffling = s.isShuffling;
        this.repeatMode = s.repeatMode;
        this.currentTime = s.currentTime;
        this.duration = s.duration;
        this.volume = s.volume;
      });
      this._player.setVolume(localStorage.getItem('player-volume')
      ? Math.min(1, Math.max(0, Number(localStorage.getItem('player-volume'))))
      : 1);
      this._player.setShuffle(localStorage.getItem('player-shuffle') === '1');
      this._player.setRepeat(localStorage.getItem('player-repeat') as 'none' | 'one' | 'all');
    },
    destroy() { this._unsub?.(); this._player = null; },

    // Proxies
    play(i?: number)   { this._player?.play(i); },
    playTrackId(id: number) {
      const idx = this.queue.findIndex(t => t.id === id);
      if (idx >= 0) this._player?.play(idx);
    },
    pause()            { this._player?.pause(); },
    next()             { this._player?.next(); },
    prev()             { this._player?.prev(); },
    seek(s: number)    { this._player?.seek(s); },
    clear()            { this._player?.clear(); },
    enqueue(t: Track | Track[]) {
        this._player?.enqueue(t);
        const queueIds = this.queue.map(x => x.id);
        localStorage.setItem('player-queue', JSON.stringify(queueIds));
    },
    removeAt(i: number) { this._player?.removeAt(i); },
    toggleShuffle() {
      this._player?.toggleShuffle();
      localStorage.setItem('player-shuffle', this.isShuffling ? '0' : '1');
    },
    setRepeat(mode: 'none' | 'one' | 'all') {
      this._player?.setRepeat(mode);
      localStorage.setItem('player-repeat', mode);
    },
    toggleRepeat() {
      this._player?.toggleRepeat();
      localStorage.setItem('player-repeat', this.repeatMode);
    },
    setVolume(v: number) {
      this._player?.setVolume(v);
      localStorage.setItem('player-volume', String(v));
    },
  },
});
