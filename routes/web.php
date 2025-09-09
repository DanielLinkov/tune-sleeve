<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StreamController;
use App\Models\Track;
use App\Models\Album;
use App\Models\Artist;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('index');
});

Route::get('/stream/{track}', [StreamController::class, 'audio'])->name('stream.track');

Route::get('/api/music', function(){
    return [
        'status' => 'ok',
        'albums' => Album::all(['id', 'title', 'artist_id', 'year', 'cover_path','musicbrainz_albumid','is_various']),
        'artists' => Artist::all(['id', 'name']),
        'tracks' => Track::all(['id', 'title', 'album_id', 'artist_id', 'duration','disk_no', 'track_no','genre','year']),
    ];
});

Route::get('/cover/{album_id}', function ($album_id) {
    $album = Album::find($album_id);
    $path = $album ? $album->cover_path : null;
    abort_unless($path && Storage::disk('covers')->exists($path), 404);
    $mime = str_ends_with($path, '.png') ? 'image/png' : 'image/jpeg';
    return response()->file(Storage::disk('covers')->path($path), ['Content-Type'=>$mime, 'Cache-Control'=>'public, max-age=86400']);
})->name('cover');
