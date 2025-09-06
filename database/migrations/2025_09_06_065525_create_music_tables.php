<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// database/migrations/xxxx_xx_xx_create_music_tables.php
return new class extends Migration {
    public function up(): void {
        Schema::create('artists', function (Blueprint $t) {
            $t->id();
            $t->string('name')->index();
        });

        Schema::create('albums', function (Blueprint $t) {
            $t->id();
            $t->string('title')->index();
            $t->foreignId('artist_id')->nullable();
            $t->integer('year')->nullable();
            $t->string('cover_path')->nullable(); // cached JPEG/PNG in storage
        });

        Schema::create('tracks', function (Blueprint $t) {
            $t->id();
            $t->string('title')->index();
            $t->foreignId('artist_id')->nullable();
            $t->foreignId('album_id')->nullable();
            $t->unsignedInteger('track_no')->nullable();
            $t->unsignedInteger('disk_no')->nullable();
            $t->unsignedInteger('duration')->nullable(); // seconds
            $t->string('genre', 64)->nullable();
            $t->string('format', 16)->nullable(); // mp3/flac/ogg
            $t->unsignedInteger('bitrate')->nullable();
            $t->string('path')->unique(); // absolute path
            $t->unsignedInteger('filesize')->nullable();
        });
    }
    public function down(): void {
        Schema::dropIfExists('tracks');
        Schema::dropIfExists('albums');
        Schema::dropIfExists('artists');
    }
};
