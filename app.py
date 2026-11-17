import os, re, tempfile, shutil
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp

app = FastAPI(title="TikTok Video Downloader")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=False,
    allow_methods=["GET"], allow_headers=["*"]
)
BASE = Path(__file__).parent
app.mount("/static", StaticFiles(directory=BASE / "static"), name="static")

def valid_tiktok(value: str) -> bool:
    return bool(re.match(r"^https?://([a-z0-9-]+\.)*tiktok\.com(/|$)", value.strip(), re.I))

@app.get("/", response_class=HTMLResponse)
def home():
    return (BASE / "static" / "index.html").read_text(encoding="utf-8")

@app.get("/api/info")
def info(url: str):
    if not valid_tiktok(url):
        raise HTTPException(400, "শুধু TikTok লিংক দিন")
    opts = {"quiet": True, "no_warnings": True, "noplaylist": True, "skip_download": True}
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            data = ydl.extract_info(url, download=False)
        formats = []
        for f in data.get("formats", []):
            if f.get("url") and f.get("vcodec") != "none":
                formats.append({
                    "format_id": f.get("format_id"),
                    "height": f.get("height") or 0,
                    "ext": f.get("ext") or "mp4",
                    "url": f.get("url")
                })
        formats.sort(key=lambda x: x["height"], reverse=True)
        if not formats and data.get("url"):
            formats = [{"format_id": "best", "height": data.get("height") or 0,
                        "ext": data.get("ext") or "mp4", "url": data["url"]}]
        return {"title": data.get("title") or "TikTok video",
                "thumbnail": data.get("thumbnail"), "formats": formats[:8]}
    except Exception as e:
        raise HTTPException(502, "এই ভিডিওটি এখন পাওয়া যাচ্ছে না। লিংকটি পাবলিক কি না পরীক্ষা করুন।")

@app.get("/health")
def health():
    return {"status": "ok"}
