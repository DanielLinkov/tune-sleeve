export type Artist = { id: number; name: string };
export type Album = {
    id: number;
    musicbrainz_albumid?: string;
    title: string;
    artist_id: number;
    year?: number;
    cover_path?: string;
    is_various?: boolean;
};
export type Track = {
    id: number;
    title: string;
    artist_id: number;
    genre: string;
    album_id: number;
    disk_no?: number;
    track_no?: number;
    duration?: number;
};

export type LibraryPayload = {
    artists: Artist[];
    albums: Album[];
    tracks: Track[];
};
