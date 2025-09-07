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
    selectArtist(id: number | null) { this.selectedArtistId = id; this.page = id ? 'artist' : 'artists'; },
    selectAlbum(id: number | null | undefined)  { this.selectedAlbumId = id; this.page = id ? 'album'  : 'albums'; },
    selectGenre(genre: string) { this.selectedGenre = genre; this.page = 'genre'; },
    setSearch(q: string) { this.search = q; },
  },
});
