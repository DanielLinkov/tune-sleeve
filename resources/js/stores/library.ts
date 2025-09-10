// src/stores/library.ts
import { defineStore } from "pinia";
import { fetchLibrary } from "../services/api";
import type { Artist, Album, Track, LibraryPayload } from "../types";
import { usePlayerStore } from "./player";

export const useLibraryStore = defineStore("library", {
    state: () => ({
        artists: [] as Artist[],
        albums: [] as Album[],
        tracks: [] as Track[],
        genres: [] as string[],
        loaded: false,
    }),
    getters: {
        albumsByArtist: (s) => {
            const m: Record<number, Album[]> = {};
            s.albums.forEach((a) => {
                (m[a.artist_id] ??= []).push(a);
            });
            Object.values(m).forEach((arr) =>
                arr.sort((x, y) => (x.year ?? 0) - (y.year ?? 0))
            );
            return m;
        },
        albumsOfArtist: (s) => (artistId: number | null | undefined) =>
            artistId
                ? s.albums
                      .filter((a) => a.artist_id === artistId)
                      .sort((x, y) => (x.year ?? 0) - (y.year ?? 0))
                : [],
        albumsWithArtist: (s) => (artistId: number | null | undefined) => {
            const tracksWithArtist = artistId
                ? s.tracks.filter((t) => t.artist_id === artistId)
                : [];
            const albumIds = new Set(
                tracksWithArtist
                    .map((t) => t.album_id)
                    .filter((id): id is number => id !== null)
            );
            return s.albums
                .filter((a) => albumIds.has(a.id))
                .sort((x, y) => (x.year ?? 0) - (y.year ?? 0));
        },
        albumsOfGenre: (s) => (genre: string | null) =>
            genre
                ? s.albums
                      .filter((a) =>
                          s.tracks.some(
                              (t) => t.album_id === a.id && t.genre === genre
                          )
                      )
                      .sort((a, b) => {
                          const artistA =
                              s.artists.find((ar) => ar.id === a.artist_id)
                                  ?.name ?? "";
                          const artistB =
                              s.artists.find((ar) => ar.id === b.artist_id)
                                  ?.name ?? "";
                          if (artistA === artistB) {
                              return (a.year ?? 0) - (b.year ?? 0);
                          }
                          return artistA.localeCompare(artistB);
                      })
                : [],
        albumsSortedByArtist: (s) => {
            return [...s.albums].sort((a, b) => {
                const artistA =
                    s.artists.find((ar) => ar.id === a.artist_id)?.name ?? "";
                const artistB =
                    s.artists.find((ar) => ar.id === b.artist_id)?.name ?? "";
                if (artistA === artistB) {
                    return (a.year ?? 0) - (b.year ?? 0);
                }
                return artistA.localeCompare(artistB);
            });
        },
        collections: (s) => {
            const variousArtistsAlbums = s.albums.filter((album) => {
                const tracks = s.tracks.filter((t) => t.album_id === album.id);
                if (tracks.length < 2) return false;
                return new Set(tracks.map((t) => t.artist_id)).size > 1;
            });
            return variousArtistsAlbums.sort((a, b) => {
                const artistA =
                    s.artists.find((ar) => ar.id === a.artist_id)?.name ?? "";
                const artistB =
                    s.artists.find((ar) => ar.id === b.artist_id)?.name ?? "";
                if (artistA === artistB) {
                    return (a.year ?? 0) - (b.year ?? 0);
                }
                return artistA.localeCompare(artistB);
            });
        },
        tracksOfAlbum: (s) => (albumId: number | undefined) =>
            albumId
                ? s.tracks
                      .filter((t) => t.album_id === albumId)
                      .sort((a, b) => {
                          if (a.disk_no !== b.disk_no) {
                              return (a.disk_no ?? 0) - (b.disk_no ?? 0);
                          }
                          return (a.track_no ?? 0) - (b.track_no ?? 0);
                      })
                : [],
        albumHasVariousArtists: (s) => (album: Album | null) => {
            if (!album) return false;
            const tracks = s.tracks.filter((t) => t.album_id === album.id);
            if (tracks.length < 2) return false;
            return new Set(tracks.map((t) => t.artist_id)).size > 1;
        },
        allGenres: (s) => s.genres.sort((a, b) => a.localeCompare(b)),
        artistOfAlbum: (s) => (albumId: number) => {
            const album = s.albums.find((a) => a.id === albumId);
            return album
                ? s.artists.find((ar) => ar.id === album.artist_id)
                : undefined;
        },
        artistsOfGenre: (s) => (genre: string | null) => {
            if (!genre) return [];
            const artistIds = new Set(
                s.tracks
                    .filter((t) => t.genre === genre)
                    .map((t) => {
                        const album = s.albums.find((a) => a.id === t.album_id);
                        return album ? album.artist_id : null;
                    })
                    .filter((id): id is number => id !== null)
            );
            return s.artists
                .filter((ar) => artistIds.has(ar.id))
                .sort((a, b) => a.name.localeCompare(b.name));
        },
        coverUrl: (s) => (album: Album) => {
            const hash = btoa(album.cover_path ?? "");
            return `/cover/${album.id}?seed=${hash}`;
        },
        getAlbum: (s) => (albumId: number | null) =>
            s.albums.find((a) => a.id === albumId) ?? null,
        getArtist: (s) => (artistId: number | null) =>
            s.artists.find((a) => a.id === artistId) ?? null,
    },
    actions: {
        async load() {
            const lib: LibraryPayload = await fetchLibrary();
            this.artists = lib.artists;
            this.albums = lib.albums;
            this.tracks = lib.tracks;
            this.genres = Array.from(
                new Set(
                    this.tracks.map((track: { genre: string }) => track.genre)
                )
            );
            this.loaded = true;
            // Load the storted queue from localStorage
            const playerQueue = localStorage.getItem("player-queue");
            if (playerQueue) {
                const queueIds: number[] = JSON.parse(playerQueue);
                const queueTracks = queueIds
                    .map((id) => this.tracks.find((t) => t.id === id))
                    .filter((t) => !!t) as Track[];
                if (queueTracks.length) {
                    const playerStore = usePlayerStore();
                    playerStore.enqueue(queueTracks);
                    const idx = Number(localStorage.getItem("queue-index"));
                    if (!Number.isNaN(idx) && idx >= 0 && idx < playerStore.queue.length) {
                        playerStore.play(idx);
                        playerStore.pause();
                    }
                }
            }
        },
    },
});
