<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Playlist;
use App\Models\Track;

class PlaylistTrack extends Model
{
    protected $table = 'playlist_track';
    protected $fillable = ['playlist_id', 'track_id', 'position'];

    public function playlist() { return $this->belongsTo(Playlist::class); }
    public function track() { return $this->belongsTo(Track::class); }
    public $timestamps = false;
}
