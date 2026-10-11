#!/usr/bin/env bash
# Full rebuild: artwork -> atlas -> procedural maps -> JPEG encode -> Blender build/bake/export
set -euo pipefail
cd /home/claude/work
python3 art/gen_art.py
python3 art/atlas.py
python3 tex/gen_loofah.py
(cd tex && python3 gen_paper.py)
python3 tex/encode.py
/home/claude/bvenv/bin/python blender/build.py 2>&1 | grep -E "exported|ALL DONE|Error|Traceback"
