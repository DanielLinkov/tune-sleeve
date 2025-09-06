<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Artist;
use App\Models\Album;

class Track extends Model
{
    protected $fillable = ['title','artist_id','album_id','track_no','disk_no','year','duration','genre','format','bitrate','path','filesize'];
    public $timestamps = false;
    public function artist(){ return $this->belongsTo(Artist::class); }
    public function album(){ return $this->belongsTo(Album::class); }
}
