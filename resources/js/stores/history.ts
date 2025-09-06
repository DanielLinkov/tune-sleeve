// src/stores/history.ts
import { defineStore, storeToRefs } from 'pinia';

type Snapshot = any;
type StoreId = string;

type TrackConfig = {
  include?: string[];     // paths to record (top-level keys)
  exclude?: string[];
  capacity?: number;      // default 50
};

type TrackedStore = {
  id: StoreId;
  getState: () => any;
  patch: (s: any) => void;
  cfg: Required<TrackConfig>;
  past: Snapshot[];
  future: Snapshot[];
  debounce?: number | null;
};

function pick(obj: any, keys?: string[], exclude?: string[]) {
  if (!keys && !exclude) return JSON.parse(JSON.stringify(obj));
  const out: any = {};
  const allow = (k: string) => (!keys || keys.includes(k)) && !(exclude && exclude.includes(k));
  Object.keys(obj).forEach(k => { if (allow(k)) out[k] = obj[k]; });
  return JSON.parse(JSON.stringify(out));
}

export const useHistoryStore = defineStore('history', {
  state: () => ({
    _stores: new Map<StoreId, TrackedStore>(),
  }),
  actions: {
    register(store: any, cfg: TrackConfig = {}) {
      const id = store.$id as StoreId;
      if (this._stores.has(id)) return;

      const tracked: TrackedStore = {
        id,
        getState: () => store.$state,
        patch: (s) => store.$patch(s),
        cfg: {
          include: cfg.include ?? undefined,
          exclude: cfg.exclude ?? undefined,
          capacity: cfg.capacity ?? 50,
        } as Required<TrackConfig>,
        past: [],
        future: [],
        debounce: null,
      };
      this._stores.set(id, tracked);

      // initial snapshot
      this._push(tracked, pick(store.$state, tracked.cfg.include, tracked.cfg.exclude));

      // auto-record on any mutation (debounced per microtask)
      store.$subscribe((_mutation: any, state: any) => {
        if (tracked.debounce) return;
        tracked.debounce = window.setTimeout(() => {
          tracked.debounce = null;
          const snap = pick(state, tracked.cfg.include, tracked.cfg.exclude);
          const last = tracked.past[tracked.past.length - 1];
          if (JSON.stringify(last) !== JSON.stringify(snap)) this._push(tracked, snap);
        }, 0);
      });
    },

    _push(tr: TrackedStore, snap: Snapshot) {
      tr.past.push(snap);
      if (tr.past.length > tr.cfg.capacity) tr.past.shift();
      tr.future = []; // clear future on new branch
    },

    canUndo(id: StoreId) { const tr = this._stores.get(id); return !!tr && tr.past.length > 1; },
    canRedo(id: StoreId) { const tr = this._stores.get(id); return !!tr && tr.future.length > 0; },

    undo(id: StoreId) {
      const tr = this._stores.get(id); if (!tr || tr.past.length <= 1) return;
      const current = tr.past.pop()!;                 // move current to future
      tr.future.push(current);
      const prev = tr.past[tr.past.length - 1];       // last past is the new state
      tr.patch(prev);
    },
    redo(id: StoreId) {
      const tr = this._stores.get(id); if (!tr || tr.future.length === 0) return;
      const next = tr.future.pop()!;
      tr.past.push(next);
      tr.patch(next);
    },

    reset(id: StoreId) {
      const tr = this._stores.get(id); if (!tr) return;
      tr.past = [pick(tr.getState(), tr.cfg.include, tr.cfg.exclude)];
      tr.future = [];
    },
  },
});
