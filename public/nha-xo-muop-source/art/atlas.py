"""Render each panel at its target density and pack into a 4096x4096 atlas.
Writes out/box_basecolor.png (sRGB) and out/atlas_layout.json (panel-mm -> atlas-px affines)."""
import json, subprocess, os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
SIZE = 4096
PAPER = (0xEF, 0xE7, 0xD4)

# name: (svg panel, px/mm, atlas x, atlas y, rotate90ccw, panel w mm, panel h mm)
PANELS = {
    "front":  ("front", 25.6, 0, 0, False, 120, 84),
    "right":  ("side", 20.48, 3072, 0, False, 50, 84),
    "bottom": ("bottom", 1024 / 120, 3072, 1730, False, 120, 50),
    "back":   ("back", 20.48, 0, 2176, False, 120, 84),
    "top":    ("top", 11.5, 2470, 2176, True, 120, 50),
    "left":   ("side", 20.48, 3072, 2176, False, 50, 84),
}

atlas = Image.new("RGB", (SIZE, SIZE), PAPER)
layout = {"size": SIZE, "panels": {}}
for name, (svg, ppmm, ax, ay, rot, wmm, hmm) in PANELS.items():
    png = os.path.join(OUT, f"panel_{name}.png")
    subprocess.run(["node", os.path.join(HERE, "render.js"), svg, str(ppmm), png], check=True)
    im = Image.open(png).convert("RGB")
    W, H = im.size
    if rot:
        im = im.transpose(Image.ROTATE_90)  # (x,y) -> (y, W-1-x)
        # atlas_x = ax + py*s ; atlas_y = ay + W - px*s
        aff = [[0.0, ppmm, ax], [-ppmm, 0.0, ay + W]]
    else:
        aff = [[ppmm, 0.0, ax], [0.0, ppmm, ay]]
    atlas.paste(im, (ax, ay))
    layout["panels"][name] = {"affine": aff, "w_mm": wmm, "h_mm": hmm, "px_per_mm": ppmm,
                              "rect_px": [ax, ay, ax + im.size[0], ay + im.size[1]]}
    print(name, im.size, "at", (ax, ay))

# subtle paper mottling (low-frequency) + faint fibre grain, applied everywhere (ink included)
rng = np.random.default_rng(11)
a = np.asarray(atlas).astype(np.float32)


def smooth_noise(shape, cell):
    h, w = shape
    g = rng.standard_normal((h // cell + 3, w // cell + 3)).astype(np.float32)
    img = Image.fromarray(g).resize((w + 3 * cell, h + 3 * cell), Image.BICUBIC)
    return np.array(img)[cell:cell + h, cell:cell + w]


n = 0.6 * smooth_noise((SIZE, SIZE), 256) + 0.4 * smooth_noise((SIZE, SIZE), 48)
n /= n.std()
fib = smooth_noise((SIZE, SIZE), 3)
fib /= fib.std()
lum = 1.0 + 0.0045 * n + 0.004 * fib
a *= lum[..., None]
a = np.clip(a, 0, 255).astype(np.uint8)
Image.fromarray(a).save(os.path.join(OUT, "box_basecolor.png"), optimize=True)
with open(os.path.join(OUT, "atlas_layout.json"), "w") as fh:
    json.dump(layout, fh, indent=1)
print("atlas written")
