// NhaXoMuopViewer.jsx — product viewer for the "Nhà Xơ Mướp" loofah soap.
// Requires: three, @react-three/fiber, @react-three/drei (see README for versions).
// Model expected at: public/models/nha-xo-muop.glb  (served as /models/nha-xo-muop.glb)
import { Suspense, useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import {
  Bounds,
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  useGLTF,
  useProgress,
} from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = '/models/nha-xo-muop.glb'

/** Loads the GLB, enables shadows, sharpens the printed label, toggles the soap node. */
function Product({ url = MODEL_URL, showSoap = true, ...groupProps }) {
  const { scene } = useGLTF(url)
  const gl = useThree((s) => s.gl)

  // Clone so several viewers on one page don't fight over the same cached scene graph.
  const model = useMemo(() => scene.clone(true), [scene])

  // Set visibility during render (not in an effect) so the one-shot contact shadow sees the right state.
  const soap = model.getObjectByName('Soap') // node names: "Box", "Soap" (> "Soap_Body", "Soap_Loofah")
  if (soap) soap.visible = showSoap

  useEffect(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy()
    model.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = true
      o.receiveShadow = true
      const map = o.material.map
      if (map && map.anisotropy !== maxAniso) {
        map.anisotropy = maxAniso // keeps small label text crisp at grazing angles
        map.needsUpdate = true
      }
    })
  }, [model, gl])

  // Units are metres; the model origin is the bottom-centre of the box (sits on y = 0).
  return <primitive object={model} {...groupProps} />
}

/** Plain DOM overlay (outside the Canvas) — avoids mounting/unmounting DOM inside the WebGL tree. */
function LoadingOverlay() {
  const { active, progress } = useProgress()
  if (!active) return null
  return (
    <div
      aria-live="polite"
      style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none',
        font: '500 13px/1 system-ui, sans-serif', color: '#6b6555',
      }}
    >
      Đang tải mô hình… {progress.toFixed(0)}%
    </div>
  )
}

/** Self-contained studio lighting: no HDRI download, works offline / behind strict CSP. */
function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight
        castShadow
        position={[-0.35, 0.6, 0.45]}
        intensity={1.9}
        color="#fff3e4"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.002}
        shadow-camera-left={-0.25}
        shadow-camera-right={0.25}
        shadow-camera-top={0.25}
        shadow-camera-bottom={-0.25}
        shadow-camera-near={0.05}
        shadow-camera-far={2}
      />
      <Environment resolution={256} frames={1}>
        {/* even studio ring so every side of the pack reads well: overhead softbox + 4 quadrant panels + floor bounce */}
        <Lightformer form="rect" intensity={3.5} color="#ffffff" position={[0, 3, 0]} rotation-x={Math.PI / 2} scale={[5, 3, 1]} />
        <Lightformer form="rect" intensity={4.0} color="#fff1dc" position={[-3, 1.5, 2.5]} rotation-y={Math.PI / 4} scale={[2.5, 2, 1]} />
        <Lightformer form="rect" intensity={2.6} color="#f6f6ff" position={[3, 1.2, 2.5]} rotation-y={-Math.PI / 4} scale={[2.5, 2, 1]} />
        <Lightformer form="rect" intensity={3.4} color="#fff4e6" position={[-3, 1.5, -2.5]} rotation-y={(3 * Math.PI) / 4} scale={[2.5, 2, 1]} />
        <Lightformer form="rect" intensity={3.0} color="#ffffff" position={[3, 1.2, -2.5]} rotation-y={(-3 * Math.PI) / 4} scale={[2.5, 2, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#efe9df" position={[0, -2, 0]} rotation-x={-Math.PI / 2} scale={[6, 6, 1]} />
      </Environment>
    </>
  )
}

/**
 * Responsive product viewer.
 * Props:
 *  - modelUrl     GLB to load (default /models/nha-xo-muop.glb; use /models/nha-xo-muop-soap.glb for the bar alone)
 *  - showSoap     show the unwrapped soap bar in front of the box (default true)
 *  - autoRotate   slow turntable until the user interacts (default false)
 *  - background   studio backdrop colour (default warm neutral)
 *  - className / style   sizing of the wrapper (default: full width, 1:1, max 80vh)
 */
export default function NhaXoMuopViewer({
  modelUrl = MODEL_URL,
  showSoap = true,
  autoRotate = false,
  background = '#f3f0ea',
  className,
  style,
}) {
  return (
    <div
      className={className}
      role="img"
      aria-label="Mô hình 3D hộp xà bông xơ mướp Nhà Xơ Mướp — kéo để xoay"
      style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', maxHeight: '80vh', ...style }}
    >
      <Canvas
        shadows="percentage"

        dpr={[1, 2]}
        frameloop="demand"
        camera={{ fov: 30, near: 0.01, far: 10, position: [0.12, 0.17, 0.42] }}
        gl={{ antialias: true, preserveDrawingBuffer: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NeutralToneMapping // Khronos PBR Neutral: faithful product colours
          gl.toneMappingExposure = 1.0
        }}
      >
        <color attach="background" args={[background]} />
        <StudioLights />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.15}>
            <Product url={modelUrl} showSoap={showSoap} position={[0, 0, 0]} rotation={[0, -0.18, 0]} scale={1} />
          </Bounds>
          {/* frames={1}: rendered once (cheap); re-keyed so it re-renders when the soap is toggled */}
          <ContactShadows key={`${modelUrl}|${showSoap}`} position={[0, 0, 0]} scale={0.7} resolution={1024}
            blur={2.4} far={0.15} opacity={0.45} color="#3b3426" frames={1} />
        </Suspense>
        <OrbitControls
          makeDefault
          enableDamping
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={0.6}
          minDistance={0.12}
          maxDistance={0.9}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2 - 0.04}
        />
      </Canvas>
      <LoadingOverlay />
    </div>
  )
}

useGLTF.preload(MODEL_URL)
