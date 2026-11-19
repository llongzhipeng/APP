"""Pre-generate MP3 audio for every word in src/words.js using Microsoft Edge
Read-Aloud voices (Yunyang for Chinese, Guy for English).

Files use ASCII-safe numeric filenames (zh-001.mp3 etc.) mapped via
public/audio/manifest.json to avoid URL-encoding issues on any server.
"""
import asyncio
import hashlib
import json
import re
import urllib.parse
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
WORDS_JS = ROOT / "src" / "words.js"
OUT_DIR = ROOT / "public" / "audio"
OUT_ZH = OUT_DIR / "zh"
OUT_EN = OUT_DIR / "en"
OUT_ZH.mkdir(parents=True, exist_ok=True)
OUT_EN.mkdir(parents=True, exist_ok=True)
MANIFEST = OUT_DIR / "manifest.json"

VOICE_ZH = "zh-CN-YunyangNeural"
VOICE_EN = "en-US-GuyNeural"
RATE = "-8%"


def parse_words():
    text = WORDS_JS.read_text(encoding="utf-8")
    zh_part = text.split("en:")[0].split("zh:")[1]
    en_part = text.split("en:")[1].split("}\n  }")[0] if "}\n  }" in text else text.split("en:")[1]
    zh_arrays = re.findall(r"([a-z]+):\s*\[([^\]]+)\]", zh_part)
    en_arrays = re.findall(r"([a-z]+):\s*\[([^\]]+)\]", en_part)
    def flatten(arrays):
        out = []
        seen = set()
        for _, arr in arrays:
            for w in re.findall(r"'([^']+)'", arr):
                if w not in seen:
                    seen.add(w)
                    out.append(w)
        return out
    return flatten(zh_arrays), flatten(en_arrays)


def ascii_name_for(word: str, lang: str) -> str:
    # Stable ASCII name based on md5 — same word always maps to same file
    h = hashlib.md5(word.encode("utf-8")).hexdigest()[:12]
    return f"{lang}-{h}.mp3"


async def synth(voice: str, text: str, out_file: Path):
    if out_file.exists() and out_file.stat().st_size > 512:
        return "skip"
    tts = edge_tts.Communicate(text, voice, rate=RATE)
    await tts.save(str(out_file))
    return "ok"


async def main():
    zh_words, en_words = parse_words()
    print(f"ZH: {len(zh_words)} words, EN: {len(en_words)} words")

    manifest = {"zh": {}, "en": {}}

    print(f"\n== Chinese ({VOICE_ZH}) ==")
    for w in zh_words:
        fname = ascii_name_for(w, "zh")
        manifest["zh"][w] = fname
        try:
            status = await synth(VOICE_ZH, w, OUT_ZH / fname)
            print(f"  {status:4s} {w:8s} → {fname}")
        except Exception as e:
            print(f"  FAIL {w}: {e}")

    print(f"\n== English ({VOICE_EN}) ==")
    for w in en_words:
        fname = ascii_name_for(w, "en")
        manifest["en"][w] = fname
        try:
            status = await synth(VOICE_EN, w, OUT_EN / fname)
            print(f"  {status:4s} {w:10s} → {fname}")
        except Exception as e:
            print(f"  FAIL {w}: {e}")

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nManifest: {MANIFEST.relative_to(ROOT)}")
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
