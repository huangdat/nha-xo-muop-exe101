"""Read-only GLB inspector: header, JSON chunk summary, meshes/materials/textures, image sizes."""
import json, struct, sys, io
from PIL import Image

for path in sys.argv[1:]:
    data = open(path, "rb").read()
    magic, version, length = struct.unpack_from("<4sII", data, 0)
    print(f"== {path}\n magic={magic} version={version} declared_len={length} actual_len={len(data)}")
    off = 12
    chunks = []
    while off < len(data):
        clen, ctype = struct.unpack_from("<I4s", data, off)
        chunks.append((ctype, data[off + 8: off + 8 + clen]))
        off += 8 + clen
    print(" chunks:", [(c[0], len(c[1])) for c in chunks])
    g = json.loads(chunks[0][1])
    binc = chunks[1][1]
    print(" asset:", g["asset"])
    print(" extensionsUsed:", g.get("extensionsUsed"), "required:", g.get("extensionsRequired"))
    print(" scene nodes:", [g["nodes"][i]["name"] for i in g["scenes"][g.get("scene", 0)]["nodes"]])
    for n in g["nodes"]:
        print("  node", n["name"], {k: n[k] for k in ("translation", "rotation", "scale", "mesh", "children") if k in n})
    for m in g["meshes"]:
        for p in m["primitives"]:
            attrs = {k: g["accessors"][v]["count"] for k, v in p["attributes"].items()}
            idx = g["accessors"][p["indices"]]["count"] // 3
            pos = g["accessors"][p["attributes"]["POSITION"]]
            print(f"  mesh {m['name']}: tris={idx} attrs={attrs} mat={g['materials'][p['material']]['name']} "
                  f"min={[round(x,4) for x in pos['min']]} max={[round(x,4) for x in pos['max']]}")
    for mt in g["materials"]:
        pbr = mt.get("pbrMetallicRoughness", {})
        print("  material", mt["name"], json.dumps({k: v for k, v in mt.items() if k != "name"}))
    for i, t in enumerate(g.get("textures", [])):
        print("  texture", i, t)
    for i, im in enumerate(g.get("images", [])):
        bv = g["bufferViews"][im["bufferView"]]
        raw = binc[bv.get("byteOffset", 0): bv.get("byteOffset", 0) + bv["byteLength"]]
        pil = Image.open(io.BytesIO(raw))
        print(f"  image {i} {im.get('name')} {im['mimeType']} {pil.size} {pil.mode} {bv['byteLength']/1e6:.2f} MB")
    print(" samplers:", g.get("samplers"))
