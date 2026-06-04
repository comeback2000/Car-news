import json
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


def font(name, size):
    candidates = [
        Path("C:/Windows/Fonts") / name,
        Path("C:/Windows/Fonts/arialbd.ttf"),
        Path("C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def cover_image(source, size):
    width, height = size
    if source and Path(source).exists():
        image = Image.open(source).convert("RGB")
    else:
        image = Image.new("RGB", size, (12, 16, 24))
        draw = ImageDraw.Draw(image)
        for y in range(height):
            r = int(18 + 45 * y / height)
            g = int(22 + 22 * y / height)
            b = int(35 + 55 * y / height)
            draw.line([(0, y), (width, y)], fill=(r, g, b))
        for x in range(-200, width, 260):
            draw.polygon([(x, 0), (x + 120, 0), (x + 520, height), (x + 360, height)], fill=(35, 42, 58))

    ratio = max(width / image.width, height / image.height)
    resized = image.resize((int(image.width * ratio), int(image.height * ratio)), Image.LANCZOS)
    left = (resized.width - width) // 2
    top = (resized.height - height) // 2
    return resized.crop((left, top, left + width, top + height)).filter(ImageFilter.UnsharpMask(radius=1.5, percent=110))


def wrap(draw, text, font_obj, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=font_obj)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:4]


def main():
    payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8-sig"))
    output = Path(payload["outputFile"])
    output.parent.mkdir(parents=True, exist_ok=True)

    width, height = 1600, 900
    seed = int.from_bytes(payload["slug"].encode("utf-8"), "little") % 10_000
    random.seed(seed)

    base = cover_image(payload.get("sourceFile"), (width, height)).convert("RGBA")
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    palettes = [
        ((255, 204, 0), (229, 22, 39), (8, 13, 23)),
        ((0, 216, 173), (255, 74, 36), (10, 17, 28)),
        ((255, 255, 255), (0, 128, 255), (11, 18, 31)),
        ((255, 177, 0), (0, 190, 110), (14, 18, 26)),
    ]
    accent, hot, dark = palettes[seed % len(palettes)]

    for x in range(width):
        alpha = int(215 * max(0, 1 - x / 1150))
        draw.line([(x, 0), (x, height)], fill=(*dark, alpha))
    draw.polygon([(0, 0), (760, 0), (610, height), (0, height)], fill=(*dark, 185))
    draw.polygon([(0, 695), (width, 760 + seed % 70), (width, height), (0, height)], fill=(*hot, 190))
    draw.polygon([(0, 735), (width, 790 + seed % 50), (width, 825), (0, 765)], fill=(*accent, 215))

    draw.line([(42, 56), (1080, 56)], fill=(*accent, 255), width=7)
    draw.line([(42, 56), (42, 815)], fill=(*accent, 255), width=7)

    cx, cy = 1320 + seed % 120, 150 + seed % 80
    for radius, line_width in [(88, 8), (58, 6), (31, 5)]:
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), outline=(*accent, 235), width=line_width)
    draw.line([(cx - 115, cy), (cx + 115, cy)], fill=(255, 255, 255, 120), width=3)
    draw.line([(cx, cy - 115), (cx, cy + 115)], fill=(255, 255, 255, 120), width=3)

    bold_small = font("arialbd.ttf", 34)
    headline_font = font("arialbd.ttf", 78)
    deck_font = font("arialbd.ttf", 31)
    credit_font = font("arial.ttf", 29)

    draw.rounded_rectangle((62, 92, 500, 143), radius=10, fill=(*accent, 255))
    draw.text((82, 102), payload.get("deck", "CAR NEWS")[:22], fill=(5, 8, 13), font=bold_small)

    lines = wrap(draw, payload["headline"], headline_font, 670)
    y = 210
    for line in lines:
        draw.text((62, y), line, font=headline_font, fill=(255, 255, 255, 255), stroke_width=4, stroke_fill=(0, 0, 0, 210))
        y += 86

    draw.rounded_rectangle((62, 540, 660, 604), radius=12, fill=(*hot, 232))
    draw.text((84, 557), "Fresh India auto update", fill=(255, 255, 255, 255), font=deck_font)

    chips = ["SEO ready", "No duplicate", "Daily drop"]
    x = 62
    for chip in chips:
        chip_width = draw.textbbox((0, 0), chip, font=bold_small)[2] + 34
        draw.rounded_rectangle((x, 632, x + chip_width, 684), radius=10, fill=(255, 255, 255, 238))
        draw.text((x + 17, 644), chip, fill=(5, 8, 13), font=bold_small)
        x += chip_width + 18

    draw.text((62, 824), "Car News original thumbnail | generated for this article only", fill=(255, 255, 255, 218), font=credit_font)
    final = Image.alpha_composite(base, overlay).convert("RGB")
    final.save(output, "JPEG", quality=92, optimize=True, progressive=True)


if __name__ == "__main__":
    main()
