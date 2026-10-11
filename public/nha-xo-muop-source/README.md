# Nhà Xơ Mướp — web-ready 3D product model

| File | Contents | Size |
|---|---|---|
| `nha-xo-muop.glb` | **Primary.** Packaging box + loofah soap bar (hero set) | 5.31 MB |
| `nha-xo-muop-soap.glb` | Soap bar only | 3.55 MB |
| `NhaXoMuopViewer.jsx` | React Three Fiber viewer component | — |
| `preview-threejs.png` | Screenshot of the component running (three.js r186) | — |
| `preview-cycles.png` | Offline render of the same GLB (Blender Cycles) | — |
| `nha-xo-muop-source.zip` | Regeneration pipeline: SVG artwork, full-res panel art, build scripts | — |

**All textures are embedded in the GLBs — there are no external texture files to deploy.**

---

## 1. Model specification

- **Format:** glTF 2.0 binary, exported by Blender 5.2.2 LTS (Khronos glTF I/O 5.2.40). Core spec only — no extensions required (no Draco, KTX2 or WebP), so it opens in any glTF 2.0 viewer.
- **Units / axes:** metres, **+Y up**, printed **front faces +Z** (toward a default three.js camera), right side panel faces +X.
- **Transforms applied;** no cameras, lights or animations in the files.

### Box
- **120 × 84 × 50 mm** (W × H × D), edges bevelled 1.1 mm (3 segments, hardened normals).
- **Origin: bottom-centre** — x ∈ [−0.06, 0.06], y ∈ [0, 0.084], z ∈ [−0.025, 0.025]; sits on y = 0.

### Soap bar
- **90 × 60 × 28 mm** (L × W × H), 2.6 mm rounded edges, 71 × 47 × 2.5 mm rounded pocket holding a 70 × 46 mm loofah mat whose crown sits 1.7 mm proud of the rim.
- **Origin: bottom-centre of the bar.** In `nha-xo-muop.glb` the `Soap` group is translated **(+0.012, 0, +0.095) m** (in front of the box, slightly right). In `nha-xo-muop-soap.glb` it is at the origin.

### Scene graph (same names in both files)
```
Box              mesh   Box_Print        188 tris
Soap             group  (animate / hide this node to move the bar independently)
├─ Soap_Body     mesh   Soap_Body        700 tris
└─ Soap_Loofah   mesh   Loofah_Fiber  25,512 tris
```
Total **26,400 triangles, 3 draw calls**. Tangents exported (MikkTSpace).

### Materials (metallic-roughness PBR, opaque, single-sided)
| Material | Textures (all JPEG, embedded) | Notes |
|---|---|---|
| `Box_Print` | baseColor **4096²** label atlas (UV0); normal 512² tiling paper tooth (UV1, scale 0.5) | roughness 0.68, metallic 0 (matte board) |
| `Soap_Body` | baseColor / ORM / normal 1024² | baked from 3D procedural noise (seamless); AO baked with the loofah in place |
| `Loofah_Fiber` | baseColor 1536×1024, normal 1280×848, ORM 768×512 | from a simulated fibre network; low-frequency relief is real geometry |

ORM = R occlusion, G roughness, B metallic (one image serves `occlusionTexture` and `metallicRoughnessTexture`).

**Label atlas layout:** front panel 3072 × 2150 px (256 px/cm), side panels 1024 × 1720, back 2458 × 1720, top/bottom at lower density. UVs are normalised, so the atlas can be resized or swapped without touching geometry.

**Estimated GPU memory** (gltf-transform inspect): ~124 MB of textures with mipmaps, ~89 MB of which is the 4K label. See §4 for a 2K variant for low-end phones.

---

## 2. Validation performed

- **Khronos glTF-Validator 2.0.0-dev.3.10:** both files **0 errors, 0 warnings, 0 hints**; 3 infos = non-power-of-two loofah textures (fine on WebGL2; three.js ≥ r163 is WebGL2-only).
- **Round-trip:** re-imported into a clean Blender scene — all 8 textures resolve from inside the GLB — and rendered (`preview-cycles.png`).
- **three.js r186 `GLTFLoader` in headless Chromium (SwiftShader WebGL2):** every texture bound to the expected slot and UV channel (paper normal on channel 1), tangents present, no console errors.
- **The component itself** was built with Vite + React 19.3 + @react-three/fiber 9.8.1 + drei 10.7.9 and exercised headless: load, `showSoap={false}`, soap-only file, mouse orbit, and a 390 px / DPR 2 mobile viewport. Only console output is R3F's own `THREE.Clock` deprecation notice (internal to R3F, harmless).

---

## 3. React integration

### Install
Check your React version first (read-only, changes nothing):
```bash
npm ls react
```
**React 19.0 – 19.3** (the combination tested here) — adds the three runtime packages to `package.json` / `node_modules`:
```bash
npm install three@^0.186.1 @react-three/fiber@^9.8.1 @react-three/drei@^10.7.9
```
**React 18:** fiber 9 / drei 10 require React 19. The React 18 line is `@react-three/fiber@8.18.0` + `@react-three/drei@9.122.0` (peer ranges checked on npm). The component only uses APIs present in both lines, but that combination was **not tested** here.

### Place the files
```
public/models/nha-xo-muop.glb          ← served as /models/nha-xo-muop.glb
public/models/nha-xo-muop-soap.glb     ← optional
src/components/NhaXoMuopViewer.jsx
```

### Use
```jsx
import NhaXoMuopViewer from './components/NhaXoMuopViewer'

export default function ProductGallery3D() {
  return <NhaXoMuopViewer />                    // box + soap, 1:1, full width, max 80vh
  // <NhaXoMuopViewer showSoap={false} autoRotate />
  // <NhaXoMuopViewer modelUrl="/models/nha-xo-muop-soap.glb" />
  // <NhaXoMuopViewer style={{ aspectRatio: '4 / 3' }} background="#ffffff" />
}
```

| Prop | Default | Effect |
|---|---|---|
| `modelUrl` | `/models/nha-xo-muop.glb` | GLB to load |
| `showSoap` | `true` | Shows/hides the `Soap` node (contact shadow re-renders) |
| `autoRotate` | `false` | Slow turntable; stops while the user drags |
| `background` | `#f3f0ea` | Studio backdrop colour |
| `className`, `style` | 100% wide, `aspectRatio 1/1`, `maxHeight 80vh` | Wrapper sizing — the canvas follows it |

**Position and scale.** Inside the component: `<Product position={[0,0,0]} rotation={[0,-0.18,0]} scale={1} />`. `<Bounds fit observe>` refits the camera to its contents on load and whenever the container resizes, so changing `scale` does not change on-screen size; it only matters when you add other objects to the scene (the model is in metres: `scale={10}` makes the box 1.2 m wide). Keep `ContactShadows` at the model's floor height if you move it vertically.

**What it does:** self-contained studio lighting (drei `Lightformer`s + one shadow-casting directional light — no HDRI download, works behind strict CSP), `NeutralToneMapping` (Khronos PBR Neutral, accurate product colour), `frameloop="demand"` (renders only while interacting), max anisotropic filtering on the label so small text stays sharp at angles, contact shadow rendered once.

**Next.js (App Router):** the file uses hooks and WebGL — add `'use client'` as its first line, or import it with `dynamic(() => import('…/NhaXoMuopViewer'), { ssr: false })`.

**Bundle size:** three + R3F + drei measured ≈ 360 KB gzip in the test build. Lazy-load it so it stays off the critical path:
```jsx
const NhaXoMuopViewer = lazy(() => import('./components/NhaXoMuopViewer'))
// <Suspense fallback={<img src="/img/product.jpg" alt="Nhà Xơ Mướp" />}><NhaXoMuopViewer /></Suspense>
```

**Serving:** use `Content-Type: model/gltf-binary` and long-lived caching. The GLB is mostly JPEG data, so gzip/brotli gain little.

---

## 4. Optional size optimisations (commands verified on these files)

Each writes a **new** file and leaves the input untouched; run from the folder containing the GLB.

WebP textures — **5.31 MB → 2.35 MB**, validates clean, keeps node names; label text visually identical (PSNR 42 dB on the text). Adds the `EXT_texture_webp` extension as *required* (three.js supports it; some non-web viewers don't). Normal maps become lossy 4:2:0 — not visually QA'd:
```bash
npx @gltf-transform/cli@4.5.1 webp nha-xo-muop.glb nha-xo-muop.webp.glb
```
2K label atlas for low-end mobile — label VRAM ~89 MB → ~22 MB, file 4.0 MB:
```bash
npx @gltf-transform/cli@4.5.1 resize nha-xo-muop.glb nha-xo-muop-2k.glb --width 2048 --height 2048 --pattern "box_basecolor"
```
Read-only check of any output (prints errors/warnings, changes nothing):
```bash
npx @gltf-transform/cli@4.5.1 validate nha-xo-muop.webp.glb
```
**Avoid `gltf-transform optimize` with default flags:** it flattens the scene graph (the `Soap` node disappears, breaking `showSoap`) and simplifies the meshes.

---

## 5. Limitations and decisions

1. **Artwork is a faithful vector re-draw, not the original print file.** Layout, text and colours were measured from a perspective-rectified crop of the reference photo; the logo and botanical illustrations are hand-redrawn approximations. Fonts are substitutes chosen to match: **Lora** (wordmark, headings, body) and **Be Vietnam Pro Medium** (badge) — both SIL Open Font License, full Vietnamese coverage. All diacritics are real glyphs. For production, drop the real dieline art into the same atlas rectangles (`atlas_layout.json` in the source zip) and rebuild.
2. **Unseen faces.** The photo shows only the front and right side. I used brand-only content elsewhere — back: logo + wordmark; left side: same as right; top: small leaf ornament; bottom: blank. No barcode, ingredients or claims were invented; text used is only what appears in the photo.
3. **Dimensions.** Front aspect measured ≈ 1.43 → 120 × 84 mm. Depth 50 mm is your suggested value (the photo's side panel is perspective-inconsistent, so depth couldn't be measured). The soap's 90 × 60 × 28 mm matches the photo's proportions, but that volume (~150 cm³) is heavier than the printed 90 g implies (~85–90 cm³ for soap); if the real bar is smaller, scale the `Soap` node.
4. **Loofah** is procedural (simulated fibre network → baked textures + displaced low-poly mat), not a scan. It holds up from product distance to close-up; at grazing angles the silhouette is a height-field (no undercuts).
5. **Soap translucency** is suggested through colour variation and a waxy roughness range; there's no subsurface scattering (no portable glTF/three.js equivalent).
6. The box is a closed block with softened edges — no tuck flaps, glue seams or opening.

---

## 6. Regenerating (source zip)

`make_all.sh` runs the whole pipeline: `art/gen_art.py` (SVG panels) → `art/atlas.py` (resvg raster + 4K atlas) → `tex/gen_loofah.py`, `tex/gen_paper.py` (procedural maps) → `tex/encode.py` → `blender/build.py` (geometry, Cycles bakes, glTF export). Requirements: Python 3.13 with numpy/scipy/Pillow, Node 22 with `@resvg/resvg-js`, and Blender as a module (`pip install bpy==5.2.2`). Paths inside the scripts are absolute to the build machine (`/home/claude/work`) — change the `W`/`TEX`/`D` constants at the top of each script to your checkout. `art/out/panel_*.png` are the full-resolution panel artworks.
