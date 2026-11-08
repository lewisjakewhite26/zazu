"""
Build Google Play store graphics for Zazu.

    pip install pillow fonttools brotli
    python scripts/play-store/make_store_assets.py                  # icon + feature graphic
    python scripts/play-store/make_store_assets.py --shots DIR      # also frame phone screenshots
    python scripts/play-store/make_store_assets.py --app-icons      # also rebuild the app's own icons

Outputs go to scripts/play-store/out/:
  icon-512.png            512x512 app icon (Play's hi-res icon slot)
  feature-graphic.png     1024x500 feature graphic
  shot-NN.png             1080x1920 framed screenshots (9:16, inside Play's 2:1 limit)

Screenshots: take them on a real phone with
    adb exec-out screencap -p > 01-alarm.png
Name them NN-something.png. The caption comes from CAPTIONS below (by NN),
or from the file name if there's no entry.
"""

import argparse
import io
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent / "out"
FONTS = ROOT / "landing" / "public" / "fonts"

INK = (44, 31, 46)
PAGE = (254, 252, 251)
PEACH = (253, 232, 216)
LILAC = (230, 222, 246)
GOLD = (201, 150, 58)
SUBTEXT = (110, 92, 112)

CAPTIONS = {
    "01": "Wake up to a new word",
    "02": "Learn where it comes from",
    "03": "One task, then you're up",
    "04": "Practise in the Word Gym",
    "05": "Every word you've learned, by day",
    "06": "Light at dawn, dark at dusk",
    "07": "Build a morning streak",
    "08": "Set it like any alarm",
}


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    """Load a .woff2 from the landing site's fonts as a Pillow font."""
    tt = TTFont(FONTS / name)
    tt.flavor = None
    buf = io.BytesIO()
    tt.save(buf)
    buf.seek(0)
    return ImageFont.truetype(buf, size)


def gradient(size, top, bottom) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size, top)
    px = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(h - 1, 1)
        c = tuple(round(a + (b - a) * t) for a, b in zip(top, bottom))
        px.line([(0, y), (w, y)], fill=c)
    return img


IMAGES = ROOT / "mobile" / "assets" / "images"


def mark_on(size, mark_h_frac, bg=None, colour=None):
    """The Zazu mark centred on a square canvas, mark_h_frac of its height."""
    mark = Image.open(IMAGES / "zazu-mark.png").convert("RGBA")
    mh = round(size * mark_h_frac)
    mark = mark.resize((round(mark.width * mh / mark.height), mh), Image.LANCZOS)
    if colour is not None:
        solid = Image.new("RGBA", mark.size, colour + (255,))
        solid.putalpha(mark.getchannel("A"))
        mark = solid
    canvas = Image.new("RGBA", (size, size), (bg + (255,)) if bg else (0, 0, 0, 0))
    canvas.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
    return canvas


def make_app_icons():
    """Replace Expo's placeholder launcher, adaptive, monochrome and splash icons.

    Adaptive icon layers are 108dp with a 66dp safe circle, so the mark is kept
    to 46% of the canvas height to stay inside it on round launcher masks.
    """
    mark_on(1024, 0.56, bg=PEACH).convert("RGB").save(IMAGES / "icon.png", optimize=True)
    mark_on(512, 0.46).save(IMAGES / "android-icon-foreground.png", optimize=True)
    Image.new("RGBA", (512, 512), PEACH + (255,)).save(IMAGES / "android-icon-background.png", optimize=True)
    mark_on(432, 0.46, colour=(0, 0, 0)).save(IMAGES / "android-icon-monochrome.png", optimize=True)
    mark_on(1024, 0.42).save(IMAGES / "splash-icon.png", optimize=True)
    mark_on(48, 0.8).save(IMAGES / "favicon.png", optimize=True)


def make_icon():
    src = Image.open(IMAGES / "icon.png").convert("RGB")
    src.resize((512, 512), Image.LANCZOS).save(OUT / "icon-512.png", optimize=True)


def make_feature_graphic():
    W, H = 1024, 500
    img = gradient((W, H), PEACH, LILAC)
    d = ImageDraw.Draw(img)

    mark = Image.open(ROOT / "mobile" / "assets" / "images" / "zazu-mark.png").convert("RGBA")
    mh = 300
    mark = mark.resize((round(mark.width * mh / mark.height), mh), Image.LANCZOS)
    glow = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = 210, H // 2
    gd.ellipse([cx - 190, cy - 190, cx + 190, cy + 190], fill=(255, 255, 255, 150))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img = Image.alpha_composite(img.convert("RGBA"), glow)
    img.alpha_composite(mark, (cx - mark.width // 2, cy - mark.height // 2))

    d = ImageDraw.Draw(img)
    x = 420
    d.text((x, 118), "zazu", font=font("Boska-Medium.woff2", 128), fill=INK)
    d.text((x, 270), "A new word.", font=font("Boska-Regular.woff2", 50), fill=INK)
    d.text((x, 326), "Every morning.", font=font("Boska-Italic.woff2", 50), fill=INK)
    d.text((x, 408), "The vocabulary alarm clock", font=font("Satoshi-Medium.woff2", 26), fill=SUBTEXT)

    img.convert("RGB").save(OUT / "feature-graphic.png", optimize=True)


def rounded(im: Image.Image, r: int) -> Image.Image:
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1], r, fill=255)
    out = im.convert("RGBA")
    out.putalpha(mask)
    return out


def wrap(d, text, f, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if d.textlength(trial, font=f) <= max_w:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def frame_shot(path: Path, n: int):
    W, H = 1080, 1920
    key = path.stem[:2]
    caption = CAPTIONS.get(key) or path.stem[3:].replace("-", " ").capitalize()
    dark = "dark" in path.stem
    top, bottom = ((44, 34, 66), (24, 19, 38)) if dark else (PEACH, LILAC)
    fg = (240, 232, 248) if dark else INK

    canvas = gradient((W, H), top, bottom).convert("RGBA")
    d = ImageDraw.Draw(canvas)
    f = font("Boska-Medium.woff2", 76)
    lines = wrap(d, caption, f, W - 160)
    y = 110
    for line in lines:
        tw = d.textlength(line, font=f)
        d.text(((W - tw) / 2, y), line, font=f, fill=fg)
        y += 92

    shot = Image.open(path).convert("RGB")
    area_top = y + 60
    max_h = H - area_top - 70
    max_w = W - 200
    scale = min(max_h / shot.height, max_w / shot.width)
    shot = shot.resize((round(shot.width * scale), round(shot.height * scale)), Image.LANCZOS)
    shot = rounded(shot, 44)

    sx = (W - shot.width) // 2
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [sx, area_top + 18, sx + shot.width, area_top + 18 + shot.height], 44, fill=(0, 0, 0, 70)
    )
    canvas = Image.alpha_composite(canvas, shadow.filter(ImageFilter.GaussianBlur(28)))
    canvas.alpha_composite(shot, (sx, area_top))
    canvas.convert("RGB").save(OUT / f"shot-{n:02d}.png", optimize=True)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--shots", type=Path, help="folder of raw phone screenshots (NN-name.png)")
    p.add_argument("--app-icons", action="store_true", help="regenerate mobile/assets/images icons from zazu-mark.png")
    a = p.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    if a.app_icons:
        make_app_icons()
        print("wrote app icons to", IMAGES)
    make_icon()
    make_feature_graphic()
    print("wrote", OUT / "icon-512.png")
    print("wrote", OUT / "feature-graphic.png")
    if a.shots:
        files = sorted(a.shots.glob("*.png"))
        if not files:
            sys.exit(f"no .png files in {a.shots}")
        for i, f in enumerate(files[:8], 1):
            frame_shot(f, i)
            print("wrote", OUT / f"shot-{i:02d}.png", "from", f.name)


if __name__ == "__main__":
    main()
