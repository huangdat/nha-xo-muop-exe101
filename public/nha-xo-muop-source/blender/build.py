"""Build 'Nhà Xơ Mướp' box + loofah soap in Blender (bpy 5.2) and export glTF 2.0 binaries.

Blender frame: Z up, product front faces -Y.  glTF export (+Y up) maps Blender -Y -> glTF +Z,
so in three.js the printed front faces +Z (toward the default camera).  Units: metres.
"""
import bpy, bmesh, json, math, os, sys
import numpy as np
from mathutils import Vector
from PIL import Image, ImageFile
from scipy import ndimage

ImageFile.MAXBLOCK = 2 ** 26
W = "/home/claude/work"
TEX = f"{W}/tex/out"
BUILD = f"{W}/build"
os.makedirs(BUILD, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
col = scene.collection


def link(obj):
    col.objects.link(obj)
    return obj


def apply_modifiers(obj):
    bpy.ops.object.select_all(action="DESELECT")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for m in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


def img_node(nt, path, non_color=False, uv=None, x=-600, y=0):
    img = bpy.data.images.load(path, check_existing=True)
    img.colorspace_settings.name = "Non-Color" if non_color else "sRGB"
    n = nt.nodes.new("ShaderNodeTexImage")
    n.image = img
    n.location = (x, y)
    if uv:
        u = nt.nodes.new("ShaderNodeUVMap")
        u.uv_map = uv
        u.location = (x - 250, y)
        nt.links.new(u.outputs["UV"], n.inputs["Vector"])
    return n


def gltf_output_group():
    """Custom group the glTF exporter recognises for the occlusion input."""
    name = "glTF Material Output"
    if name in bpy.data.node_groups:
        return bpy.data.node_groups[name]
    g = bpy.data.node_groups.new(name, "ShaderNodeTree")
    g.interface.new_socket("Occlusion", in_out="INPUT", socket_type="NodeSocketFloat")
    g.interface.new_socket("Thickness", in_out="INPUT", socket_type="NodeSocketFloat")
    g.nodes.new("NodeGroupInput")
    return g


def orm_material(name, color_path, normal_path, orm_path, uv="UVMap", normal_strength=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    c = img_node(nt, color_path, uv=uv, y=300)
    nt.links.new(c.outputs["Color"], bsdf.inputs["Base Color"])
    o = img_node(nt, orm_path, non_color=True, uv=uv, y=0)
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    sep.location = (-300, 0)
    nt.links.new(o.outputs["Color"], sep.inputs["Color"])
    nt.links.new(sep.outputs["Green"], bsdf.inputs["Roughness"])
    nt.links.new(sep.outputs["Blue"], bsdf.inputs["Metallic"])
    grp = nt.nodes.new("ShaderNodeGroup")
    grp.node_tree = gltf_output_group()
    grp.location = (200, -300)
    nt.links.new(sep.outputs["Red"], grp.inputs["Occlusion"])
    n = img_node(nt, normal_path, non_color=True, uv=uv, y=-350)
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.uv_map = uv
    nm.inputs["Strength"].default_value = normal_strength
    nm.location = (-250, -350)
    nt.links.new(n.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


# =========================================================================== BOX
BW, BD, BH = 0.120, 0.050, 0.084
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=1.0)
for v in bm.verts:
    v.co = Vector((v.co.x * BW, v.co.y * BD, v.co.z * BH + BH / 2))
me = bpy.data.meshes.new("Box")
bm.to_mesh(me)
bm.free()
box = link(bpy.data.objects.new("Box", me))
for p in me.polygons:
    p.use_smooth = True
bev = box.modifiers.new("Bevel", "BEVEL")
bev.width = 0.0011
bev.segments = 3
bev.limit_method = "NONE"
bev.harden_normals = True
apply_modifiers(box)

layout = json.load(open(f"{W}/art/out/atlas_layout.json"))
S = layout["size"]
dims = {"front": (120, 84), "back": (120, 84), "right": (50, 84), "left": (50, 84), "top": (120, 50), "bottom": (120, 50)}


def panel_of(n):
    a = max(range(3), key=lambda i: abs(n[i]))
    if a == 0:
        return "right" if n.x > 0 else "left"
    if a == 1:
        return "back" if n.y > 0 else "front"
    return "top" if n.z > 0 else "bottom"


def panel_xy(panel, c):  # c in mm (Blender frame)
    X, Y, Z = c.x, c.y, c.z
    if panel == "front":
        return X + 60, 84 - Z
    if panel == "back":
        return 60 - X, 84 - Z
    if panel == "right":
        return Y + 25, 84 - Z
    if panel == "left":
        return 25 - Y, 84 - Z
    if panel == "top":
        return X + 60, 25 - Y
    return X + 60, 25 + Y  # bottom


me = box.data
uv0 = me.uv_layers.new(name="UVMap")
uv1 = me.uv_layers.new(name="UVPaper")
for poly in me.polygons:
    pn = panel_of(poly.normal)
    A = layout["panels"][pn]["affine"]
    wmm, hmm = dims[pn]
    for li in poly.loop_indices:
        c = me.vertices[me.loops[li].vertex_index].co * 1000.0
        px, py = panel_xy(pn, c)
        px, py = min(max(px, 0), wmm), min(max(py, 0), hmm)
        ax = A[0][0] * px + A[0][1] * py + A[0][2]
        ay = A[1][0] * px + A[1][1] * py + A[1][2]
        uv0.data[li].uv = (ax / S, 1 - ay / S)
        uv1.data[li].uv = (px / 20.0, -py / 20.0)
me.uv_layers.active_index = 0

m = bpy.data.materials.new("Box_Print")
m.use_nodes = True
nt = m.node_tree
bsdf = nt.nodes["Principled BSDF"]
bsdf.inputs["Roughness"].default_value = 0.68
bsdf.inputs["Metallic"].default_value = 0.0
t = img_node(nt, f"{TEX}/box_basecolor.jpg", uv="UVMap", y=300)
nt.links.new(t.outputs["Color"], bsdf.inputs["Base Color"])
pn_ = img_node(nt, f"{TEX}/paper_normal.jpg", non_color=True, uv="UVPaper", y=-300)
nmap = nt.nodes.new("ShaderNodeNormalMap")
nmap.uv_map = "UVPaper"
nmap.inputs["Strength"].default_value = 0.5
nt.links.new(pn_.outputs["Color"], nmap.inputs["Color"])
nt.links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])
me.materials.append(m)

# =========================================================================== SOAP BODY
SL, SW, SH = 0.090, 0.060, 0.028       # length (X), width (Y), height (Z)
PX, PY, PD = 0.0355, 0.0235, 0.0025    # pocket half-extents and depth
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=1.0)
for v in bm.verts:
    v.co = Vector((v.co.x * SL, v.co.y * SW, v.co.z * SH + SH / 2))
bmesh.ops.bevel(bm, geom=list(bm.edges), offset=0.0026, segments=4, profile=0.5, affect="EDGES")
bm.faces.ensure_lookup_table()
top = max((f for f in bm.faces if f.normal.z > 0.999), key=lambda f: f.calc_area())
res = bmesh.ops.inset_individual(bm, faces=[top], thickness=0.003, depth=0.0)
inner = top  # inset keeps the original face as the inner one
for v in inner.verts:
    v.co.x = math.copysign(PX, v.co.x)
    v.co.y = math.copysign(PY, v.co.y)
ext = bmesh.ops.extrude_face_region(bm, geom=[inner])
newv = [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]
for v in newv:
    v.co.z -= PD
bmesh.ops.delete(bm, geom=[inner], context="FACES")  # extrusion leaves the old face behind
bm.edges.ensure_lookup_table()


def edges_where(pred):
    return [e for e in bm.edges if pred(e)]


# rounded pocket corners (vertical wall edges)
corner = edges_where(lambda e: all(abs(abs(v.co.x) - PX) < 1e-6 and abs(abs(v.co.y) - PY) < 1e-6 for v in e.verts)
                     and abs(e.verts[0].co.z - e.verts[1].co.z) > 1e-4)
bmesh.ops.bevel(bm, geom=corner, offset=0.005, segments=6, profile=0.5, affect="EDGES")
rim = edges_where(lambda e: all(abs(v.co.z - SH) < 1e-6 and abs(v.co.x) <= PX + 1e-6 and abs(v.co.y) <= PY + 1e-6 for v in e.verts))
bmesh.ops.bevel(bm, geom=rim, offset=0.0015, segments=3, profile=0.5, affect="EDGES")
floor_e = edges_where(lambda e: all(abs(v.co.z - (SH - PD)) < 1e-6 for v in e.verts) and len(e.link_faces) == 2
                      and any(abs(f.normal.z) < 0.5 for f in e.link_faces))
bmesh.ops.bevel(bm, geom=floor_e, offset=0.0007, segments=2, profile=0.5, affect="EDGES")
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
# MikkTSpace (tangent export) needs tris/quads only
bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4], quad_method="BEAUTY", ngon_method="BEAUTY")
me = bpy.data.meshes.new("Soap_Body")
bm.to_mesh(me)
bm.free()
soap = link(bpy.data.objects.new("Soap_Body", me))
for p in me.polygons:
    p.use_smooth = True
wn = soap.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
wn.keep_sharp = True
wn.weight = 50
apply_modifiers(soap)
print("soap verts/faces", len(me.vertices), len(me.polygons))

# =========================================================================== LOOFAH MAT
H = np.load(f"{TEX}/loofah_height_low.npy")  # rows: z (back->front), cols: x ; mm
LW, LD = 70.0, 46.0
NX, NZ = 141, 93
xs = np.linspace(-LW / 2, LW / 2, NX)
zs = np.linspace(-LD / 2, LD / 2, NZ)
Xg, Zg = np.meshgrid(xs, zs)
rows = (Zg + LD / 2) / LD * H.shape[0] - 0.5
cols = (Xg + LW / 2) / LW * H.shape[1] - 0.5
Hs = ndimage.map_coordinates(H, [rows, cols], order=1, mode="nearest")
edge_d = np.minimum(LW / 2 - np.abs(Xg), LD / 2 - np.abs(Zg))
lift = -0.3 + 0.7 * np.clip(edge_d / 1.5, 0, 1)     # boundary sinks below pocket floor; low-pass loses ~0.4 mm of fibre tops
Zb = (SH * 1000 + Hs + lift) / 1000.0
CR = 4.6  # corner radius (mm) the mat must respect


def inside(x, z):
    ax, az = abs(x), abs(z)
    cx, cz = LW / 2 - CR, LD / 2 - CR
    if ax > cx and az > cz:
        return (ax - cx) ** 2 + (az - cz) ** 2 <= CR ** 2 + 1e-6
    return ax <= LW / 2 + 1e-6 and az <= LD / 2 + 1e-6


bm = bmesh.new()
uvl = bm.loops.layers.uv.new("UVMap")
V = [[bm.verts.new((Xg[j, i] / 1000, -Zg[j, i] / 1000, Zb[j, i])) for i in range(NX)] for j in range(NZ)]
for j in range(NZ - 1):
    for i in range(NX - 1):
        quad = [(j, i), (j + 1, i), (j + 1, i + 1), (j, i + 1)]
        if not all(inside(Xg[a, b], Zg[a, b]) for a, b in quad):
            continue
        f = bm.faces.new([V[a][b] for a, b in quad])
        for loop, (a, b) in zip(f.loops, quad):
            loop[uvl].uv = ((Xg[a, b] + LW / 2) / LW, 1 - (Zg[a, b] + LD / 2) / LD)
loose = [v for v in bm.verts if not v.link_faces]
bmesh.ops.delete(bm, geom=loose, context="VERTS")
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
me = bpy.data.meshes.new("Soap_Loofah")
bm.to_mesh(me)
bm.free()
loofah = link(bpy.data.objects.new("Soap_Loofah", me))
for p in me.polygons:
    p.use_smooth = True
print("loofah verts/faces", len(me.vertices), len(me.polygons))
loofah.data.materials.append(orm_material("Loofah_Fiber", f"{TEX}/loofah_basecolor.jpg", f"{TEX}/loofah_normal.jpg", f"{TEX}/loofah_orm.jpg"))

# ---------------------------------------------------------------- soap: UV + bake procedural maps
bpy.ops.object.select_all(action="DESELECT")
bpy.context.view_layer.objects.active = soap
soap.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.012, area_weight=0.0, scale_to_bounds=True)
bpy.ops.object.mode_set(mode="OBJECT")

scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 64
scene.render.bake.margin = 12
BAKE = 1024


def new_img(name, non_color):
    im = bpy.data.images.new(name, BAKE, BAKE, alpha=False, float_buffer=False)
    im.colorspace_settings.name = "Non-Color" if non_color else "sRGB"
    return im


bake_mat = bpy.data.materials.new("Soap_Bake")
bake_mat.use_nodes = True
nt = bake_mat.node_tree
nodes, links = nt.nodes, nt.links
bsdf = nodes["Principled BSDF"]
out = nodes["Material Output"]
tc = nodes.new("ShaderNodeTexCoord")


def noise(scale, detail=4.0, rough=0.55, dist=0.0, w=None):
    n = nodes.new("ShaderNodeTexNoise")
    n.noise_dimensions = "3D"
    n.inputs["Scale"].default_value = scale
    n.inputs["Detail"].default_value = detail
    n.inputs["Roughness"].default_value = rough
    n.inputs["Distortion"].default_value = dist
    links.new(tc.outputs["Object"], n.inputs["Vector"])
    return n


def maprange(sock, a, b, c, d):
    m = nodes.new("ShaderNodeMapRange")
    m.clamp = True
    links.new(sock, m.inputs["Value"])
    m.inputs["From Min"].default_value, m.inputs["From Max"].default_value = a, b
    m.inputs["To Min"].default_value, m.inputs["To Max"].default_value = c, d
    return m.outputs["Result"]


def mixcol(fac, c1, c2):
    m = nodes.new("ShaderNodeMix")
    m.data_type = "RGBA"
    fin = [s for s in m.inputs if s.name == "Factor" and s.type == "VALUE"][0]
    A = [s for s in m.inputs if s.name == "A" and s.type == "RGBA"][0]
    B = [s for s in m.inputs if s.name == "B" and s.type == "RGBA"][0]
    R = [s for s in m.outputs if s.name == "Result" and s.type == "RGBA"][0]
    links.new(fac, fin)
    for sock, c in ((A, c1), (B, c2)):
        if isinstance(c, tuple):
            sock.default_value = c
        else:
            links.new(c, sock)
    return R


def srgb(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple((x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c) + (1.0,)


# colour: warm ivory base, soft cloudy blotches, faint pale flecks, slight darker swirls
big = noise(28.0, 3.0, 0.5, 0.4)
mid = noise(120.0, 5.0, 0.55)
fine = noise(900.0, 2.0, 0.5)
c1 = mixcol(maprange(big.outputs["Fac"], 0.35, 0.68, 0.0, 1.0), srgb("#E9DABD"), srgb("#DDC9A6"))
c2 = mixcol(maprange(mid.outputs["Fac"], 0.55, 0.75, 0.0, 0.35), c1, srgb("#F0E5CF"))
c3 = mixcol(maprange(fine.outputs["Fac"], 0.62, 0.72, 0.0, 0.25), c2, srgb("#F4ECDD"))
color_sock = c3
rough_sock = maprange(mid.outputs["Fac"], 0.3, 0.7, 0.40, 0.56)
# bump: hand-cut waviness + fine pitting
bmp_big = noise(60.0, 3.0, 0.5)
bmp_fine = noise(1400.0, 3.0, 0.6)
add = nodes.new("ShaderNodeMath")
add.operation = "ADD"
links.new(maprange(bmp_big.outputs["Fac"], 0, 1, 0, 0.6), add.inputs[0])
links.new(maprange(bmp_fine.outputs["Fac"], 0, 1, 0, 0.4), add.inputs[1])
bump = nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 1.0
bump.inputs["Distance"].default_value = 0.00012
links.new(add.outputs[0], bump.inputs["Height"])
links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
links.new(color_sock, bsdf.inputs["Base Color"])
emis = nodes.new("ShaderNodeEmission")
tgt = nodes.new("ShaderNodeTexImage")
nt.nodes.active = tgt
soap.data.materials.append(bake_mat)

# give the loofah a plain diffuse while baking AO (only geometry matters)


def bake(kind, img, src=None):
    tgt.image = img
    nt.nodes.active = tgt
    if kind == "EMIT":
        links.new(src, emis.inputs["Color"])
        links.new(emis.outputs["Emission"], out.inputs["Surface"])
        scene.cycles.samples = 4
        bpy.ops.object.bake(type="EMIT", margin=12)
    elif kind == "AO":
        links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
        scene.cycles.samples = 96
        scene.world = scene.world or bpy.data.worlds.new("W")
        bpy.ops.object.bake(type="AO", margin=12)
    elif kind == "NORMAL":
        links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
        scene.cycles.samples = 4
        bpy.ops.object.bake(type="NORMAL", normal_space="TANGENT", margin=12)


bpy.ops.object.select_all(action="DESELECT")
soap.select_set(True)
bpy.context.view_layer.objects.active = soap
box.hide_render = True          # the box sits at the origin too; keep it out of the soap bakes
scene.world = bpy.data.worlds.new("W")
scene.world.light_settings.distance = 0.006
imgs = {}
for name, kind, src, nc in [("soap_color", "EMIT", color_sock, False), ("soap_rough", "EMIT", rough_sock, True),
                            ("soap_ao", "AO", None, True), ("soap_normal", "NORMAL", None, True)]:
    im = new_img(name, nc)
    bake(kind, im, src)
    p = f"{BUILD}/{name}.png"
    im.filepath_raw = p
    im.file_format = "PNG"
    im.save()
    imgs[name] = p
    print("baked", name)

# pack ORM + JPEG encode
ao = np.asarray(Image.open(imgs["soap_ao"]).convert("L")).astype(np.float32) / 255
ao = 0.35 + 0.65 * ao  # keep it gentle; the pocket still darkens
ro = np.asarray(Image.open(imgs["soap_rough"]).convert("L")).astype(np.float32) / 255
orm = np.stack([ao, ro, np.zeros_like(ao)], -1)
Image.fromarray(np.rint(orm * 255).astype(np.uint8)).save(f"{TEX}/soap_orm.jpg", quality=90, subsampling=0)
Image.open(imgs["soap_color"]).convert("RGB").save(f"{TEX}/soap_basecolor.jpg", quality=90)
Image.open(imgs["soap_normal"]).convert("RGB").save(f"{TEX}/soap_normal.jpg", quality=92, subsampling=0)

box.hide_render = False
soap.data.materials.clear()
soap.data.materials.append(orm_material("Soap_Body", f"{TEX}/soap_basecolor.jpg", f"{TEX}/soap_normal.jpg", f"{TEX}/soap_orm.jpg"))

# =========================================================================== hierarchy + export
root = link(bpy.data.objects.new("Soap", None))
root.empty_display_size = 0.05
for o in (soap, loofah):
    o.parent = root


for mat in bpy.data.materials:
    mat.use_backface_culling = True   # closed meshes -> single-sided in glTF


def export(path, objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True, export_apply=True, export_yup=True,
        export_texcoords=True, export_normals=True, export_tangents=True, export_materials="EXPORT",
        export_cameras=False, export_lights=False, export_image_format="AUTO", export_extras=False,
        export_animations=False, export_skins=False, export_morph=False, export_vertex_color="NONE",
        export_unused_images=False)
    print("exported", path, os.path.getsize(path))


export(f"{BUILD}/nha-xo-muop-soap.glb", [root, soap, loofah])
root.location = (0.012, -0.095, 0.0)       # soap in front of the box (glTF: x=+0.012, z=+0.095)
export(f"{BUILD}/nha-xo-muop.glb", [box, root, soap, loofah])
bpy.ops.wm.save_as_mainfile(filepath=f"{BUILD}/nha-xo-muop.blend")
print("ALL DONE")
