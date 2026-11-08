"""
Build Zazu social and ad graphics.

    pip install pillow fonttools brotli
    python scripts/marketing/make_marketing.py

Outputs go to scripts/marketing/out/:
  word-<word>-feed.png    1080x1350  Instagram/Facebook feed (4:5), word-of-the-day card
  word-<word>-story.png   1080x1920  Story / Reels / TikTok cover version
  hero-square.png         1080x1080  Phone + headline (feed, Meta ad, Google ad)
  hero-story.png          1080x1920  Phone + headline (Story / Reels cover)
  hero-landscape.png      1200x628   Landscape ad (Google display, Meta link ad, X card)
  gold-square.png         1080x1080  Gold coming-soon teaser

Words come from zazu-words.json, screenshots from scripts/marketing/src/
(real device captures). Copy for each graphic is in MARKETING.md.
"""

import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "play-store"))
from make_store_assets import font, gradient, rounded, wrap  # noqa: E402

OUT = HERE / "out"
SRC = HERE / "src"
MARK = ROOT / "mobile" / "assets" / "images" / "zazu-mark.png"

INK = (44, 31, 46)
SUB = (110, 92, 112)
GOLD = (201, 150, 58)
DAY = ((253, 232, 216), (221, 232, 248), (237, 224, 248))
NIGHT = ((40, 28, 56), (26, 24, 48), (14, 12, 26))
NIGHT_INK = (240, 232, 248)
NIGHT_SUB = (176, 160, 200)

WORDS = ["Mellifluous", "Petrichor", "Laconic", "Halcyon", "Penumbra"]
NIGHT_WORDS = {"Penumbra"}  # one dark card for variety in a grid


def three_stop(size, stops):
    w, h = size
    top = gradient((w, h // 2), stops[0], stops[1])
    bottom = gradient((w, h - h // 2), stops[1], stops[2])
    img = Image.new("RGB", size)
    img.paste(top, (0, 0))
    img.paste(bottom, (0, h // 2))
    return img.convert("RGBA")


def glow(img, cx, cy, r, colour, alpha):
    layer = Image.new("RGBA", img.size, colour + (0,))
    ImageDraw.Draw(layer).ellipse([cx - r, cy - r, cx + r, cy + r], fill=colour + (alpha,))
    return Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(r // 2)))


def brand(img, x, y, ink, size=44):
    mark = Image.open(MARK).convert("RGBA")
    mh = round(size * 1.25)
    mark = mark.resize((round(mark.width * mh / mark.height), mh), Image.LANCZOS)
    img.alpha_composite(mark, (x, y))
    ImageDraw.Draw(img).text(
        (x + mark.width + 12, y + mh // 2), "zazu", font=font("Boska-Medium.woff2", size), fill=ink, anchor="lm"
    )


def plain(html):
    return re.sub(r"<[^>]+>", "", html or "").strip()


def text_block(d, xy, text, f, fill, max_w, line_h):
    x, y = xy
    for line in wrap(d, text, f, max_w):
        d.text((x, y), line, font=f, fill=fill)
        y += line_h
    return y


def phone(path, height):
    shot = Image.open(path).convert("RGB")
    shot = shot.resize((round(shot.width * height / shot.height), height), Image.LANCZOS)
    return rounded(shot, round(height * 0.045))


def place_phone(img, shot, x, y):
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    r = round(shot.height * 0.045)
    ImageDraw.Draw(shadow).rounded_rectangle([x, y + 24, x + shot.width, y + 24 + shot.height], r, fill=(44, 31, 46, 60))
    img = Image.alpha_composite(img, shadow.filter(ImageFilter.GaussianBlur(34)))
    img.alpha_composite(shot, (x, y))
    return img


def word_card(entry, size, night=False):
    W, H = size
    stops, ink, sub = (NIGHT, NIGHT_INK, NIGHT_SUB) if night else (DAY, INK, SUB)
    img = three_stop(size, stops)
    img = glow(img, W // 2, int(H * 0.40), int(W * 0.45), GOLD if night else (255, 255, 255), 60 if night else 140)
    d = ImageDraw.Draw(img)
    pad = 96
    brand(img, pad, pad, ink)

    story = H > 1400
    top = int(H * (0.33 if story else 0.25))
    wf = font("Boska-Medium.woff2", 150 if len(entry["word"]) <= 9 else 124)
    d.text((pad - 6, top), entry["word"], font=wf, fill=ink)
    y = top + wf.size + 26
    d.text((pad, y), f"{entry['pronunciation']} · {entry['pos']}", font=font("Boska-Italic.woff2", 40), fill=sub)
    y += 92
    y = text_block(d, (pad, y), entry["definition"], font("Satoshi-Medium.woff2", 44), ink, W - 2 * pad, 60)
    y += 40
    d.line([(pad, y), (pad + 120, y)], fill=GOLD, width=3)
    y += 40
    text_block(d, (pad, y), plain(entry["origin"]), font("Satoshi-Regular.woff2", 34), sub, W - 2 * pad, 48)

    f = font("Boska-Regular.woff2", 40)
    d.text((pad, H - pad - 30), "A new word every morning.", font=f, fill=ink)
    return img.convert("RGB")


def hero_square():
    W = H = 1080
    img = three_stop((W, H), DAY)
    img = glow(img, 760, 560, 380, (255, 255, 255), 150)
    d = ImageDraw.Draw(img)
    brand(img, 80, 80, INK, 40)
    hf = font("Boska-Medium.woff2", 92)
    y = text_block(d, (80, 300), "Wake up to a new word.", hf, INK, 470, 104)
    text_block(d, (80, y + 30), "An alarm that teaches you one word before the day starts.",
               font("Satoshi-Medium.woff2", 34), SUB, 440, 48)
    d.text((80, H - 130), "Free on Google Play", font=font("Satoshi-Bold.woff2", 32), fill=INK)
    shot = phone(SRC / "alarm.png", 900)
    return place_phone(img, shot, 600, 110).convert("RGB")


def hero_story():
    W, H = 1080, 1920
    img = three_stop((W, H), DAY)
    img = glow(img, W // 2, 1150, 520, (255, 255, 255), 150)
    d = ImageDraw.Draw(img)
    brand(img, (W - 230) // 2, 130, INK, 48)
    hf = font("Boska-Medium.woff2", 104)
    for i, line in enumerate(["A new word", "every morning."]):
        f = hf if i == 0 else font("Boska-Italic.woff2", 104)
        d.text((W // 2, 330 + i * 118), line, font=f, fill=INK, anchor="mt")
    shot = phone(SRC / "alarm.png", 1120)
    img = place_phone(img, shot, (W - shot.width) // 2, 640)
    d = ImageDraw.Draw(img)
    d.text((W // 2, H - 110), "Free on Google Play", font=font("Satoshi-Bold.woff2", 36), fill=INK, anchor="mm")
    return img.convert("RGB")


def hero_landscape():
    W, H = 1200, 628
    img = three_stop((W, H), DAY)
    img = glow(img, 880, 330, 300, (255, 255, 255), 150)
    d = ImageDraw.Draw(img)
    brand(img, 64, 56, INK, 34)
    hf = font("Boska-Medium.woff2", 74)
    for i, line in enumerate(["Wake up to a", "new word."]):
        d.text((64, 170 + i * 84), line, font=hf, fill=INK)
    y = 170 + 2 * 84
    text_block(d, (64, y + 20), "The alarm clock that teaches you a word every morning.",
               font("Satoshi-Medium.woff2", 28), SUB, 560, 40)
    d.text((64, H - 80), "Free on Google Play", font=font("Satoshi-Bold.woff2", 26), fill=INK)
    shot = phone(SRC / "learn.png", 760)
    return place_phone(img, shot, 740, 40).convert("RGB")


def gold_square():
    W = H = 1080
    img = three_stop((W, H), NIGHT)
    img = glow(img, W // 2, 470, 360, GOLD, 90)
    d = ImageDraw.Draw(img)
    mark = Image.open(MARK).convert("RGBA")
    mark = mark.resize((round(mark.width * 230 / mark.height), 230), Image.LANCZOS)
    img.alpha_composite(mark, ((W - mark.width) // 2, 170))
    d = ImageDraw.Draw(img)
    d.text((W // 2, 470), "Zazu Gold", font=font("Boska-Medium.woff2", 110), fill=NIGHT_INK, anchor="mt")
    d.text((W // 2, 610), "Coming soon", font=font("Boska-Italic.woff2", 56), fill=GOLD, anchor="mt")
    lines = ["Ten themed word packs.", "1,741 more words.", "Every word you've learned, kept."]
    for i, line in enumerate(lines):
        d.text((W // 2, 740 + i * 56), line, font=font("Satoshi-Medium.woff2", 36), fill=NIGHT_SUB, anchor="mt")
    return img.convert("RGB")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    words = {w["word"]: w for w in json.loads((ROOT / "zazu-words.json").read_text(encoding="utf-8"))}
    made = []
    for name in WORDS:
        entry = words[name]
        night = name in NIGHT_WORDS
        slug = name.lower()
        word_card(entry, (1080, 1350), night).save(OUT / f"word-{slug}-feed.png", optimize=True)
        word_card(entry, (1080, 1920), night).save(OUT / f"word-{slug}-story.png", optimize=True)
        made += [f"word-{slug}-feed.png", f"word-{slug}-story.png"]
    for fn, name in [(hero_square, "hero-square"), (hero_story, "hero-story"),
                     (hero_landscape, "hero-landscape"), (gold_square, "gold-square")]:
        fn().save(OUT / f"{name}.png", optimize=True)
        made.append(f"{name}.png")
    for m in made:
        print("wrote", OUT / m)


if __name__ == "__main__":
    main()
