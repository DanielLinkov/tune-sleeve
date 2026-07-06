// src/stores/library.ts
import { defineStore } from "pinia";
import { fetchLibrary, savePlaylistTracks, createPlaylist, fetchPlaylists, deletePlaylist, saveAlbumFavoriteStatus } from "../services/api";
import type { Artist, Album, Track, LibraryPayload, Playlist, PlaylistPayload } from "../types";
import { usePlayerStore } from "./player";

export const useLibraryStore = defineStore("library", {
    state: () => ({
        artists: [] as Artist[],
        albums: [] as Album[],
        tracks: [] as Track[],
        genres: [] as string[],
        loaded: false,
        playlists: [] as Playlist[],
        loadedPlaylists: false,
    }),
    getters: {
        getPlaylists(s) {
            return s.playlists.sort((a, b) => a.name.localeCompare(b.name));
        },
        getPlaylistTracks: (s) => (playlistId: number) => {
            const playlist = s.playlists.find((p) => p.id === Number(playlistId));
            if (!playlist) return [];
            return playlist.tracks
                .map((trackId) => s.tracks.find((t) => t.id === trackId))
                .filter((t): t is Track => !!t);
        },
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
                const uniqueQueueIds = Array.from(new Set(queueIds));
                const queueTracks = uniqueQueueIds
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

            const playlists: PlaylistPayload = await fetchPlaylists();
            this.playlists = playlists.playlists;
            this.loadedPlaylists = true;
        },
        async addPlaylist(name: string) {
            if (!name.trim()) return;
            if (this.playlists.some((p) => p.name === name)) throw new Error(`Playlist with name "${name}" already exists.`);

            const id = await createPlaylist(name);
            this.playlists.push({ id, name, tracks: [] });
            return id;
        },
        async addTrackToPlaylist(trackId: number, playlistId?: number, newPlaylistName?: string) {
            const track = this.tracks.find((t) => t.id === trackId);
            if (!track) throw new Error("Track not found");

            let playlist: Playlist | undefined;
            if (playlistId !== undefined) {
                playlist = this.playlists.find((p) => p.id === playlistId);
                if (!playlist) throw new Error("Playlist not found");
            } else {
                // If no playlistId is provided, use the first playlist
                if (newPlaylistName && newPlaylistName.trim()) {
                    const id = await createPlaylist(newPlaylistName);
                    playlist = { id, name: newPlaylistName, tracks: [] };
                    this.playlists.push(playlist);
                } else {
                    playlist = this.playlists[0];
                    if (!playlist) throw new Error("No playlists available");
                }
            }

            if (playlist.tracks.includes(track.id)) {
                throw new Error(`Track "${track.title}" is already in the playlist "${playlist.name}".`);
            }

            playlist.tracks.push(track.id);
            await savePlaylistTracks(playlist.id, playlist.tracks);
            return `Track "${track.title}" added to playlist "${playlist.name}"`;
        },
        async deletePlaylist(playlistId: number) {
            await deletePlaylist(playlistId);
            this.playlists = this.playlists.filter((p) => p.id !== playlistId);
        },
        async removeTrackFromPlaylist(playlistId: number, trackId: number) {
            const playlist = this.playlists.find((p) => p.id === playlistId);
            if (!playlist) throw new Error("Playlist not found");

            const newTrackList = playlist.tracks.filter((id) => id !== trackId);
            const message = await savePlaylistTracks(playlist.id, newTrackList);
            playlist.tracks = newTrackList;
            return message;
        },
        async toggleAlbumFavorite(albumId: number) {
            const album = this.albums.find((a) => a.id === albumId);
            if (!album) throw new Error("Album not found");

            album.is_favorite = !album.is_favorite;
            return await saveAlbumFavoriteStatus(album.id, album.is_favorite);
        }
    },
});
