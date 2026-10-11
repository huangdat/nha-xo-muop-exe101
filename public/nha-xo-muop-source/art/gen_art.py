"""Vector re-draw of the 'Nhà Xơ Mướp' packaging panels as SVG (units = millimetres).

Positions were measured from a perspective-rectified crop of the reference photo
(front panel 120 x 84 mm). Output: one SVG per panel in ./svg/.
"""
import math, random, os, json
from PIL import ImageFont

OUT = os.path.join(os.path.dirname(__file__), "svg")
os.makedirs(OUT, exist_ok=True)

FONT_SERIF = "/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf"
FONT_SANS = "/home/claude/work/fonts/expo-google-fonts-be-vietnam-pro-0.4.1/500Medium/BeVietnamPro_500Medium.ttf"

# ---- palette (sRGB albedo) ----
PAPER = "#EFE7D4"
GREEN = "#3E4F2C"        # logo ring, leaves, badge
GREEN_TXT = "#3A4927"    # wordmark & headings
INK = "#2C3023"          # net weight line
GOLD = "#D6AE74"
GOLD_L = "#E8C995"
GOLD_D = "#C79A5E"
SAGE = "#BAC3A5"
SAGE_L = "#CDD3BB"
SAGE_D = "#7D8B66"
STEM = "#7C8A60"
FLOWER = "#F2DDB4"
FLOWER_W = "#F7EEDC"
FLOWER_O = "#C49A62"
FLOWER_C = "#D49C4E"
BADGE_TXT = "#F4EEDF"

rng = random.Random(7)


# ---------------------------------------------------------------- geometry helpers
def f(v):
    return f"{v:.3f}".rstrip("0").rstrip(".")


def catmull(points, closed=False, n=12):
    pts = list(points)
    if closed:
        P = [pts[-1]] + pts + [pts[0], pts[1]]
    else:
        P = [pts[0]] + pts + [pts[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    if not closed:
        out.append(pts[-1])
    return out


def resample(poly, n):
    d = [0.0]
    for a, b in zip(poly, poly[1:]):
        d.append(d[-1] + math.dist(a, b))
    L = d[-1]
    out, j = [], 0
    for i in range(n):
        s = L * i / (n - 1)
        while j < len(d) - 2 and d[j + 1] < s:
            j += 1
        seg = d[j + 1] - d[j] or 1e-9
        t = (s - d[j]) / seg
        a, b = poly[j], poly[j + 1]
        out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    return out


def poly_d(poly, closed=True):
    s = "M" + " L".join(f"{f(x)} {f(y)}" for x, y in poly)
    return s + (" Z" if closed else "")


def tapered(poly, wfn):
    """Filled polygon of a stroke whose width follows wfn(t), t in [0,1]."""
    n = len(poly)
    L, R = [], []
    for i, p in enumerate(poly):
        a = poly[max(i - 1, 0)]
        b = poly[min(i + 1, n - 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        ln = math.hypot(dx, dy) or 1e-9
        nx, ny = -dy / ln, dx / ln
        w = wfn(i / (n - 1)) / 2
        L.append((p[0] + nx * w, p[1] + ny * w))
        R.append((p[0] - nx * w, p[1] - ny * w))
    return L + R[::-1]


def spiral(cx, cy, r0, turns, a0, ccw=True, n=60, decay=0.55):
    pts = []
    for i in range(n + 1):
        t = i / n
        a = a0 + (1 if ccw else -1) * 2 * math.pi * turns * t
        r = r0 * (1 - decay * t)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def leaf_poly(base, tip, width, bend=0.0, n=40, asym=0.0):
    bx, by = base
    tx, ty = tip
    L = math.dist(base, tip)
    ux, uy = (tx - bx) / L, (ty - by) / L
    vx, vy = -uy, ux
    out = []
    for side in (1, -1):
        rng_ = range(n + 1) if side == 1 else range(n, -1, -1)
        for i in rng_:
            u = i / n
            prof = math.sin(math.pi * u ** 0.85) ** 0.9  # pointed tip, round base
            w = width / 2 * prof * (1 + side * asym)
            c = bend * 4 * u * (1 - u)
            v = side * w + c
            out.append((bx + ux * u * L + vx * v, by + uy * u * L + vy * v))
    return out


def leaf_axis_point(base, tip, u, v, bend=0.0):
    bx, by = base
    tx, ty = tip
    L = math.dist(base, tip)
    ux, uy = (tx - bx) / L, (ty - by) / L
    vx, vy = -uy, ux
    c = bend * 4 * u * (1 - u)
    return (bx + ux * u * L + vx * (v + c), by + uy * u * L + vy * (v + c))


def palmate(cx, cy, lobes, rot=0.0, serr=0.35, seed=1):
    """Grape/loofah-style leaf. lobes: list of (angle_deg, length, halfwidth_deg)."""
    r = random.Random(seed)
    pts = []
    lobes = sorted(lobes, key=lambda l: l[0])
    m = len(lobes)
    for i in range(m):
        a, Ln, hw = lobes[i]
        a2, L2, _ = lobes[(i + 1) % m]
        if a2 <= a:
            a2 += 360
        # lobe: from sinus before -> tip -> sinus after, with serrations
        steps = 22
        for k in range(steps + 1):
            t = k / steps
            ang = math.radians(a - hw + 2 * hw * t + rot)
            prof = math.sin(math.pi * t) ** 0.45
            tipk = 1.0 + 0.12 * math.exp(-((t - 0.5) / 0.08) ** 2)
            rad = Ln * (0.52 + 0.48 * prof) * tipk
            if 0 < k < steps:
                rad += (serr if k % 2 else -serr * 0.3) * prof + r.uniform(-0.05, 0.05)
            pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
        # sinus
        am = math.radians((a + hw + a2 - lobes[(i + 1) % m][2]) / 2 + rot)
        sr = min(Ln, L2) * 0.5
        pts.append((cx + sr * math.cos(am), cy + sr * math.sin(am)))
    veins = []
    for a, Ln, hw in lobes:
        ang = math.radians(a + rot)
        veins.append([(cx, cy), (cx + Ln * 0.88 * math.cos(ang), cy + Ln * 0.88 * math.sin(ang))])
        for s in (-1, 1):  # side veins
            p0 = (cx + Ln * 0.45 * math.cos(ang), cy + Ln * 0.45 * math.sin(ang))
            a2 = ang + s * math.radians(38)
            veins.append([p0, (p0[0] + Ln * 0.3 * math.cos(a2), p0[1] + Ln * 0.3 * math.sin(a2))])
    return pts, veins


def flower(cx, cy, r, n=5, rot=0.0, fill=FLOWER, stroke=FLOWER_O, sw=0.18):
    parts = []
    for i in range(n):
        a = math.radians(rot + i * 360 / n)
        tip = (cx + r * math.cos(a), cy + r * math.sin(a))
        pts = leaf_poly((cx, cy), tip, r * 1.05, n=16)
        # make petals rounder: blunt the tip
        parts.append(f'<path d="{poly_d(pts)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>')
        mid = (cx + r * 0.55 * math.cos(a), cy + r * 0.55 * math.sin(a))
        parts.append(f'<path d="M{f(cx)} {f(cy)} L{f(mid[0])} {f(mid[1])}" stroke="{stroke}" stroke-width="{sw*0.7}" opacity="0.6"/>')
    parts.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r*0.22)}" fill="{FLOWER_C}" stroke="{stroke}" stroke-width="{sw*0.7}"/>')
    return "\n".join(parts)


def line(poly, color, w, extra=""):
    return f'<path d="{poly_d(poly, False)}" fill="none" stroke="{color}" stroke-width="{f(w)}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'


def tendril(path_pts, curl=None, color=STEM, w=0.32):
    pts = catmull(path_pts, n=10)
    if curl:
        cx, cy, r0, turns, a0, ccw = curl
        sp = spiral(cx, cy, r0, turns, a0, ccw)
        # connect smoothly
        pts = pts + sp
    return f'<path d="{poly_d(tapered(pts, lambda t: w*(1-0.55*t)))}" fill="{color}"/>'


# ---------------------------------------------------------------- text helpers
_fcache = {}


def text_width(s, font, size):
    key = (font, 200)
    if key not in _fcache:
        _fcache[key] = ImageFont.truetype(font, 200)
    return _fcache[key].getlength(s) / 200 * size


def fit_size(s, font, width):
    return width / text_width(s, font, 1.0)


def text(s, x, y, size, color, family="Lora", anchor="start", weight=None, extra=""):
    w = f' font-weight="{weight}"' if weight else ""
    return (f'<text x="{f(x)}" y="{f(y)}" font-family="{family}" font-size="{f(size)}"{w} fill="{color}" '
            f'text-anchor="{anchor}" {extra}>{s}</text>')


# ---------------------------------------------------------------- logo
def logo(seed=3):
    """Central mark: green crescent ring, gold loofah with stem, two leaves, soap bar.
    Native coordinates = front panel mm (bounding box ~ 54..98 x 3..50)."""
    r = random.Random(seed)
    g = []
    # crescent ring
    cx, cy, R = 76.6, 27.4, 21.3
    a0, a1 = math.radians(238), math.radians(6)
    arc = [(cx + R * math.cos(a0 + (a1 - a0) * t), cy + R * math.sin(a0 + (a1 - a0) * t)) for t in [i / 200 for i in range(201)]]
    p = math.log(0.5) / math.log(0.62)
    g.append(f'<path d="{poly_d(tapered(arc, lambda t: 2.05 * math.sin(math.pi * t ** p) ** 0.85 + 0.05))}" fill="{GREEN}"/>')

    # loofah body
    outline = [(82.2, 9.2), (86.6, 9.9), (90.6, 12.6), (93.8, 17.6), (95.5, 24.0), (95.5, 31.0),
               (93.7, 37.4), (90.6, 42.3), (87.2, 45.2), (84.6, 45.6), (81.6, 43.2), (79.1, 38.6),
               (77.5, 32.0), (76.9, 25.0), (77.3, 18.0), (78.6, 13.0), (80.2, 10.2)]
    body = catmull(outline, closed=True, n=10)
    g.append('<defs><radialGradient id="lg" cx="0.42" cy="0.40" r="0.62">'
             f'<stop offset="0" stop-color="{GOLD_L}"/><stop offset="0.6" stop-color="{GOLD}"/>'
             f'<stop offset="1" stop-color="{GOLD_D}"/></radialGradient>'
             '<filter id="mottle" x="0" y="0" width="1" height="1">'
             '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" result="n"/>'
             '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.40  0 0 0 0 0.22  0 0 0 0.55 -0.12" result="m"/>'
             '<feComposite in="m" in2="SourceGraphic" operator="in"/></filter></defs>')
    g.append(f'<path d="{poly_d(body)}" fill="url(#lg)" stroke="{PAPER}" stroke-width="0.55" stroke-linejoin="round"/>')
    g.append(f'<path d="{poly_d(body)}" fill="#000" filter="url(#mottle)" opacity="0.55"/>')
    # ribs: interpolate between left and right edges (top index 0, bottom index 9)
    right = resample(catmull(outline[0:10], n=10), 120)
    left = resample(catmull([outline[0]] + outline[:9:-1] + [outline[9]], n=10), 120)
    ribs = []
    for fr in (0.13, 0.30, 0.48, 0.66, 0.83):
        fe = 0.5 - 0.5 * math.cos(math.pi * fr)
        rib = [(l[0] + (rr[0] - l[0]) * fe, l[1] + (rr[1] - l[1]) * fe) for l, rr in zip(left, right)]
        ribs.append(rib)
        g.append(f'<path d="{poly_d(tapered(rib[3:-3], lambda t: 0.5 * math.sin(math.pi * t) ** 0.5 + 0.04))}" fill="#FBF3E4"/>')
    # cross hatching between ribs (net texture)
    edges = [left] + ribs + [right]
    for a_, b_ in zip(edges, edges[1:]):
        for i in range(9, 111, 5):
            j = i + r.randint(-2, 2)
            pa, pb = a_[j], b_[j]
            t0, t1 = r.uniform(0.05, 0.3), r.uniform(0.55, 0.95)
            zz = (0.55 if (i // 5) % 2 else -0.55) + r.uniform(-0.25, 0.25)
            q0 = (pa[0] + (pb[0] - pa[0]) * t0, pa[1] + (pb[1] - pa[1]) * t0 - zz / 2)
            q1 = (pa[0] + (pb[0] - pa[0]) * t1, pa[1] + (pb[1] - pa[1]) * t1 + zz / 2)
            if math.dist(q0, q1) < 0.35:
                continue
            g.append(f'<path d="M{f(q0[0])} {f(q0[1])} L{f(q1[0])} {f(q1[1])}" stroke="#FBF3E4" stroke-width="0.3" stroke-linecap="round" opacity="0.95"/>')
    # stem + tendrils
    stem = catmull([(82.3, 9.8), (82.0, 7.6), (81.4, 5.6), (80.6, 4.4)], n=10)
    g.append(f'<path d="{poly_d(tapered(stem, lambda t: 1.0 - 0.45 * t))}" fill="{GREEN}"/>')
    lt = catmull([(81.0, 5.0), (79.4, 3.9), (77.6, 3.8), (76.3, 4.9)], n=10) + spiral(76.9, 6.0, 1.15, 0.9, math.radians(200), ccw=False, decay=0.45)
    g.append(f'<path d="{poly_d(tapered(lt, lambda t: 0.62 * (1 - 0.55 * t)))}" fill="{GREEN}"/>')
    rt = catmull([(81.2, 5.2), (82.6, 4.1), (84.3, 3.4), (85.6, 3.9)], n=10) + spiral(85.2, 5.0, 1.05, 0.85, math.radians(-30), ccw=True, decay=0.45)
    g.append(f'<path d="{poly_d(tapered(rt, lambda t: 0.6 * (1 - 0.55 * t)))}" fill="{GREEN}"/>')

    # leaves
    big = leaf_poly((62.6, 31.0), (74.9, 11.6), 9.2, bend=-0.9)
    g.append(f'<path d="{poly_d(big)}" fill="{GREEN}" stroke="{PAPER}" stroke-width="0.35"/>')
    hl = [leaf_axis_point((62.6, 31.0), (74.9, 11.6), u, v, bend=-0.9) for u, v in
          [(0.06, -1.3), (0.25, -1.65), (0.45, -1.35), (0.65, -0.75), (0.84, -0.15)]]
    g.append(f'<path d="{poly_d(tapered(catmull(hl, n=10), lambda t: 0.62 * math.sin(math.pi * t) ** 0.7))}" fill="{PAPER}"/>')
    small = leaf_poly((63.6, 34.2), (73.4, 28.0), 4.6, bend=0.7)
    g.append(f'<path d="{poly_d(small)}" fill="{GREEN}" stroke="{PAPER}" stroke-width="0.35"/>')
    hl2 = [leaf_axis_point((63.6, 34.2), (73.4, 28.0), u, v, bend=0.7) for u, v in
           [(0.12, 0.7), (0.4, 0.95), (0.7, 0.55), (0.9, 0.1)]]
    g.append(f'<path d="{poly_d(tapered(catmull(hl2, n=10), lambda t: 0.45 * math.sin(math.pi * t) ** 0.7))}" fill="{PAPER}"/>')

    # soap bar (3/4 view)
    top = [(63.9, 36.4), (68.4, 33.2), (82.4, 33.6), (77.6, 36.6)]
    side = [(77.6, 36.6), (82.4, 33.6), (82.5, 43.4), (77.7, 46.9)]
    g.append(f'<path d="{poly_d(top)}" fill="{GOLD_L}" stroke="{PAPER}" stroke-width="0.6" stroke-linejoin="round"/>')
    g.append(f'<path d="{poly_d(side)}" fill="{GOLD_D}" stroke="{PAPER}" stroke-width="0.6" stroke-linejoin="round"/>')
    g.append(f'<rect x="63.5" y="36.4" width="14.2" height="10.5" rx="1.5" fill="#D9AE72" stroke="{PAPER}" stroke-width="0.6"/>')
    g.append(f'<rect x="63.5" y="36.4" width="14.2" height="10.5" rx="1.5" fill="#000" filter="url(#mottle)" opacity="0.35"/>')
    g.append(sprout(70.6, 42.0, 5.4, GREEN, bud=True))
    return "\n".join(g)


def sprout(cx, cy, size, color, bud=False, top_leaf=False):
    """Two-leaf sprout icon centred at (cx,cy), overall width ~size."""
    s = size / 5.4
    base = (cx, cy + 2.4 * s)
    out = []
    L = leaf_poly((cx - 0.15 * s, cy + 1.7 * s), (cx - 3.0 * s, cy - 1.6 * s), 2.6 * s, bend=0.35 * s)
    R = leaf_poly((cx + 0.15 * s, cy + 1.7 * s), (cx + 3.0 * s, cy - 1.6 * s), 2.6 * s, bend=-0.35 * s)
    out.append(f'<path d="{poly_d(L)}" fill="{color}"/>')
    out.append(f'<path d="{poly_d(R)}" fill="{color}"/>')
    stem = catmull([base, (cx, cy + 0.8 * s), (cx + 0.05 * s, cy - 1.2 * s)], n=8)
    out.append(f'<path d="{poly_d(tapered(stem, lambda t: 0.45 * s * (1 - 0.5 * t)))}" fill="{color}"/>')
    # light midribs
    for sx in (-1, 1):
        rib = [(cx + sx * 0.4 * s, cy + 1.3 * s), (cx + sx * 1.5 * s, cy - 0.1 * s), (cx + sx * 2.5 * s, cy - 1.15 * s)]
        out.append(f'<path d="{poly_d(tapered(catmull(rib, n=6), lambda t: 0.16 * s * math.sin(math.pi * t)))}" fill="{PAPER}" opacity="0.85"/>')
    if top_leaf:
        T = leaf_poly((cx, cy - 0.6 * s), (cx, cy - 3.3 * s), 1.7 * s)
        out.append(f'<path d="{poly_d(T)}" fill="{color}"/>')
    if bud:
        out.append(f'<path d="{poly_d(leaf_poly((cx, cy - 2.0*s), (cx, cy - 3.6*s), 1.0*s))}" fill="{color}"/>')
    return "\n".join(out)


def badge_leaf(cx, cy, h):
    w = h * 0.68
    out = [f'<path d="{poly_d(leaf_poly((cx, cy + h/2), (cx, cy - h/2), w, n=30))}" fill="{BADGE_TXT}"/>']
    # inner plant: midrib + three pairs of branches
    out.append(line([(cx, cy + h * 0.38), (cx, cy - h * 0.30)], GREEN, h * 0.055))
    for k, yy in enumerate((0.16, -0.02, -0.18)):
        ln = h * (0.2 - 0.03 * k)
        for sx in (-1, 1):
            out.append(line([(cx, cy + h * yy), (cx + sx * ln * 0.75, cy + h * yy - ln * 0.75)], GREEN, h * 0.045))
    return "\n".join(out)


# ---------------------------------------------------------------- botanicals
def botanical_topleft():
    g = []
    # tendrils behind
    g.append(tendril([(8.6, 19.6), (6.2, 22.0), (4.6, 24.6)], curl=(5.6, 25.9, 1.45, 1.1, math.radians(190), False)))
    g.append(tendril([(4.4, 27.5), (3.4, 30.5), (3.3, 33.5), (2.7, 37.0)], curl=None, w=0.28))
    g.append(tendril([(4.0, 28.5), (5.4, 29.2)], curl=(4.8, 30.6, 1.25, 1.0, math.radians(-60), True), w=0.24))
    g.append(tendril([(18.6, 11.6), (21.0, 8.6), (23.4, 6.4)], curl=(24.4, 4.9, 1.5, 1.15, math.radians(130), True)))
    g.append(tendril([(22.0, 7.6), (25.0, 6.2), (27.0, 5.2)], curl=(27.6, 4.0, 0.95, 0.9, math.radians(100), True), w=0.24))
    g.append(tendril([(21.0, 9.5), (23.6, 11.4), (24.6, 14.0)], curl=(25.4, 15.2, 1.1, 1.0, math.radians(200), False), w=0.24))
    # flower stems
    for p in [(6.0, 6.6), (13.2, 8.1), (18.6, 10.2)]:
        g.append(line(catmull([(12.4, 13.6), ((12.4 + p[0]) / 2 + 0.6, (13.6 + p[1]) / 2 + 0.4), p], n=8), STEM, 0.26))
    # gourd stem
    g.append(line(catmull([(12.6, 14.5), (13.3, 18.0), (14.0, 21.2)], n=8), STEM, 0.4))
    # palmate leaf
    pts, veins = palmate(12.3, 14.6, [(178, 7.2, 27), (232, 5.6, 24), (300, 4.8, 22), (352, 7.0, 27), (60, 6.0, 25), (120, 7.4, 27)], rot=0, seed=2, serr=0.22)
    g.append(f'<path d="{poly_d(catmull(pts, closed=True, n=3))}" fill="{SAGE}" stroke="{SAGE_D}" stroke-width="0.22" stroke-linejoin="round"/>')
    for v in veins:
        g.append(line(v, SAGE_D, 0.16, 'opacity="0.85"'))
    # gourd body (slightly curved cylinder)
    cl = catmull([(14.2, 21.4), (15.6, 26.0), (17.6, 31.6), (19.8, 37.6)], n=20)
    cl = resample(cl, 60)
    def rad(t):
        return 1.25 + 1.75 * math.sin(math.pi * min(1, t * 1.12) ** 0.75) ** 0.55 * (1 - 0.12 * t)
    Lp, Rp = [], []
    for i, p in enumerate(cl):
        a, b = cl[max(i - 1, 0)], cl[min(i + 1, len(cl) - 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        ln = math.hypot(dx, dy)
        nx, ny = -dy / ln, dx / ln
        t = i / (len(cl) - 1)
        w = rad(t) if t < 0.96 else rad(t) * math.sqrt(max(0, 1 - ((t - 0.96) / 0.04) ** 2) * 0.8 + 0.2)
        Lp.append((p[0] + nx * w, p[1] + ny * w))
        Rp.append((p[0] - nx * w, p[1] - ny * w))
    gourd = Lp + Rp[::-1]
    g.append('<defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="0.2">'
             f'<stop offset="0" stop-color="{SAGE_L}"/><stop offset="0.5" stop-color="{SAGE}"/><stop offset="1" stop-color="#97A47F"/></linearGradient></defs>')
    g.append(f'<path d="{poly_d(catmull(gourd, closed=True, n=2))}" fill="url(#gg)" stroke="{SAGE_D}" stroke-width="0.24" stroke-linejoin="round"/>')
    for fr in (-0.62, -0.25, 0.12, 0.48, 0.8):
        rib = [(l[0] * (0.5 - fr / 2) + r[0] * (0.5 + fr / 2), l[1] * (0.5 - fr / 2) + r[1] * (0.5 + fr / 2)) for l, r in zip(Lp, Rp)]
        g.append(line(rib[2:-2], SAGE_D, 0.17, 'opacity="0.8"'))
    # gourd tip remnant
    g.append(flower(19.95, 38.3, 0.9, n=4, rot=60, fill=FLOWER, sw=0.12))
    # flowers on top
    g.append(flower(6.0, 6.6, 2.7, rot=-80, sw=0.14))
    g.append(flower(13.2, 8.1, 2.4, rot=-60, fill=FLOWER_W, stroke="#BFA77F", sw=0.14))
    g.append(flower(18.6, 10.2, 2.2, rot=-20, sw=0.14))
    return "\n".join(g)


def botanical_right():
    g = []
    g.append(tendril([(115.6, 30.0), (113.6, 25.0), (113.0, 20.0), (113.8, 16.0)], curl=(114.6, 14.6, 1.1, 1.1, math.radians(150), True), w=0.3))
    g.append(tendril([(113.2, 21.0), (111.6, 19.2)], curl=(110.6, 18.2, 0.9, 1.0, math.radians(0), False), w=0.22))
    g.append(tendril([(113.4, 23.6), (115.6, 22.4), (116.4, 21.2)], curl=(116.0, 20.4, 0.6, 0.9, math.radians(60), True), w=0.2))
    g.append(line(catmull([(118.6, 32.6), (115.0, 31.0), (110.6, 25.6)], n=8), STEM, 0.32))
    pts, veins = palmate(112.4, 31.0, [(168, 4.6, 30), (236, 3.6, 26), (300, 3.0, 24), (20, 4.2, 30), (100, 4.8, 30)], rot=0, seed=5, serr=0.18)
    g.append(f'<path d="{poly_d(catmull(pts, closed=True, n=3))}" fill="{SAGE}" stroke="{SAGE_D}" stroke-width="0.2" stroke-linejoin="round"/>')
    for v in veins:
        g.append(line(v, SAGE_D, 0.14, 'opacity="0.85"'))
    g.append(flower(109.6, 24.2, 1.9, rot=-50, sw=0.13))
    # bottom right sprig
    g.append(tendril([(109.2, 74.0), (109.4, 77.0), (111.2, 79.0)], curl=None, w=0.26))
    g.append(tendril([(111.0, 79.2), (113.8, 79.4), (116.0, 81.0), (117.6, 85.0)], w=0.3))
    g.append(tendril([(109.6, 76.4), (108.6, 78.4)], curl=(109.6, 79.6, 1.1, 1.0, math.radians(200), False), w=0.22))
    g.append(flower(108.6, 72.6, 1.8, n=4, rot=-35))
    g.append(flower(113.2, 80.6, 0.55, n=4, rot=10, sw=0.1))
    return "\n".join(g)


# ---------------------------------------------------------------- panels
def svg_wrap(w, h, body, bg=PAPER):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}mm" height="{h}mm" viewBox="0 0 {w} {h}">'
            f'<rect x="-5" y="-5" width="{w+10}" height="{h+10}" fill="{bg}"/>\n{body}\n</svg>')


def wordmark(x, y_base, width, color=GREEN_TXT, anchor="start"):
    s = "Nhà Xơ Mướp"
    size = fit_size(s, FONT_SERIF, width)
    sw = size * 0.0075
    return text(s, x, y_base, size, color, anchor=anchor,
                extra=f'stroke="{color}" stroke-width="{f(sw)}" stroke-linejoin="round"'), size


def front():
    b = []
    b.append(botanical_topleft())
    b.append(botanical_right())
    # left text block
    sz = fit_size("THIÊN NHIÊN", FONT_SERIF, 32.2)
    hv = f'stroke="{GREEN_TXT}" stroke-width="0.09" stroke-linejoin="round"'
    b.append(text("XÀ BÔNG", 6.0, 48.4, sz, GREEN_TXT, extra='letter-spacing="0.15" ' + hv))
    b.append(text("THIÊN NHIÊN", 6.0, 55.0, sz, GREEN_TXT, extra=hv))
    s2 = fit_size("Bảo vệ vượt trội", FONT_SERIF, 23.6)
    b.append(text("Bảo vệ vượt trội", 6.0, 61.6, s2, GREEN_TXT))
    b.append(text("Từ thiên nhiên", 6.0, 66.6, s2, GREEN_TXT))
    # badge
    b.append('<defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#46562F"/>'
             '<stop offset="1" stop-color="#3A4927"/></linearGradient></defs>')
    b.append('<rect x="5.6" y="69.4" width="33.6" height="9.1" rx="1.3" fill="url(#bg1)"/>')
    b.append(badge_leaf(9.3, 73.95, 6.0))
    s3 = fit_size("TỪ MƯỚP & THIÊN NHIÊN", FONT_SANS, 24.4)
    b.append(text("CHIẾT XUẤT", 13.1, 73.25, s3, BADGE_TXT, family="Be Vietnam Pro", weight=500))
    b.append(text("TỪ MƯỚP &amp; THIÊN NHIÊN", 13.1, 77.0, s3, BADGE_TXT, family="Be Vietnam Pro", weight=500))
    # logo + wordmark
    b.append(logo())
    wm, _ = wordmark(49.9, 62.2, 56.2)
    b.append(wm)
    b.append(line([(52.0, 67.9), (70.0, 67.9)], GREEN, 0.22))
    b.append(line([(83.0, 67.9), (104.0, 67.9)], GREEN, 0.22))
    b.append(sprout(76.5, 68.0, 5.4, GREEN, top_leaf=True))
    s4 = fit_size("Khối lượng tịnh khi đóng gói: 90 g", FONT_SERIF, 48.0)
    b.append(text("Khối lượng tịnh khi đóng gói: 90 g", 58.9, 80.4, s4, INK))
    return svg_wrap(120, 84, "\n".join(b))


def lockup_horizontal():
    """Logo + wordmark side by side (logo first). Local frame: x = reading direction from 0,
    y = 0 on the lockup's centre line. Total length ~66 mm."""
    k = 0.5
    # logo native bbox ~ x 54.2..98.2, y 3..50 (centre y 26.5)
    g = [f'<g transform="translate({f(-54.2*k)} {f(-26.5*k)}) scale({k})">{logo(seed=9)}</g>']
    size = fit_size("Nhà Xơ Mướp", FONT_SERIF, 41.5)
    wm, _ = wordmark(24.5, 0.7 * size / 2, 41.5)
    g.append(wm)
    return "\n".join(g)


def side():
    # 50 x 84 mm. Lockup reads bottom->top (rotated -90deg), logo at the bottom.
    body = f'<g transform="translate(25.4 75.0) rotate(-90)">{lockup_horizontal()}</g>'
    return svg_wrap(50, 84, body)


def back():
    b = []
    k = 0.78
    # centre the logo (native bbox ~ 54..98 x 3..50; centre 76.2, 26.5)
    b.append(f'<g transform="translate({f(60 - 76.2*k)} {f(30 - 26.5*k)}) scale({k})">{logo(seed=11)}</g>')
    wm, _ = wordmark(60, 61.0, 50.0, anchor="middle")
    b.append(wm)
    b.append(line([(36.0, 66.6), (52.5, 66.6)], GREEN, 0.22))
    b.append(line([(67.5, 66.6), (84.0, 66.6)], GREEN, 0.22))
    b.append(sprout(60.0, 66.7, 5.0, GREEN, top_leaf=True))
    return svg_wrap(120, 84, "\n".join(b))


def top():
    return svg_wrap(120, 50, sprout(60.0, 25.0, 7.0, GREEN, top_leaf=True))


def bottom():
    return svg_wrap(120, 50, "")


if __name__ == "__main__":
    panels = {"front": front(), "side": side(), "back": back(), "top": top(), "bottom": bottom()}
    for k, v in panels.items():
        with open(os.path.join(OUT, k + ".svg"), "w", encoding="utf-8") as fh:
            fh.write(v)
    print("wrote", list(panels))
