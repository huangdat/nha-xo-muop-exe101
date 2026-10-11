// Rasterise panel SVGs with resvg. Usage: node render.js <panel> <px_per_mm> <out.png>
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const [panel, ppmm, out] = process.argv.slice(2);
const svg = fs.readFileSync(path.join(__dirname, 'svg', panel + '.svg'), 'utf8');
const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
const wmm = parseFloat(m[1]);
const hmm = parseFloat(m[2]);
const svg2 = svg.replace(/width="[\d.]+mm" height="[\d.]+mm"/, `width="${Math.round(wmm*ppmm)}" height="${Math.round(hmm*ppmm)}"`);
const r = new Resvg(svg2, {
  font: {
    loadSystemFonts: false,
    fontFiles: [
      '/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf',
      '/home/claude/work/fonts/expo-google-fonts-be-vietnam-pro-0.4.1/500Medium/BeVietnamPro_500Medium.ttf',
    ],
    defaultFontFamily: 'Lora',
  },
  shapeRendering: 2, textRendering: 2, imageRendering: 0,
});
const png = r.render().asPng();
fs.writeFileSync(out, png);
console.log(panel, r.width, 'x', r.height);
