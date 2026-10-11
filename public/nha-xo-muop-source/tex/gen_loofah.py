"""Procedural loofah mat: curly fibres rasterised as swept spheres into a heightfield.

Physical frame (mm): x in [-W/2, W/2] -> image columns (left->right),
                     z in [-D/2, D/2] -> image rows (row 0 = back, z=-D/2; last row = front).
Height y in mm relative to the soap's top surface (0).
Outputs (./out): loofah_basecolor.png, loofah_normal.png (OpenGL/glTF, +Y = image up),
                 loofah_orm.png (R=AO, G=rough, B=metal), loofah_height_low.npy (mm, for geometry).
"""
import os, time
import numpy as np
from PIL import Image
from scipy import ndimage

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(20261010)

W_MM, D_MM = 70.0, 46.0
NX, NZ = 2048, 2048
sx, sz = NX / W_MM, NZ / D_MM            # px per mm along x / z
FLOOR = -2.5                              # pocket floor (mm)
EDGE = -0.8                               # envelope height at the mat boundary (mm)
TOP = 1.9                                 # dome crown above soap top (mm)

xs = (np.arange(NX) + 0.5) / sx - W_MM / 2
zs = (np.arange(NZ) + 0.5) / sz - D_MM / 2
X, Z = np.meshgrid(xs, zs)


def smoothstep(a, b, v):
    t = np.clip((v - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def dome(x, z):
    """Pillow-shaped envelope of the mat surface."""
    ex = 1 - smoothstep(0.86, 1.0, np.abs(x) / (W_MM / 2))
    ez = 1 - smoothstep(0.80, 1.0, np.abs(z) / (D_MM / 2))
    e = np.sqrt(ex * ez)
    crown = 1 - 0.10 * (x / (W_MM / 2)) ** 2 - 0.22 * (z / (D_MM / 2)) ** 2
    return EDGE + (TOP - EDGE) * e * crown


# ---------------------------------------------------------------- fibres
from scipy.spatial import Voronoi


def wavy_edge(p0, p1, d0, d1, r):
    """Fibre between two junctions: gentle lateral wave + depth sag (weaving)."""
    p0, p1 = np.asarray(p0), np.asarray(p1)
    L = np.linalg.norm(p1 - p0)
    step = r * 0.45
    n = max(int(L / step), 2)
    t = np.linspace(0, 1, n)
    d = (p1 - p0) / max(L, 1e-9)
    perp = np.array([-d[1], d[0]])
    amp = rng.uniform(0.05, 0.22) * min(L, 3.0)
    lat = amp * np.sin(np.pi * t) * np.sin(2 * np.pi * rng.uniform(0.5, 1.6) * t + rng.uniform(0, 6.3))
    lat += rng.uniform(0.01, 0.035) * np.sin(2 * np.pi * rng.uniform(2.0, 4.0) * t + rng.uniform(0, 6.3)) * np.sin(np.pi * t)
    pts = p0[None] + (p1 - p0)[None] * t[:, None] + perp[None] * lat[:, None]
    sag = rng.uniform(-0.35, 0.35) * np.sin(np.pi * t)
    depth = d0 + (d1 - d0) * t + sag
    return pts, np.clip(depth, 0, 3.6)


def make_fibres():
    fibres = []
    # --- cellular network layers (the characteristic loofah mesh)
    layers = [  # (depth, spacing mm, keep fraction, radius range)
        (0.15, 2.8, 0.90, (0.120, 0.170)),
        (0.55, 2.8, 0.85, (0.115, 0.165)),
        (0.95, 2.6, 0.90, (0.120, 0.175)),
        (1.35, 2.6, 0.88, (0.120, 0.175)),
        (1.80, 2.4, 0.92, (0.125, 0.180)),
        (2.30, 2.3, 0.95, (0.130, 0.185)),
    ]
    for depth, sp, keep, (r0, r1) in layers:
        gx = np.arange(-W_MM / 2 - 3, W_MM / 2 + 3, sp)
        gz = np.arange(-D_MM / 2 - 3, D_MM / 2 + 3, sp * 0.866)
        P = np.array([(x + (0.5 * sp if i % 2 else 0), z) for i, z in enumerate(gz) for x in gx])
        P += rng.normal(0, sp * 0.38, P.shape)
        vor = Voronoi(P)
        V = vor.vertices
        vdepth = depth + rng.normal(0, 0.28, len(V))
        for a, b in vor.ridge_vertices:
            if a < 0 or b < 0:
                continue
            pa, pb = V[a], V[b]
            if (np.abs(pa[0]) > W_MM / 2 + 2) or (np.abs(pa[1]) > D_MM / 2 + 2):
                continue
            if np.linalg.norm(pb - pa) > 5 or rng.random() > keep:
                continue
            r = rng.uniform(r0, r1)
            pts, dep = wavy_edge(pa, pb, vdepth[a], vdepth[b], r)
            fibres.append((pts, dep, r, int(np.clip(rng.normal(150, 45), 10, 255))))
    # --- free strands crossing the network (gently curved, some long)
    for count, (d0, d1), (r0, r1), (l0, l1) in [
        (110, (0.0, 1.0), (0.11, 0.16), (5, 14)),
        (90, (1.0, 2.6), (0.12, 0.17), (5, 14)),
        (25, (0.05, 0.9), (0.16, 0.21), (10, 22)),
    ]:
        for _ in range(count):
            L = rng.uniform(l0, l1)
            r = rng.uniform(r0, r1)
            step = r * 0.45
            n = int(L / step)
            p = np.array([rng.uniform(-W_MM / 2 - 2, W_MM / 2 + 2), rng.uniform(-D_MM / 2 - 2, D_MM / 2 + 2)])
            ang = rng.uniform(0, 2 * np.pi)
            kappa = 0.0
            curl = rng.uniform(0.25, 0.8)
            pts = np.empty((n, 2))
            for i in range(n):
                kappa += -kappa * step / 1.5 + curl * np.sqrt(step) * rng.standard_normal()
                ang += kappa * step
                p = p + step * np.array([np.cos(ang), np.sin(ang)])
                pts[i] = p
            s_ = np.arange(n) * step
            base = rng.uniform(d0, d1)
            depth = base + 0.35 * np.sin(2 * np.pi * s_ / rng.uniform(2.0, 4.5) + rng.uniform(0, 6.3))
            fibres.append((pts, np.clip(depth, 0, 3.6), r, int(np.clip(rng.normal(150, 45), 10, 255))))
    return fibres


t0 = time.time()
fibres = make_fibres()
print(f"{len(fibres)} fibres in {time.time()-t0:.1f}s")

# ---------------------------------------------------------------- rasterise (max-height with packed tint)
OFF = 10.0
key = np.full(NX * NZ, np.int64(round((FLOOR - 0.6 + OFF) * 1e5)) * 256 + 0, dtype=np.int64)
t0 = time.time()
batch = []


def flush(batch):
    P = np.concatenate([b[0] for b in batch])        # (m,2) mm
    YC = np.concatenate([b[1] for b in batch])       # centre heights
    R = np.concatenate([b[2] for b in batch])
    T = np.concatenate([b[3] for b in batch])
    rmax = R.max()
    wx, wz = int(np.ceil(rmax * sx)) + 1, int(np.ceil(rmax * sz)) + 1
    ox, oz = np.meshgrid(np.arange(-wx, wx + 1), np.arange(-wz, wz + 1))
    ox, oz = ox.ravel(), oz.ravel()
    cx = ((P[:, 0] + W_MM / 2) * sx - 0.5)
    cz = ((P[:, 1] + D_MM / 2) * sz - 0.5)
    ix = np.rint(cx).astype(np.int32)[:, None] + ox[None, :]
    iz = np.rint(cz).astype(np.int32)[:, None] + oz[None, :]
    dx = (ix - cx[:, None]) / sx
    dz = (iz - cz[:, None]) / sz
    d2 = dx * dx + dz * dz
    r2 = (R * R)[:, None]
    ok = (d2 < r2) & (ix >= 0) & (ix < NX) & (iz >= 0) & (iz < NZ)
    h = YC[:, None] + np.sqrt(np.maximum(r2 - d2, 0))
    k = (np.rint((h + OFF) * 1e5).astype(np.int64) * 256) + T[:, None]
    np.maximum.at(key, (iz * NX + ix)[ok], k[ok])


cnt = 0
for pts, depth, r, tint in fibres:
    env = dome(pts[:, 0], pts[:, 1])
    yc = env - depth - r
    yc = np.maximum(yc, FLOOR + r * 0.5)
    batch.append((pts, yc, np.full(len(pts), r), np.full(len(pts), tint, dtype=np.int64)))
    cnt += len(pts)
    if cnt > 30_000:
        flush(batch); batch = []; cnt = 0
if batch:
    flush(batch)
print(f"raster {time.time()-t0:.1f}s")

H = ((key // 256).astype(np.float64) / 1e5 - OFF).reshape(NZ, NX)
TINT = (key % 256).reshape(NZ, NX).astype(np.float32) / 255.0
is_floor = H < FLOOR - 0.3
H = np.where(is_floor, FLOOR, H)
# keep the mat inside the pocket footprint: pull edges down to the floor
edge = smoothstep(0.0, 1.0, np.minimum((W_MM / 2 - np.abs(X)) / 0.6, (D_MM / 2 - np.abs(Z)) / 0.6))
H = FLOOR + (H - FLOOR) * edge
print("height range", H.min(), H.max())

# ---------------------------------------------------------------- derived maps
def gblur(a, sigma_mm):
    return ndimage.gaussian_filter(a, (sigma_mm * sz, sigma_mm * sx), mode="nearest")


# low-pass height for real geometry displacement (kept as mm)
H_low = gblur(H, 0.45)
np.save(os.path.join(OUT, "loofah_height_low.npy"), H_low.astype(np.float32))

# cavity / ambient occlusion from multi-scale height differences
cav = np.zeros_like(H)
for sig, w in ((0.25, 0.9), (0.6, 0.8), (1.2, 0.55), (2.4, 0.35)):
    cav += w * np.maximum(gblur(H, sig) - H, 0)
AO = np.exp(-1.0 * cav)
AO = np.clip(AO, 0.22, 1.0)

# normal map from detail height (full minus the displaced low-pass)
Hd = H - H_low
gy, gx = np.gradient(Hd, 1 / sz, 1 / sx)      # d/drow (z, toward front), d/dcol (x)
strength = 1.0
nx = -gx * strength
ny = gy * strength                              # image-up = -z, so dh/d(up) = -dh/dz
nz = np.ones_like(nx)
nrm = np.sqrt(nx * nx + ny * ny + nz * nz)
N = np.stack([nx / nrm, ny / nrm, nz / nrm], -1)
Image.fromarray(np.rint((N * 0.5 + 0.5) * 255).astype(np.uint8)).save(os.path.join(OUT, "loofah_normal.png"))


def srgb2lin(c):
    c = np.asarray(c, np.float32) / 255
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lin2srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


fib_light = srgb2lin([246, 224, 182])
fib_dark = srgb2lin([222, 182, 122])
floor_col = srgb2lin([170, 126, 78])
rel = np.clip((H - FLOOR) / (TOP - FLOOR), 0, 1)            # 0 deep .. 1 top
t = TINT[..., None]
fib = fib_dark + (fib_light - fib_dark) * np.clip(0.25 + 0.55 * t + 0.35 * rel[..., None] - 0.15, 0, 1)
fib *= (0.86 + 0.14 * rel[..., None])                       # deeper strands slightly dimmer (less bleached)
col = np.where(is_floor[..., None] | (H <= FLOOR + 1e-3)[..., None], floor_col, fib)
col = col * (AO[..., None] ** 0.4)                          # baked cavity (direct light has no self-shadowing)
# a little large-scale variation
mott = gblur(rng.standard_normal(H.shape), 3.0)
mott /= mott.std()
col *= (1 + 0.035 * mott)[..., None]
Image.fromarray(np.rint(lin2srgb(col) * 255).astype(np.uint8)).save(os.path.join(OUT, "loofah_basecolor.png"))

rough = np.where(is_floor, 0.55, 0.78 - 0.08 * rel)
orm = np.stack([AO, rough, np.zeros_like(AO)], -1)
Image.fromarray(np.rint(orm * 255).astype(np.uint8)).save(os.path.join(OUT, "loofah_orm.png"))
np.save(os.path.join(OUT, "loofah_height_full.npy"), H.astype(np.float32))
print("done")
