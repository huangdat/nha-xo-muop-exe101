import React from 'react';

/**
 * BrandMark — biểu tượng lát cắt quả mướp (vỏ tròn + ba khoang rỗng)
 */
export default function BrandMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="12" cy="7.6" rx="2.5" ry="2.1" fill="currentColor" />
      <ellipse cx="8.1" cy="14.3" rx="2.5" ry="2.1" fill="currentColor" transform="rotate(-60 8.1 14.3)" />
      <ellipse cx="15.9" cy="14.3" rx="2.5" ry="2.1" fill="currentColor" transform="rotate(60 15.9 14.3)" />
    </svg>
  );
}
