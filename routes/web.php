<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StreamController;
use App\Models\Track;

Route::get('/', function () {
    return view('index');
});

Route::get('/stream/{track}', [StreamController::class, 'audio'])->name('stream.track');

Route::get('/api/tracks', function(){
    return Track::with('artist','album')->orderBy('artist_id')->orderBy('album_id')->orderBy('track_no')->get();
});
