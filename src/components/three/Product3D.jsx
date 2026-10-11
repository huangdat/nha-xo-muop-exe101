import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Rotate3d } from 'lucide-react';
import { prefersReducedMotion } from '../../hooks/useMotion';
import './Product3D.css';

/**
 * Product3D — khung hiển thị mô hình 3D của sản phẩm.
 *
 * Phần nhẹ, luôn có trong bundle chính: kiểm tra WebGL, trạng thái tải, phương án dự phòng,
 * và quyết định KHI NÀO dựng cảnh. three.js + mô hình chỉ được tải khi khung sắp vào màn hình.
 * Mỗi khung chỉ giữ ngữ cảnh WebGL khi ở gần màn hình, nên hero và khung xem sản phẩm
 * không cùng lúc chiếm bộ nhớ GPU cho texture.
 *
 * - `mode`: 'hero' | 'viewer' (xem ProductStage)
 * - `view`: { yaw, pitch, zoom?, focus? } góc nghỉ hiện tại
 * - `fallback`: nội dung thay thế khi không có WebGL hoặc tải mô hình thất bại
 * - `onStatus`: nhận 'loading' | 'ready' | 'fallback'
 */

let webglSupport = null;
function hasWebGL() {
  if (webglSupport === null) {
    try {
      const canvas = document.createElement('canvas');
      webglSupport = Boolean(canvas.getContext('webgl2'));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

export default function Product3D({
  config,
  mode = 'hero',
  view,
  scrollRef,
  fallback = null,
  label,
  hint,
  className = '',
  onStatus,
}) {
  const hostRef = useRef(null);
  const activeRef = useRef(false);
  const [shownOnce, setShownOnce] = useState(false);
  const [near, setNear] = useState(() => !('IntersectionObserver' in window));
  const [bundle, setBundle] = useState(null); // { Stage, asset, lowPower }
  const [status, setStatus] = useState(() => (hasWebGL() ? 'loading' : 'fallback'));
  const [progress, setProgress] = useState(0);
  const [reducedMotion] = useState(prefersReducedMotion);

  const report = useCallback(
    (next) => {
      setStatus(next);
      onStatus?.(next);
    },
    [onStatus]
  );

  // `near`: dựng/huỷ cảnh khi khung tới gần màn hình. `active`: chỉ render khi thật sự nhìn thấy.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) {
      activeRef.current = true;
      return undefined;
    }
    const nearIO = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: '40% 0px',
    });
    const activeIO = new IntersectionObserver(([entry]) => {
      activeRef.current = entry.isIntersecting;
      // Đánh thức vòng render theo yêu cầu của cảnh
      if (entry.isIntersecting) window.dispatchEvent(new Event('scroll'));
    });
    nearIO.observe(el);
    activeIO.observe(el);

    // Không chờ IntersectionObserver cho lần đo đầu (observer không chạy khi tab đang ở nền)
    queueMicrotask(() => {
      const rect = el.getBoundingClientRect();
      const margin = window.innerHeight * 0.4;
      if (rect.bottom > -margin && rect.top < window.innerHeight + margin) {
        activeRef.current = rect.bottom > 0 && rect.top < window.innerHeight;
        setNear(true);
      }
    });

    return () => {
      nearIO.disconnect();
      activeIO.disconnect();
    };
  }, []);

  // Tải chunk 3D + mô hình ở lần đầu tới gần
  useEffect(() => {
    if (!near || bundle || status === 'fallback') return undefined;

    let cancelled = false;
    let unsubscribe = () => {};
    import('./stageBundle')
      .then(async (mod) => {
        unsubscribe = mod.subscribeProgress((value) => !cancelled && setProgress(value));
        const asset = await mod.loadProductAsset(config);
        if (!cancelled) setBundle({ Stage: mod.ProductStage, asset, lowPower: mod.isLowPower() });
      })
      .catch((error) => {
        console.error('[Product3D] Không dựng được cảnh 3D:', error);
        if (!cancelled) report('fallback');
      });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [near, bundle, status, config, report]);

  const handleReady = useCallback(() => {
    setShownOnce(true);
    report('ready');
  }, [report]);

  const handleContextLost = useCallback(() => report('fallback'), [report]);

  if (status === 'fallback') {
    return (
      <div ref={hostRef} className={`product3d is-fallback ${className}`}>
        {fallback}
      </div>
    );
  }

  const Stage = bundle?.Stage;
  const mounted = Boolean(Stage && near);

  return (
    <div
      ref={hostRef}
      className={`product3d ${status === 'ready' && mounted ? 'is-ready' : ''} ${className}`}
      role="img"
      aria-label={label}
    >
      {mounted && (
        <div className="product3d-canvas">
          <Stage
            asset={bundle.asset}
            config={config}
            mode={mode}
            view={view}
            activeRef={activeRef}
            scrollRef={scrollRef}
            reducedMotion={reducedMotion}
            skipIntro={shownOnce}
            lowPower={bundle.lowPower}
            onReady={handleReady}
            onContextLost={handleContextLost}
          />
        </div>
      )}

      {/* Trạng thái tải: giữ chỗ đúng kích thước nên không xô lệch bố cục */}
      {!bundle && (
        <div className="product3d-loading" aria-live="polite">
          <span className="product3d-loading-label">Đang tải mô hình 3D</span>
          <span className="product3d-loading-bar">
            <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
          </span>
        </div>
      )}

      {hint && (
        <p className="product3d-hint" aria-hidden="true">
          <Rotate3d size={15} strokeWidth={1.4} />
          {hint}
        </p>
      )}
    </div>
  );
}
