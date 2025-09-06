export type Artist = { id: number; name: string };
export type Album = {
    id: number;
    title: string;
    artist_id: number;
    year?: number;
    cover_path?: string;
};
export type Track = {
    id: number;
    title: string;
    artist_id: number;
    genre: string;
    album_id: number;
    track_no?: number;
    duration?: number;
};

export type LibraryPayload = {
    artists: Artist[];
    albums: Album[];
    tracks: Track[];
};
