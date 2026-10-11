import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Nạp mô hình sản phẩm đúng MỘT lần cho cả trang (hero + khung xem sản phẩm dùng chung dữ liệu).
 *
 * 1. Tệp GLB ở `config.model` — hộp giấy + bánh xà bông, toàn bộ texture nhúng sẵn.
 *    (Kiểm tra chữ ký "glTF" vì máy chủ SPA trả index.html cho tệp thiếu.)
 * 2. Dự phòng nếu GLB không tải được: dựng hộp từ sáu mặt in của bao bì (`config.panels`).
 */

const FACE_ORDER = ['right', 'left', 'top', 'bottom', 'front', 'back']; // thứ tự vật liệu của BoxGeometry
const MAX_ANISOTROPY = 8;

export const isLowPower = () =>
  window.matchMedia('(pointer: coarse)').matches || (navigator.deviceMemory || 8) <= 4;

let cache = null;
let progress = 0;
const listeners = new Set();

const setProgress = (value) => {
  progress = value;
  listeners.forEach((fn) => fn(value));
};

/** Theo dõi tiến độ tải (0 → 1). Trả về hàm huỷ đăng ký. */
export function subscribeProgress(fn) {
  listeners.add(fn);
  fn(progress);
  return () => listeners.delete(fn);
}

function shrink(image, maxSize) {
  const w = image.width || image.naturalWidth;
  const h = image.height || image.naturalHeight;
  const longest = Math.max(w, h);
  if (longest <= maxSize) return image;
  const k = maxSize / longest;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * k);
  canvas.height = Math.round(h * k);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function fetchWithProgress(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const total = Number(res.headers.get('content-length')) || 0;
  if (!res.body || !total) return res.arrayBuffer();

  const reader = res.body.getReader();
  const data = new Uint8Array(total);
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (received + value.length > total) throw new Error('unexpected length');
    data.set(value, received);
    received += value.length;
    setProgress((received / total) * 0.92); // phần còn lại dành cho giải mã texture
  }
  return data.buffer;
}

async function loadGlb(url) {
  const buffer = await fetchWithProgress(url);
  const magic = new TextDecoder().decode(new Uint8Array(buffer, 0, 4));
  if (magic !== 'glTF') throw new Error('not a GLB file');
  const gltf = await new GLTFLoader().parseAsync(buffer, '');
  const scene = gltf.scene;

  // Nhãn in 4096² chiếm ~89MB bộ nhớ GPU: hạ xuống 2048² trên máy yếu
  const lowPower = isLowPower();
  scene.traverse((node) => {
    if (!node.isMesh) return;
    const m = node.material;
    ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'].forEach((key) => {
      const texture = m[key];
      if (!texture) return;
      texture.anisotropy = MAX_ANISOTROPY; // chữ nhỏ trên nhãn vẫn nét khi nhìn nghiêng
      if (lowPower && texture.image) {
        const resized = shrink(texture.image, 2048);
        if (resized !== texture.image) {
          texture.image.close?.();
          texture.image = resized;
        }
      }
      texture.needsUpdate = true;
    });
  });
  return scene;
}

function loadPanelTexture(url, maxSize) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const texture = new THREE.Texture(shrink(img, maxSize));
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = MAX_ANISOTROPY;
      texture.needsUpdate = true;
      resolve(texture);
    };
    img.onerror = () => reject(new Error(`Không tải được ${url}`));
    img.src = url;
  });
}

async function loadPanels(panels) {
  const maxSize = isLowPower() ? 1536 : 3072;
  const textures = await Promise.all(FACE_ORDER.map((face) => loadPanelTexture(panels[face], maxSize)));
  return Object.fromEntries(FACE_ORDER.map((face, i) => [face, textures[i]]));
}

/** @returns {Promise<{kind: 'glb', scene: THREE.Object3D} | {kind: 'panels', textures: object}>} */
export function loadProductAsset(config) {
  if (!cache) {
    cache = loadGlb(config.model)
      .then((scene) => ({ kind: 'glb', scene }))
      .catch(async (error) => {
        console.warn(`[Product3D] Không nạp được ${config.model} (${error.message}) — dùng hộp dựng từ ảnh in.`);
        return { kind: 'panels', textures: await loadPanels(config.panels) };
      })
      .then((asset) => {
        setProgress(1);
        return asset;
      });
    // Cho phép thử lại nếu cả hai nguồn đều hỏng
    cache.catch(() => {
      cache = null;
    });
  }
  return cache;
}

/**
 * Tạo một bản thể của sản phẩm cho một cảnh. Kết quả đã chuẩn hoá:
 * cạnh dài nhất = 1 đơn vị, tâm hộp bao tại gốc toạ độ, mặt in phía trước hướng +Z, Y hướng lên.
 * `userData.size`  — kích thước hộp bao sau chuẩn hoá
 * `userData.focus` — tâm các bộ phận (ví dụ `soap`) để máy quay tiến lại gần
 */
export function createProductObject(asset, config) {
  const pivot = new THREE.Group();
  const focus = {};
  let disposables = [];

  if (asset.kind === 'glb') {
    // Bản sao dùng chung geometry/vật liệu/texture với bản gốc
    const model = asset.scene.clone(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const k = 1 / Math.max(size.x, size.y, size.z); // mô hình tính bằng mét (hộp rộng 0.12)

    model.position.sub(center);
    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    pivot.add(model);
    pivot.scale.setScalar(k);
    pivot.userData.size = size.multiplyScalar(k);

    const soap = model.getObjectByName('Soap');
    if (soap) {
      const soapCenter = new THREE.Box3().setFromObject(soap).getCenter(new THREE.Vector3());
      focus.soap = soapCenter.sub(center).multiplyScalar(k);
    }
  } else {
    const [w, h, d] = config.sizeMm;
    const k = 1 / Math.max(w, h, d);
    const geometry = new RoundedBoxGeometry(w * k, h * k, d * k, 3, 1.1 * k);
    const materials = FACE_ORDER.map(
      (face) => new THREE.MeshStandardMaterial({ map: asset.textures[face], roughness: 0.7, metalness: 0 })
    );
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.castShadow = true;
    pivot.add(mesh);
    pivot.userData.size = new THREE.Vector3(w * k, h * k, d * k);
    disposables = [geometry, ...materials];
  }

  pivot.userData.focus = focus;
  pivot.userData.dispose = () => disposables.forEach((item) => item.dispose());
  return pivot;
}

/** Vệt tối mềm dưới chân sản phẩm (bổ sung cho bóng đổ thật, không cần thêm lượt render) */
export function createShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(46, 38, 18, 0.36)');
  gradient.addColorStop(0.5, 'rgba(46, 38, 18, 0.12)');
  gradient.addColorStop(0.92, 'rgba(46, 38, 18, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}
