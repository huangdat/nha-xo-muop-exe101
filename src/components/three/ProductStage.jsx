import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createProductObject, createShadowTexture } from './productModel';

/**
 * ProductStage — cảnh WebGL của sản phẩm (nằm trong chunk tải lười cùng three.js).
 *
 * Sản phẩm được bày như tĩnh vật trên mặt bàn: hộp giấy đứng, bánh xà bông nằm phía trước.
 * Một mô hình tương tác duy nhất cho cả hai chế độ — góc nghỉ `view` luôn là đích đến,
 * kéo ngang để xoay bàn xoay:
 * - `hero`: thả tay ~1.2s thì sản phẩm tự quay về góc đọc được nhãn; xoay dần theo cuộn trang,
 *   nghiêng rất nhẹ theo con trỏ và đung đưa khẽ khi rảnh.
 * - `viewer`: giữ nguyên góc người xem để lại; đổi góc/cận cảnh bằng các nút bên ngoài.
 * Vẽ theo yêu cầu (frameloop="demand"): chỉ render khi còn chuyển động và khung đang trong màn hình.
 */

const damp = (current, target, lambda, dt) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

// Đưa `target` về giá trị tương đương gần `current` nhất để luôn xoay theo đường ngắn
const nearestAngle = (current, target) =>
  target + Math.round((current - target) / (Math.PI * 2)) * Math.PI * 2;

const ZERO = new THREE.Vector3();

function Rig({ asset, config, mode, view, activeRef, scrollRef, reducedMotion, skipIntro, lowPower, onReady }) {
  const { gl, viewport, invalidate, camera } = useThree();
  const outer = useRef(null); // vị trí + tỉ lệ
  const inner = useRef(null); // góc xoay (bàn xoay + độ nghiêng nhìn)
  const offset = useRef(null); // dời tâm khi cận cảnh một bộ phận

  const product = useMemo(() => createProductObject(asset, config), [asset, config]);
  const shadowTexture = useMemo(() => createShadowTexture(), []);
  const size = product.userData.size;
  const floorY = -size.y / 2;
  const span = Math.hypot(size.x, size.z); // bề ngang lớn nhất khi xoay quanh trục đứng

  const instant = reducedMotion || skipIntro;
  const s = useRef({
    yaw: instant ? view.yaw : view.yaw - 1.3,
    pitch: view.pitch,
    zoom: view.zoom ?? 1,
    dragYaw: 0,
    dragPitch: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    releasedAt: -10,
    hoverX: 0,
    hoverY: 0,
    hoverYaw: 0,
    hoverPitch: 0,
    intro: instant ? 1 : 0,
    clock: 0,
  });

  useEffect(() => {
    camera.lookAt(0, 0, 0);
    onReady?.();
    invalidate();
    return () => {
      product.userData.dispose();
      shadowTexture.dispose();
    };
  }, [product, shadowTexture, camera, invalidate, onReady]);

  // Đổi góc nhìn từ bên ngoài: bỏ phần lệch do kéo và đánh thức vòng render
  useEffect(() => {
    s.current.dragYaw = 0;
    s.current.dragPitch = 0;
    invalidate();
  }, [view, invalidate]);

  // Kéo để xoay (chuột, bút, cảm ứng). CSS đặt `touch-action: pan-y` để giữ cuộn dọc trên điện thoại.
  useEffect(() => {
    const el = gl.domElement;
    const st = s.current;
    const onDown = (e) => {
      st.dragging = true;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      el.setPointerCapture?.(e.pointerId);
      invalidate();
    };
    const onMove = (e) => {
      if (!st.dragging) return;
      st.dragYaw += (e.clientX - st.lastX) * 0.009;
      if (e.pointerType === 'mouse') {
        st.dragPitch = THREE.MathUtils.clamp(st.dragPitch + (e.clientY - st.lastY) * 0.005, -0.26, 0.6);
      }
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      invalidate();
    };
    const onUp = () => {
      if (!st.dragging) return;
      st.dragging = false;
      st.releasedAt = st.clock;
      invalidate();
    };
    // Nghiêng theo con trỏ: chỉ ở hero, chỉ với chuột
    const onHover = (e) => {
      if (mode !== 'hero' || e.pointerType !== 'mouse' || reducedMotion) return;
      st.hoverX = (e.clientX / window.innerWidth) * 2 - 1;
      st.hoverY = (e.clientY / window.innerHeight) * 2 - 1;
      invalidate();
    };
    const wake = () => invalidate();

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    window.addEventListener('pointermove', onHover, { passive: true });
    window.addEventListener('scroll', wake, { passive: true });
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      window.removeEventListener('pointermove', onHover);
      window.removeEventListener('scroll', wake);
    };
  }, [gl, invalidate, mode, reducedMotion]);

  useFrame((_, rawDt) => {
    const st = s.current;
    if (!activeRef.current || !outer.current) return;
    const dt = Math.min(rawDt, 0.05);
    st.clock += dt;

    // Vào cảnh: trồi lên, lớn dần và xoay về góc nghỉ
    if (st.intro < 1) st.intro = Math.min(1, st.intro + dt / 2);
    const intro = easeOutExpo(st.intro);

    const hero = mode === 'hero';
    const scroll = hero ? scrollRef?.current ?? 0 : 0;

    // Hero: sau khi thả tay ~1.2s, phần xoay do kéo tan dần để nhãn quay lại phía người xem
    if (hero && !st.dragging && st.clock - st.releasedAt > 1.2) {
      st.dragYaw = damp(st.dragYaw, 0, 2.2, dt);
      st.dragPitch = damp(st.dragPitch, 0, 2.2, dt);
    }
    st.hoverYaw = damp(st.hoverYaw, st.hoverX * 0.12, 3, dt);
    st.hoverPitch = damp(st.hoverPitch, st.hoverY * 0.05, 3, dt);

    const idle = hero && !reducedMotion && !st.dragging;
    const sway = idle ? Math.sin(st.clock * 0.5) * 0.04 : 0;

    // Cuộn khỏi hero: bàn xoay quay lộ dần mặt bên và cả cụm nhấc lên, dẫn mắt sang phần kế tiếp
    const targetYaw =
      nearestAngle(st.yaw, view.yaw) + st.dragYaw + st.hoverYaw + sway + scroll * 0.9;
    const targetPitch = view.pitch + st.dragPitch + st.hoverPitch;
    const targetZoom = view.zoom ?? 1;
    const targetFocus = (view.focus && product.userData.focus[view.focus]) || ZERO;

    const lambda = reducedMotion ? 80 : st.dragging ? 18 : 4.2;
    st.yaw = damp(st.yaw, targetYaw, lambda, dt);
    st.pitch = damp(st.pitch, targetPitch, lambda, dt);
    st.zoom = damp(st.zoom, targetZoom, reducedMotion ? 80 : 3.2, dt);

    const focusPos = offset.current.position;
    const k = 1 - Math.exp(-(reducedMotion ? 80 : 3.2) * dt);
    focusPos.x += (-targetFocus.x - focusPos.x) * k;
    focusPos.y += (-targetFocus.y - focusPos.y) * k;
    focusPos.z += (-targetFocus.z - focusPos.z) * k;

    // Khung hình: cả cụm nằm gọn trong khung ở mọi góc xoay
    const fit = Math.min((viewport.width * 0.84) / span, (viewport.height * 0.9) / (size.y + span * 0.36));

    inner.current.rotation.set(st.pitch, st.yaw, 0);
    outer.current.scale.setScalar(fit * st.zoom * (0.88 + 0.12 * intro));
    outer.current.position.y = (intro - 1) * 0.55 + scroll * 0.22 + fit * 0.09;

    // Còn chuyển động thì xin khung tiếp theo; đứng yên thì dừng hẳn để không tốn GPU
    const moving =
      idle ||
      st.dragging ||
      st.intro < 1 ||
      Math.abs(targetYaw - st.yaw) > 0.001 ||
      Math.abs(targetPitch - st.pitch) > 0.001 ||
      Math.abs(targetZoom - st.zoom) > 0.001 ||
      Math.abs(st.dragYaw) > 0.001 ||
      Math.abs(focusPos.x + targetFocus.x) + Math.abs(focusPos.y + targetFocus.y) + Math.abs(focusPos.z + targetFocus.z) > 0.001;
    if (moving) invalidate();
  });

  return (
    <>
      {/* Ánh sáng studio: trời ngà, đèn chính ấm từ trên-trái (khớp ánh sáng nền trang), đèn phụ và đèn viền */}
      <hemisphereLight args={['#FFF8EA', '#CBB88F', 0.75]} />
      <directionalLight
        castShadow
        position={[-3.2, 5.5, 4.2]}
        intensity={2.2}
        color="#FFF3DF"
        shadow-mapSize={lowPower ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={7}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={1}
        shadow-camera-far={18}
      />
      <directionalLight position={[4, 1.8, 2.5]} intensity={0.55} color="#F1E6CF" />
      <directionalLight position={[0.5, 3, -4]} intensity={0.5} color="#FFFFFF" />

      <group ref={outer}>
        <group ref={inner}>
          <group ref={offset}>
            <primitive object={product} />

            {/* Mặt bàn vô hình: chỉ hiện bóng đổ thật + một vệt tối mềm dưới chân sản phẩm */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]} receiveShadow>
              <planeGeometry args={[7, 7]} />
              <shadowMaterial transparent opacity={0.2} color="#3B3220" depthWrite={false} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY + 0.002, 0]}>
              <planeGeometry args={[size.x * 1.8, size.z * 1.55]} />
              <meshBasicMaterial map={shadowTexture} transparent depthWrite={false} toneMapped={false} />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}

export default function ProductStage({
  asset,
  config,
  mode = 'hero',
  view,
  activeRef,
  scrollRef,
  reducedMotion = false,
  skipIntro = false,
  lowPower = false,
  onReady,
  onContextLost,
}) {
  return (
    <Canvas
      frameloop="demand"
      shadows="soft"
      dpr={[1, lowPower ? 1.5 : 2]}
      camera={{ fov: 26, position: [0, 2, 5.6], near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl, scene }) => {
        // Khronos PBR Neutral: giữ đúng màu in của bao bì
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1;
        // Môi trường phản xạ dựng sẵn (không tải HDR qua mạng) cho vật liệu PBR của GLB
        const pmrem = new THREE.PMREMGenerator(gl);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environmentIntensity = 0.42;
        pmrem.dispose();
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onContextLost?.();
        });
      }}
      aria-hidden="true"
    >
      <Rig
        asset={asset}
        config={config}
        mode={mode}
        view={view}
        activeRef={activeRef}
        scrollRef={scrollRef}
        reducedMotion={reducedMotion}
        skipIntro={skipIntro}
        lowPower={lowPower}
        onReady={onReady}
      />
    </Canvas>
  );
}
