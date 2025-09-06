<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Finder\Finder;
use getID3;
use App\Models\{Artist, Album, Track};
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ScanMusic extends Command
{
    protected $signature = 'music:scan {--path=} {--force} {--purge}';
    protected $description = 'Scan filesystem for audio files and (re)index them. Use --path to specify a custom directory, --force to reindex existing files, and --purge to delete all existing entries before scanning.';

    public function handle(): int
    {
        $root = $this->option('path') ?: config('filesystems.disks.music.root');
        if (!is_dir($root)) {
            $this->error("Music dir not found: $root");
            return self::FAILURE;
        }

        if ($this->option('purge')) {
            Track::truncate();
            Album::truncate();
            Artist::truncate();
            $this->info('Purged all existing entries.');
        }

        $this->info("Scanning $root …");
        $finder = (new Finder())
            ->files()
            ->in($root)
            ->ignoreUnreadableDirs()
            ->name('/\.(mp3|flac|ogg|m4a|wav)$/i');

        $id3 = new getID3;

        foreach ($finder as $file) {
            $path = $file->getRealPath();
            $rel  = $path; // keep absolute for uniqueness

            // Skip if already indexed and not forcing
            if (!$this->option('force') && Track::where('path', $rel)->exists()) {
                $this->line("• Skipping (exists) ".basename($path));
                continue;
            }

            $info = $id3->analyze($path);
            \getid3_lib::CopyTagsToComments($info);

            $title  = $info['comments_html']['title'][0]  ?? pathinfo($path, PATHINFO_FILENAME);
            $title  = html_entity_decode($title, ENT_QUOTES | ENT_HTML5);
            $artist = $info['comments_html']['artist'][0] ?? 'Unknown Artist';
            $artist = html_entity_decode($artist, ENT_QUOTES | ENT_HTML5);
            $album  = $info['comments_html']['album'][0]  ?? 'Unknown Album';
            $album  = html_entity_decode($album, ENT_QUOTES | ENT_HTML5);
            $year   = isset($info['comments_html']['year'][0]) ? intval($info['comments_html']['year'][0]) : null;
            $trackNo= isset($info['comments_html']['track_number'][0]) ? intval(preg_replace('/\/.*/','',$info['comments_html']['track_number'][0])) : null;
            $diskNo = isset($info['comments_html']['part_of_a_set'][0]) ? intval(preg_replace('/\/.*/','',$info['comments_html']['part_of_a_set'][0])) : null;
            $duration = isset($info['playtime_seconds']) ? intval(round($info['playtime_seconds'])) : null;
            $genre  = $info['comments_html']['genre'][0]  ?? 'Unknown Genre';
            $genre  = html_entity_decode($genre, ENT_QUOTES | ENT_HTML5);
            $format   = $info['fileformat'] ?? null;
            $bitrate  = isset($info['bitrate']) ? intval($info['bitrate']) : null;
            $filesize = filesize($path);

            $artistModel = Artist::firstOrCreate(['name' => $artist]);
            $albumModel  = Album::firstOrCreate([
                'title' => $album,
                'artist_id' => $artistModel->id,
            ], ['year' => $year]);

            // Optional: extract cover to storage/app/covers/{hash}.jpg
            $coverPath = null;
            if (!empty($info['comments']['picture'][0]['data'])) {
                $img = $info['comments']['picture'][0];
                $hash = substr(sha1($album.$artist), 0, 16);
                $ext = Str::contains(($img['image_mime'] ?? ''), 'png') ? 'png' : 'jpg';
                $coverPath = "covers/{$hash}.{$ext}";
                Storage::disk('local')->put($coverPath, $img['data']);
                if (!$albumModel->cover_path) {
                    $albumModel->cover_path = $coverPath;
                    $albumModel->save();
                }
            }

            Track::updateOrCreate(
                ['path' => $rel],
                [
                    'title'    => $title,
                    'artist_id'=> $artistModel->id,
                    'album_id' => $albumModel->id,
                    'track_no' => $trackNo,
                    'disk_no'  => $diskNo,
                    'duration' => $duration,
                    'genre'    => $genre,
                    'format'   => $format,
                    'bitrate'  => $bitrate,
                    'filesize' => $filesize,
                ]
            );

            $this->line("✓ Indexed: {$artist} – {$title}");
        }

        $this->info('Done.');
        return self::SUCCESS;
    }
}
