"""Tileable paper-tooth normal map (1024^2, one tile = 20 mm). OpenGL/glTF convention."""
import numpy as np
from PIL import Image
N = 1024
rng = np.random.default_rng(5)
fy, fx = np.meshgrid(np.fft.fftfreq(N), np.fft.fftfreq(N), indexing="ij")
f = np.sqrt(fx**2 + fy**2) + 1e-6
def band(lo, hi, aniso=1.0, angle=0.0):
    c, s = np.cos(angle), np.sin(angle)
    u = (fx * c + fy * s) * aniso
    v = (-fx * s + fy * c)
    ff = np.sqrt(u**2 + v**2) + 1e-6
    spec = (rng.standard_normal((N, N)) + 1j * rng.standard_normal((N, N))) * np.exp(-((np.log(ff) - np.log((lo*hi)**0.5)) / np.log(hi/lo))**2 * 4)
    h = np.real(np.fft.ifft2(spec))
    return h / h.std()
h = 0.55 * band(0.08, 0.35) + 0.30 * band(0.02, 0.08) + 0.25 * band(0.03, 0.2, aniso=4.0, angle=0.6) + 0.2 * band(0.03, 0.2, aniso=4.0, angle=2.1)
h *= 0.006   # mm-ish amplitude at 51 px/mm
px = 20.0 / N
gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) / (2 * px)
gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) / (2 * px)
nx, ny, nz = -gx, gy, np.ones_like(h)
n = np.sqrt(nx**2 + ny**2 + nz**2)
img = np.stack([nx/n, ny/n, nz/n], -1) * 0.5 + 0.5
Image.fromarray(np.rint(img * 255).astype(np.uint8)).save("out/paper_normal.png")
print("paper normal tilt deg (p99):", np.degrees(np.arccos(np.percentile(nz/n, 1))))
