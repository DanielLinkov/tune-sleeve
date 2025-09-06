// src/stores/player.ts
import { defineStore } from 'pinia';
import type { Track } from '../types';
import { Player } from '../Player';
import { useHistoryStore } from './history';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    queue: [] as Track[],
    index: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    _player: null as Player | null,
    _unsub: null as null | (() => void),
  }),
  getters: {
    nowPlaying: (s) => s.queue[s.index] ?? null,
    canPrev: (s) => s.index > 0,
    canNext: (s) => s.index >= 0 && s.index + 1 < s.queue.length,
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
        this.currentTime = s.currentTime;
        this.duration = s.duration;
      });

      // Track only queue + index in history to avoid noisy entries
      useHistoryStore().register(this, { include: ['queue', 'index'], capacity: 50 });
    },
    destroy() { this._unsub?.(); this._player = null; },

    // Proxies
    play(i?: number)   { this._player?.play(i); },
    pause()            { this._player?.pause(); },
    next()             { this._player?.next(); },
    prev()             { this._player?.prev(); },
    seek(s: number)    { this._player?.seek(s); },
    clear()            { this._player?.clear(); },
    enqueue(t: Track | Track[]) { this._player?.enqueue(t); },
    removeAt(i: number) { this._player?.removeAt(i); },
  },
});
