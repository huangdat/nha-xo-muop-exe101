"""Encode generated maps to the web JPEGs embedded in the GLB."""
import numpy as np
from PIL import Image, ImageFile
ImageFile.MAXBLOCK = 2 ** 26
D = "/home/claude/work/tex/out/"


def normal_resize(src, size, dst, q):
    n = np.asarray(Image.open(src).convert("RGB")).astype(np.float32) / 255 * 2 - 1
    ch = [np.asarray(Image.fromarray(n[..., i]).resize(size, Image.LANCZOS)) for i in range(3)]
    v = np.stack(ch, -1)
    v /= np.linalg.norm(v, axis=-1, keepdims=True)
    Image.fromarray(np.rint((v * 0.5 + 0.5) * 255).astype(np.uint8)).save(dst, quality=q, subsampling=0)


Image.open(D + "loofah_basecolor.png").convert("RGB").resize((1536, 1024), Image.LANCZOS).save(D + "loofah_basecolor.jpg", quality=88)
normal_resize(D + "loofah_normal.png", (1280, 848), D + "loofah_normal.jpg", 88)
Image.open(D + "loofah_orm.png").convert("RGB").resize((768, 512), Image.LANCZOS).save(D + "loofah_orm.jpg", quality=90, subsampling=0)
normal_resize(D + "paper_normal.png", (512, 512), D + "paper_normal.jpg", 90)
Image.open("/home/claude/work/art/out/box_basecolor.png").convert("RGB").save(D + "box_basecolor.jpg", quality=90, subsampling=2)
print("encoded")
