import json
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


def cover_crop(image, size, x_bias=0.5, y_bias=0.5):
    width, height = size
    ratio = max(width / image.width, height / image.height)
    resized = image.resize((int(image.width * ratio), int(image.height * ratio)), Image.LANCZOS)
    max_left = max(0, resized.width - width)
    max_top = max(0, resized.height - height)
    left = int(max_left * x_bias)
    top = int(max_top * y_bias)
    return resized.crop((left, top, left + width, top + height)).filter(
        ImageFilter.UnsharpMask(radius=1.3, percent=105)
    )


def load_real_source(source_file):
    source = Path(source_file)
    if not source.exists():
        raise FileNotFoundError(f"Real vehicle image source not found: {source}")
    return Image.open(source).convert("RGB")


def build_background(payload, size):
    source_files = payload.get("sourceFiles") or []
    if not source_files and payload.get("sourceFile"):
        source_files = [payload["sourceFile"]]
    source_files = [item for item in source_files if item]
    if not source_files:
        raise ValueError("At least one real manufacturer vehicle image is required.")

    width, height = size
    if len(source_files) == 1:
        return cover_crop(load_real_source(source_files[0]), size, 0.52, 0.54).convert("RGBA")

    canvas = Image.new("RGBA", size, (8, 11, 16, 255))
    split = width // 2
    left = cover_crop(load_real_source(source_files[0]), (split + 80, height), 0.48, 0.55)
    right = cover_crop(load_real_source(source_files[1]), (width - split + 80, height), 0.55, 0.55)
    canvas.paste(left.convert("RGBA"), (0, 0))
    canvas.paste(right.convert("RGBA"), (split - 80, 0))

    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon([(split - 125, 0), (split + 25, 0), (split - 25, height), (split - 175, height)], fill=210)
    divider = Image.new("RGBA", size, (255, 255, 255, 0))
    divider_draw = ImageDraw.Draw(divider)
    divider_draw.polygon(
        [(split - 112, 0), (split + 18, 0), (split - 38, height), (split - 168, height)],
        fill=(5, 9, 16, 145),
    )
    canvas = Image.alpha_composite(canvas, divider)
    return canvas


def wrap(draw, text, font_obj, max_width, max_lines=4):
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
    return lines[:max_lines]


def draw_bottom_gradient(draw, width, height):
    for y in range(height):
        vertical = y / height
        alpha = int(40 + 210 * max(0, (vertical - 0.24) / 0.76))
        draw.line([(0, y), (width, y)], fill=(4, 7, 12, alpha))
    for x in range(width):
        alpha = int(190 * max(0, 1 - x / 1180))
        draw.line([(x, 0), (x, height)], fill=(4, 7, 12, alpha))


def main():
    payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8-sig"))
    output = Path(payload["outputFile"])
    output.parent.mkdir(parents=True, exist_ok=True)

    width, height = 1600, 900
    base = build_background(payload, (width, height)).convert("RGBA")
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    draw_bottom_gradient(draw, width, height)

    accent = tuple(payload.get("accentColor") or (255, 204, 0))
    brand = str(payload.get("deck") or "CAR NEWS").upper()[:24]
    headline = str(payload.get("headline") or payload.get("keyword") or "CAR NEWS").upper()
    label = str(payload.get("sourceLabel") or "Official manufacturer vehicle image")

    brand_font = font("arialbd.ttf", 33)
    headline_font = font("arialbd.ttf", 72)
    label_font = font("arial.ttf", 28)
    credit_font = font("arial.ttf", 24)

    draw.rectangle((0, 0, width, height), outline=(*accent, 235), width=8)
    draw.rounded_rectangle((70, 70, 520, 124), radius=9, fill=(*accent, 245))
    draw.text((92, 83), brand, fill=(7, 10, 16), font=brand_font)

    lines = wrap(draw, headline, headline_font, 820, max_lines=4)
    x, y = 72, 520 - (len(lines) - 2) * 44
    for line in lines:
        draw.text(
            (x, y),
            line,
            font=headline_font,
            fill=(255, 255, 255, 255),
            stroke_width=4,
            stroke_fill=(0, 0, 0, 215),
        )
        y += 82

    draw.rounded_rectangle((72, 760, 900, 815), radius=10, fill=(5, 9, 16, 210), outline=(255, 255, 255, 70), width=1)
    draw.text((94, 773), label[:62], fill=(255, 255, 255, 232), font=label_font)
    draw.text((72, 842), "Car News thumbnail using real brand/model imagery", fill=(255, 255, 255, 210), font=credit_font)

    final = Image.alpha_composite(base, overlay).convert("RGB")
    final.save(output, "JPEG", quality=92, optimize=True, progressive=True)


if __name__ == "__main__":
    main()
