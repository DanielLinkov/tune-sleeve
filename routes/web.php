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
        'albums' => Album::all(),
        'artists' => Artist::all(),
        'tracks' => Track::all(['id', 'title', 'album_id', 'artist_id', 'duration','disk_no', 'track_no','genre','year']),
    ];
});

Route::get('/cover', function (\Illuminate\Http\Request $r) {
    $path = $r->query('path');
    abort_unless($path && Storage::disk('local')->exists($path), 404);
    $mime = str_ends_with($path, '.png') ? 'image/png' : 'image/jpeg';
    return response()->file(Storage::disk('local')->path($path), ['Content-Type'=>$mime, 'Cache-Control'=>'public, max-age=86400']);
})->name('cover');
