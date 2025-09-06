// src/stores/library.ts
import { defineStore } from 'pinia';
import { fetchLibrary } from '../services/api';
import type { Artist, Album, Track, LibraryPayload } from '../types';
import { useHistoryStore } from './history';

export const useLibraryStore = defineStore('library', {
  state: () => ({
    artists: [] as Artist[],
    albums:  [] as Album[],
    tracks:  [] as Track[],
    genres:  [] as string[],
    loaded: false,
  }),
  getters: {
    albumsByArtist: (s) => {
      const m: Record<number, Album[]> = {};
      s.albums.forEach(a => { (m[a.artist_id] ??= []).push(a); });
      Object.values(m).forEach(arr => arr.sort((x,y) => (x.year ?? 0) - (y.year ?? 0)));
      return m;
    },
    tracksOfAlbum: (s) => (albumId: number) =>
      s.tracks.filter(t => t.album_id === albumId).sort((a,b) => (a.track_no ?? 0) - (b.track_no ?? 0)),
    allGenres: (s) => s.genres.sort((a,b) => a.localeCompare(b)),
  },
  actions: {
    async load() {
      const lib: LibraryPayload = await fetchLibrary();
      this.artists = lib.artists;
      this.albums  = lib.albums;
      this.tracks  = lib.tracks;
      this.genres  = Array.from(new Set(this.tracks.map((track: { genre: string; }) => track.genre)));
      this.loaded  = true;
    },
    registerHistory() {
      useHistoryStore().register(this, {
        // Library usually doesn’t need undo/redo, but you can track filters later
        include: ['artists', 'albums', 'tracks', 'loaded'],
        capacity: 5,
      });
    },
  },
});
