import React, { useRef, useState } from 'react';
import { siteData } from '../../data/siteData';
import SectionTitle from '../common/SectionTitle';
import { useScrollFrame, prefersReducedMotion } from '../../hooks/useMotion';
import './Process.css';

export default function Process() {
  const { process } = siteData;
  const total = process.steps.length;
  const timelineRef = useRef(null);
  // Khi tắt chuyển động: hiển thị sẵn toàn bộ các bước
  const [reached, setReached] = useState(() => (prefersReducedMotion() ? total : 0));

  // Đường tiến trình được "vẽ" theo vị trí cuộn: từ quả mướp đến bánh xà phòng
  useScrollFrame(() => {
    const el = timelineRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.min(
      1,
      Math.max(0, (vh * 0.82 - rect.top) / (rect.height + vh * 0.3))
    );
    el.style.setProperty('--progress', progress.toFixed(4));
    // Bước i sáng lên khi đường kẻ chạm tới chấm của nó
    const next = progress < 0.02 ? 0 : Math.min(total, Math.floor(progress * total) + 1);
    setReached((prev) => (prev === next ? prev : next));
  });

  return (
    <section id="process" className="section process-section">
      <div className="container">
        <SectionTitle
          index="05"
          badge={process.badge}
          title={process.title}
          subtitle={process.subtitle}
        />

        <ol
          className="process-timeline"
          ref={timelineRef}
          style={{ '--steps': total, '--progress': prefersReducedMotion() ? 1 : 0 }}
        >
          {process.steps.map((item, idx) => (
            <li
              key={item.step}
              className={`process-step ${idx < reached ? 'is-reached' : ''}`}
            >
              <span className="process-step-dot" aria-hidden="true" />
              <span className="process-step-num">{item.step}</span>
              <h3 className="process-step-title">{item.title}</h3>
              <p className="process-step-desc">{item.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
