import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

/**
 * ImagePlaceholder Component
 * Hiển thị ảnh kèm cơ chế fallback an toàn nếu ảnh chưa tải được hoặc đường dẫn trống.
 * Đảm bảo giao diện luôn đẹp mắt, không bao giờ bị icon ảnh vỡ.
 * - `eager`: tải ngay (dùng cho ảnh trên màn hình đầu tiên / lightbox)
 */
export default function ImagePlaceholder({
  src,
  alt = 'Hình ảnh sản phẩm xà phòng xơ mướp',
  className = '',
  aspectRatio = 'auto',
  label = '',
  eager = false,
  style = {},
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`image-fallback-placeholder ${className}`}
        style={{
          aspectRatio: aspectRatio !== 'auto' ? aspectRatio : '4 / 3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-alt)',
          border: '1px dashed var(--color-border-solid)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          ...style,
        }}
        role="img"
        aria-label={alt || label}
      >
        <ImageIcon size={32} strokeWidth={1.25} color="var(--color-secondary)" style={{ marginBottom: 10, opacity: 0.7 }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
          {label || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setHasError(true)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }}
    />
  );
}
