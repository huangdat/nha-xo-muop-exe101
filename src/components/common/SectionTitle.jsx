import React from 'react';

/**
 * Reusable SectionTitle component
 * Giúp chuẩn hóa tiêu đề cho mọi section trên trang.
 * - `index`: số thứ tự chương ("02") đặt trước nhãn, tạo nhịp đọc xuyên suốt trang
 * - `align="left"`: dùng trong cột nội dung hẹp; mặc định là bố cục chia đôi tiêu đề / mô tả
 */
export default function SectionTitle({
  badge,
  title,
  subtitle,
  index,
  align = 'split',
}) {
  return (
    <div className={`section-header ${align === 'left' ? 'text-left' : ''}`}>
      {badge && (
        <p className="eyebrow" data-reveal>
          {index && <span className="eyebrow-index">{index}</span>}
          <span className="eyebrow-rule" />
          {badge}
        </p>
      )}
      {title && (
        <h2 className="section-title" data-reveal style={{ '--i': 1 }}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="section-subtitle" data-reveal style={{ '--i': 2 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
