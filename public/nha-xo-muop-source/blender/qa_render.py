"""QA: import an exported GLB into an empty scene and render it with Cycles.
Usage: python qa_render.py <glb> <outprefix> [views...]"""
import bpy, sys, os, math, glob
from mathutils import Vector

glb, prefix = sys.argv[1], sys.argv[2]
views = sys.argv[3:] or ["hero"]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=glb)
objs = [o for o in sc.objects if o.type == "MESH"]
print("imported meshes:", [(o.name, len(o.data.polygons), [m.name for m in o.data.materials]) for o in objs])
for o in objs:
    for m in o.data.materials:
        for n in m.node_tree.nodes:
            if n.type == "TEX_IMAGE":
                print("  tex", m.name, n.image.name, tuple(n.image.size), "packed" if n.image.packed_file else "external")

# studio world
hdri = "/home/claude/bvenv/lib/python3.13/site-packages/bpy/5.2/datafiles/studiolights/world/studio.exr"
w = bpy.data.worlds.new("Studio")
sc.world = w
w.use_nodes = True
nt = w.node_tree
env = nt.nodes.new("ShaderNodeTexEnvironment")
env.image = bpy.data.images.load(hdri)
bg = nt.nodes["Background"]
bg.inputs["Strength"].default_value = 0.35
nt.links.new(env.outputs["Color"], bg.inputs["Color"])

# warm neutral floor
bpy.ops.mesh.primitive_plane_add(size=3, location=(0, 0, 0))
floor = bpy.context.object
fm = bpy.data.materials.new("Floor")
fm.use_nodes = True
fb = fm.node_tree.nodes["Principled BSDF"]
fb.inputs["Base Color"].default_value = (0.55, 0.48, 0.40, 1)
fb.inputs["Roughness"].default_value = 0.85
floor.data.materials.append(fm)

# key + fill area lights
def area(name, loc, energy, size, rot):
    L = bpy.data.lights.new(name, "AREA")
    L.energy = energy
    L.size = size
    L.color = (1.0, 0.96, 0.9)
    o = bpy.data.objects.new(name, L)
    o.location = loc
    o.rotation_euler = rot
    sc.collection.objects.link(o)
    d = Vector((0, -0.05, 0.03)) - Vector(loc)
    o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()

area("Key", (-0.35, -0.35, 0.45), 5.0, 0.35, (0, 0, 0))
area("Fill", (0.45, -0.30, 0.20), 1.6, 0.5, (0, 0, 0))
area("Rim", (0.10, 0.40, 0.40), 2.5, 0.3, (0, 0, 0))

cam_d = bpy.data.cameras.new("Cam")
cam = bpy.data.objects.new("Cam", cam_d)
sc.collection.objects.link(cam)
sc.camera = cam
VIEWS = {
    # name: (location, target, lens mm)
    "hero": ((0.10, -0.40, 0.20), (0.004, -0.045, 0.036), 62),
    "soap_close": ((0.03, -0.24, 0.16), (0.012, -0.095, 0.026), 70),
    "loofah_macro": ((0.012, -0.135, 0.09), (0.012, -0.095, 0.028), 70),
    "box_front": ((0.0, -0.45, 0.042), (0.0, 0.0, 0.042), 85),
    "box_side": ((0.33, -0.30, 0.16), (0.0, 0.0, 0.04), 70),
    "box_back": ((-0.22, 0.38, 0.17), (0.0, 0.0, 0.04), 70),
    "soap_only": ((0.16, -0.20, 0.17), (0.0, 0.0, 0.016), 75),
}
r = sc.render
r.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = int(os.environ.get("QA_SAMPLES", 96))
sc.cycles.use_denoising = True
r.resolution_x = r.resolution_y = int(os.environ.get("QA_RES", 1000))
r.film_transparent = False
try:
    sc.view_settings.view_transform = "Khronos PBR Neutral"
except TypeError:
    sc.view_settings.view_transform = "Standard"
print("view transform:", sc.view_settings.view_transform)
for v in views:
    loc, tgt, lens = VIEWS[v]
    cam.location = loc
    cam.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    cam_d.lens = lens
    cam_d.clip_start = 0.005
    r.filepath = f"{prefix}_{v}.png"
    bpy.ops.render.render(write_still=True)
    print("rendered", r.filepath)
