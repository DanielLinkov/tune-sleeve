// src/stores/ui.ts
import { defineStore } from 'pinia';

export type Page = 'artists' | 'artist' | 'albums' | 'album' | 'queue' | 'genres' | 'genre' | 'playlists' | 'playlist';

export const useUiStore = defineStore('ui', {
  state: () => ({
    page: 'albums' as Page,
    selectedArtistId: null as number | null,
    selectedAlbumId:  null as number | null,
    selectedGenre: null as string | null,
    search: '',
  }),
  actions: {
    setPage(p: Page) { this.page = p; },
    selectArtist(id: number | null) { this.selectedArtistId = id; },
    selectAlbum(id: number | null | undefined)  { this.selectedAlbumId = id; },
    selectGenre(genre: string) { this.selectedGenre = genre; },
    setSearch(q: string) { this.search = q; },
  },
});
