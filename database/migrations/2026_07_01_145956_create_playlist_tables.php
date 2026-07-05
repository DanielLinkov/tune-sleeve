<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('playlists')) {
            Schema::create('playlists', function (Blueprint $table) {
                $table->id();
                $table->string('name');

                $table->unique('name');
            });
        }

        if (!Schema::hasTable('playlist_track')) {
            Schema::create('playlist_track', function (Blueprint $table) {
                $table->id();
                $table->foreignId('playlist_id')->constrained()->onDelete('cascade');
                $table->foreignId('track_id')->constrained()->onDelete('cascade');
                $table->integer('position')->default(0);

                $table->unique(['playlist_id', 'track_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('playlist_track');
        Schema::dropIfExists('playlists');
    }
};
