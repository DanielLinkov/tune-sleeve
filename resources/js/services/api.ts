import type { LibraryPayload, PlaylistPayload, Playlist } from "../types";

function getCsrfToken(): string {
    const cookiePrefix = "XSRF-TOKEN=";
    const cookie = document.cookie
        .split("; ")
        .find((part) => part.startsWith(cookiePrefix));

    if (!cookie) return "";

    const encodedToken = cookie.slice(cookiePrefix.length);
    try {
        return decodeURIComponent(encodedToken);
    } catch {
        return encodedToken;
    }
}

export async function fetchLibrary(): Promise<LibraryPayload> {
    const res = await fetch("/api/music", {
        headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Failed to load library");
    return res.json();
}

export async function fetchPlaylists(): Promise<PlaylistPayload> {
    const res = await fetch("/api/playlists", {
        headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Failed to load playlists");
    return res.json();
}

export async function createPlaylist(name: string): Promise<number> {
    const res = await fetch(`/api/playlists`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": getCsrfToken(),
        },
        body: JSON.stringify({ name }),
    });
    if (!res.ok) {
        if (res.status === 422) {
            const errorData = await res.json();
            const errorMessage = errorData.errors?.name?.[0] || "Validation error";
            throw new Error(errorMessage);
        }
        throw new Error("Failed to create playlist: " + res.statusText);
    }
    const json = await res.json();
    return json.id;
}

export async function savePlaylist(playlist: Playlist): Promise<number> {
    const res = await fetch(`/api/playlists/${playlist.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": getCsrfToken(),
        },
        body: JSON.stringify(playlist),
    });
    if (!res.ok) throw new Error("Failed to save playlist: " + res.statusText);
    const json = await res.json();
    return json.id;
}

export async function savePlaylistTracks(playlistId: number, trackIds: number[]): Promise<string> {
    const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": getCsrfToken(),
        },
        body: JSON.stringify({ track_ids: trackIds }),
    });
    if (!res.ok) {
        if (res.status === 422) {
            const errorData = await res.json();
            const errorMessage = errorData.errors?.track_ids?.[0] || "Validation error";
            throw new Error(errorMessage);
        }
        throw new Error("Failed to save playlist tracks: " + res.statusText);
    }
    const json = await res.json();
    return json.message;
}

export async function deletePlaylist(playlistId: number): Promise<void> {
    const res = await fetch(`/api/playlists/${playlistId}`, {
        method: "DELETE",
        headers: {
            "X-XSRF-TOKEN": getCsrfToken(),
        },
    });
    if (!res.ok) throw new Error("Failed to delete playlist: " + res.statusText);
}
