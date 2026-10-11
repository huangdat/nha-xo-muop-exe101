// Nén ảnh gốc trong public/new-images thành WebP cho web (ảnh gốc được giữ nguyên).
// Chạy: npm run images
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'public/new-images';
const OUT = 'public/images/photos';

// name: tên tệp đích · width: bề ngang tối đa · crop: cắt bỏ viền thừa của ảnh gốc (px)
const JOBS = [
  { file: 'qc_soap4.png', name: 'hop-va-banh-xa-bong', width: 1254 },
  { file: 'soap_goc.png', name: 'can-canh-banh-xa-bong', width: 1024 },
  { file: 'qc_soap2.png', name: 'banh-xa-bong-ke-go', width: 1024 },
  { file: 'qc_soap1.png', name: 'xo-muop-va-xa-bong', width: 1567 },
  { file: 'snapedit_1782654012732.jpeg', name: 'xo-muop-tinh-dau-thao-moc', width: 1280 },
  // Ảnh gốc có hai dải đen hai bên
  { file: 'xo_muop.png', name: 'xo-muop-kho', width: 589, crop: { left: 46, top: 0, width: 589, height: 811 } },
  { file: 'soap_tach_nen.png', name: 'banh-xa-bong-tach-nen', width: 495 },
];

await mkdir(OUT, { recursive: true });

for (const job of JOBS) {
  const input = path.join(SRC, job.file);
  const output = path.join(OUT, `${job.name}.webp`);
  let image = sharp(input);
  if (job.crop) image = image.extract(job.crop);
  await image.resize({ width: job.width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(output);
  const [before, after] = await Promise.all([stat(input), stat(output)]);
  console.log(`${job.file} ${(before.size / 1024).toFixed(0)} KB -> ${output} ${(after.size / 1024).toFixed(0)} KB`);
}

// Ảnh chia sẻ mạng xã hội (Open Graph) cần JPEG
await sharp(path.join(SRC, 'qc_soap4.png')).resize({ width: 1200 }).jpeg({ quality: 84 }).toFile(path.join(OUT, 'og-image.jpg'));
console.log('og-image.jpg written');
