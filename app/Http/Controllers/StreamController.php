<?php
// app/Http/Controllers/StreamController.php
namespace App\Http\Controllers;

use App\Models\Track;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StreamController extends Controller
{
    public function audio(Request $request, Track $track)
    {
        $path = $track->path;
        if (!is_file($path)) abort(404);

        $size  = filesize($path);
        $start = 0;
        $end   = $size - 1;

        $headers = [
            'Content-Type'  => $this->mimeFromExt($track->format),
            'Accept-Ranges' => 'bytes',
            'Cache-Control' => 'private, max-age=0, no-cache',
        ];

        if ($range = $request->headers->get('Range')) {
            if (preg_match('/bytes=(\d+)-(\d*)/', $range, $m)) {
                $start = intval($m[1]);
                if ($m[2] !== '') $end = intval($m[2]);
                if ($end >= $size) $end = $size - 1;
                $length = $end - $start + 1;

                $headers['Content-Range'] = "bytes $start-$end/$size";
                $headers['Content-Length'] = $length;

                return new StreamedResponse(function() use ($path, $start, $length) {
                    $fp = fopen($path, 'rb');
                    fseek($fp, $start);
                    $bytesLeft = $length;
                    $chunk = 8192;
                    while ($bytesLeft > 0 && !feof($fp)) {
                        $read = ($bytesLeft > $chunk) ? $chunk : $bytesLeft;
                        echo fread($fp, $read);
                        $bytesLeft -= $read;
                        @ob_flush(); flush();
                    }
                    fclose($fp);
                }, 206, $headers);
            }
        }

        $headers['Content-Length'] = $size;
        return new StreamedResponse(function() use ($path) {
            $fp = fopen($path, 'rb');
            fpassthru($fp);
            fclose($fp);
        }, 200, $headers);
    }

    private function mimeFromExt(?string $ext): string {
        return match (strtolower((string) $ext)) {
            'mp3','mpeg' => 'audio/mpeg',
            'flac' => 'audio/flac',
            'ogg','oga' => 'audio/ogg',
            'm4a','mp4','aac' => 'audio/mp4',
            'wav' => 'audio/wav',
            default => 'application/octet-stream',
        };
    }
}
