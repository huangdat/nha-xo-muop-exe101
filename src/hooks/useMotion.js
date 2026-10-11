import { useEffect } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Bật trạng thái `data-inview` cho mọi phần tử có `data-reveal` khi cuộn tới.
 * Dùng attribute thay vì class để React không ghi đè khi render lại.
 */
export function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      nodes.forEach((n) => n.setAttribute('data-inview', ''));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-inview', '');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}

/**
 * Gọi `onFrame` mỗi khi cuộn/resize, gộp theo requestAnimationFrame.
 * Không chạy khi người dùng tắt chuyển động.
 */
export function useScrollFrame(onFrame) {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let raf = 0;
    const tick = () => {
      raf = 0;
      onFrame();
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    request();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
