<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StreamController;
use App\Models\Track;
use App\Models\Album;
use App\Models\Artist;
use App\Models\Playlist;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('index');
});

Route::get('/stream/{track}', [StreamController::class, 'audio'])->name('stream.track');

Route::get('/api/music', function(){
    return [
        'status' => 'ok',
        'albums' => Album::all(['id', 'title', 'artist_id', 'year', 'cover_path','musicbrainz_albumid','is_various','is_favorite']),
        'artists' => Artist::all(['id', 'name']),
        'tracks' => Track::all(['id', 'title', 'album_id', 'artist_id', 'duration','disk_no', 'track_no','genre','year']),
    ];
});

// API endpoint to create a new playlist
Route::post('/api/playlists', function (\Illuminate\Http\Request $request) {
    try {
        // Trim the name
        $request->merge(['name' => trim($request->input('name'))]);
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:playlists,name',
        ]);
        $playlist = Playlist::create($data);
        return response()->json(['id' => $playlist->id], 201);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json(['errors' => $e->errors()], 422);
    }
});

// API endpoint to get all playlists with their tracks
Route::get('/api/playlists', function () {
    $playlists = Playlist::all(['id', 'name'])->map(function ($playlist) {
        return [
            'id' => $playlist->id,
            'name' => $playlist->name,
            'tracks' => $playlist->tracks()->orderBy('position')->get(['tracks.id'])->pluck('id')->toArray(),
        ];
    });
    return response()->json(['playlists' => $playlists]);
});

// API endpoint to update a playlist's tracks
Route::put('/api/playlists/{playlist}/tracks', function (\Illuminate\Http\Request $request, Playlist $playlist) {
    try {
        $data = $request->validate([
            'track_ids' => 'array',
            'track_ids.*' => 'integer|exists:tracks,id',
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json(['errors' => $e->errors()], 422);
    }

    // Remove existing tracks from the playlist
    $playlist->tracks()->detach();

    // Attach new tracks with their positions
    foreach ($data['track_ids'] as $position => $trackId) {
        $playlist->tracks()->attach($trackId, ['position' => $position]);
    }

    return response()->json(['message' => 'Playlist updated successfully.']);
});

// API endpoint to delete a playlist
Route::delete('/api/playlists/{playlist}', function (Playlist $playlist) {
    $playlist->tracks()->detach();
    $playlist->delete();
    return response()->json(['message' => 'Playlist deleted successfully.']);
});

// Route to serve album cover images
Route::get('/cover/{album_id}', function ($album_id) {
    $album = Album::query()->find($album_id);
    $path = $album ? $album->cover_path : null;
    abort_unless($path && Storage::disk('covers')->exists($path), 404);
    $mime = str_ends_with($path, '.png') ? 'image/png' : 'image/jpeg';
    return response()->file(Storage::disk('covers')->path($path), ['Content-Type'=>$mime, 'Cache-Control'=>'public, max-age=86400']);
})->name('cover');


// Save album favorite status
Route::put('/api/albums/{album}/favorite', function (\Illuminate\Http\Request $request, Album $album) {
    $request->validate([
        'is_favorite' => 'required|boolean',
    ]);
    $album->is_favorite = $request->input('is_favorite');
    $album->save();
    return response()->json(['message' => 'Album favorite status updated successfully.']);
});
