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
            Storage::disk('covers')->delete(Storage::disk('covers')->allFiles());
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
                $this->line("• Skipping (exists) " . basename($path));
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
            $year   = isset($info['comments_html']['date'][0]) ? intval(substr($info['comments_html']['date'][0], 0, 4)) : null;
            $trackNo = isset($info['comments_html']['track_number'][0]) ? intval(preg_replace('/\/.*/', '', $info['comments_html']['track_number'][0])) : null;
            $diskNo = isset($info['comments_html']['part_of_a_set'][0]) ? intval(preg_replace('/\/.*/', '', $info['comments_html']['part_of_a_set'][0])) : null;
            if ($diskNo === NULL && isset($info['comments_html']['discnumber'][0])) {
                $diskNo = intval(preg_replace('/\/.*/', '', $info['comments_html']['discnumber'][0]));
            }
            $duration = isset($info['playtime_seconds']) ? intval(round($info['playtime_seconds'])) : null;
            $genre  = $info['comments_html']['genre'][0]  ?? 'Unknown Genre';
            $genre  = html_entity_decode($genre, ENT_QUOTES | ENT_HTML5);
            $format   = $info['fileformat'] ?? null;
            $bitrate  = isset($info['bitrate']) ? intval($info['bitrate']) : null;
            $filesize = filesize($path);
            $album_path = dirname($rel);
            $musicbrainz_trackid = $info['comments_html']['musicbrainz_trackid'][0] ?? null;
            $musicbrainz_artistid = $info['comments_html']['musicbrainz_artistid'][0] ?? null;
            $musicbrainz_albumid = $info['comments_html']['musicbrainz_albumid'][0] ?? null;
            if(!$musicbrainz_albumid && isset($info['comments_html']['text']['MusicBrainz Album Id'])) {
                $musicbrainz_albumid = $info['comments_html']['text']['MusicBrainz Album Id'];
            }

            $artistModel = null;
            $albumModel = null;
            if ($musicbrainz_artistid !== NULL)
                $artistModel = Artist::firstOrCreate(
                    ['musicbrainz_artistid' => $musicbrainz_artistid],
                    ['name' => $artist],
                );
            if (!$artistModel || !$artistModel->exists)
                $artistModel = Artist::firstOrCreate(['name' => $artist],[
                    'musicbrainz_artistid' => $musicbrainz_artistid
                ]);

            if ($musicbrainz_albumid !== NULL)
                $albumModel = Album::firstOrCreate(
                    ['musicbrainz_albumid' => $musicbrainz_albumid],
                    ['title' => $album, 'artist_id' => $artistModel->id, 'year' => $year, 'path' => $album_path],
                );
            if (!$albumModel || !$albumModel->exists)
                $albumModel  = Album::firstOrCreate([
                    'path' => $album_path
                ], [
                    'title' => $album,
                    'artist_id' => $artistModel->id,
                    'musicbrainz_albumid' => $musicbrainz_albumid,
                    'year' => $year,
                ]);
            if (!$albumModel->cover_path) {
                $albumModel->cover_path = $this->findAlbumCover($album_path, $albumModel->id);
                $albumModel->save();
            }

            Track::updateOrCreate(
                ['path' => $rel],
                [
                    'musicbrainz_trackid' => $musicbrainz_trackid,
                    'title'    => $title,
                    'artist_id' => $artistModel->id,
                    'album_id' => $albumModel->id,
                    'track_no' => $trackNo,
                    'disk_no'  => $diskNo,
                    'year'     => $year,
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
    protected function findAlbumCover(string $albumPath, int $albumId): ?string
    {
        $possibleNames = ['cover.jpg', 'cover.png', 'folder.jpg', 'folder.png', 'album.jpg', 'album.png', 'front.jpg', 'front.png', '*.jpg', '*.png'];
        $fileList = [];
        $cwd = getcwd();
        if (is_dir($albumPath)) {
            chdir($albumPath);
            foreach ($possibleNames as $pattern) {
                $fileList = array_merge($fileList, glob($pattern));
            }
            chdir($cwd);
        }
        // Remove duplicates
        $fileList = array_unique($fileList);
        if (empty($fileList)) {
            return null;
        }
        // Prioritize specific names
        usort($fileList, function ($a, $b) use ($possibleNames) {
            $aName = strtolower($a);
            $bName = strtolower($b);
            $aIndex = array_search($aName, $possibleNames);
            $bIndex = array_search($bName, $possibleNames);
            $aIndex = $aIndex === false ? count($possibleNames) : $aIndex;
            $bIndex = $bIndex === false ? count($possibleNames) : $bIndex;
            return $aIndex <=> $bIndex;
        });
        foreach ($fileList as $name) {
            $fullPath = $albumPath . DIRECTORY_SEPARATOR . $name;
            if (file_exists($fullPath) && is_file($fullPath) && filesize($fullPath) > 1000) {
                // Store in covers directory
                $ext = pathinfo($fullPath, PATHINFO_EXTENSION);
                $hash = substr(sha1($albumId . $fullPath), 0, 16);
                $coverPath = "{$hash}.{$ext}";
                Storage::disk('covers')->put($coverPath, file_get_contents($fullPath));
                return $coverPath;
            }
        }
        return null;
    }
}
