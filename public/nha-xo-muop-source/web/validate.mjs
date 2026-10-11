// Khronos glTF-Validator on each GLB: prints severity counts and every message.
import fs from 'fs';
import validator from 'gltf-validator';
for (const f of process.argv.slice(2)) {
  const data = new Uint8Array(fs.readFileSync(f));
  const r = await validator.validateBytes(data, { maxIssues: 200 });
  const i = r.issues;
  console.log(`\n== ${f}\n validatorVersion=${r.validatorVersion} mimeType=${r.mimeType}`);
  console.log(` errors=${i.numErrors} warnings=${i.numWarnings} infos=${i.numInfos} hints=${i.numHints}`);
  for (const m of i.messages) console.log(`  [${['ERR','WARN','INFO','HINT'][m.severity]}] ${m.code} ${m.pointer ?? ''} ${m.message}`);
  const n = r.info;
  console.log(' info:', JSON.stringify({ version: n.version, generator: n.generator, drawCalls: n.drawCallCount, totalVertexCount: n.totalVertexCount, totalTriangleCount: n.totalTriangleCount, materialCount: n.materialCount, maxUVs: n.maxUVs, hasTextures: n.hasTextures, resources: n.resources?.map(x => `${x.pointer} ${x.mimeType ?? ''} ${x.byteLength ?? ''} ${x.image ? x.image.width + 'x' + x.image.height : ''}`) }, null, 1));
}
