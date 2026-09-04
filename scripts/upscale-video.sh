#!/usr/bin/env bash
# Upscales the 720x960 reference demo to 1080x1440 (lanczos + light sharpen) so the
# modal player never shows a soft, stretched frame. Re-run when the owner drops in
# their own footage: ./scripts/upscale-video.sh path/to/source.mp4
# ponytail: lanczos upscale only, swap for Real-ESRGAN/Topaz if the owner wants true detail.
set -euo pipefail
SRC="${1:-public/video/laro-hunt-mat-demo-720.mp4}"
OUT="${2:-public/video/laro-hunt-mat-demo.mp4}"
ffmpeg -y -i "$SRC" \
  -vf "scale=1080:1440:flags=lanczos,unsharp=5:5:0.6:5:5:0.0,format=yuv420p" \
  -c:v libx264 -preset slow -crf 23 -maxrate 2600k -bufsize 5200k -profile:v high -level 4.1 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart "$OUT"
ffprobe -v error -show_entries stream=width,height,bit_rate -of default=nw=1 "$OUT"
ls -la "$OUT"
