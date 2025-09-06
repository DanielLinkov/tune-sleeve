// src/stores/ui.ts
import { defineStore } from 'pinia';
import { useHistoryStore } from './history';

export type Page = 'library' | 'artist' | 'album' | 'queue';

export const useUiStore = defineStore('ui', {
  state: () => ({
    page: 'library' as Page,
    selectedArtistId: null as number | null,
    selectedAlbumId:  null as number | null,
    search: '',
  }),
  actions: {
    setPage(p: Page) { this.page = p; },
    selectArtist(id: number | null) { this.selectedArtistId = id; this.page = id ? 'artist' : 'library'; },
    selectAlbum(id: number | null)  { this.selectedAlbumId = id; this.page = id ? 'album'  : 'library'; },
    setSearch(q: string) { this.search = q; },
    registerHistory() {
      useHistoryStore().register(this, {
        include: ['page', 'selectedArtistId', 'selectedAlbumId', 'search'],
        capacity: 100,
      });
    },
  },
});
