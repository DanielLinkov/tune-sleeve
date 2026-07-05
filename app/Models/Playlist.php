<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Track;

class Playlist extends Model
{
    protected $fillable = ['name'];

    public function tracks()
    {
        return $this->belongsToMany(Track::class, 'playlist_track')
            ->withPivot('position')
            ->orderByPivot('position');
    }

    public $timestamps = false;
}
