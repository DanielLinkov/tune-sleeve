<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Album;
use App\Models\Track;

class Artist extends Model
{
    protected $fillable = ['name','musicbrainz_artistid'];
    public $timestamps = false;
    public function albums(){ return $this->hasMany(Album::class); }
    public function tracks(){ return $this->hasMany(Track::class); }
}
