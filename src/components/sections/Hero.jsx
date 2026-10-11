import React, { useRef } from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { siteData } from '../../data/siteData';
import Product3D from '../three/Product3D';
import { useScrollFrame } from '../../hooks/useMotion';
import './Hero.css';

export default function Hero() {
  const { hero, product3d } = siteData;
  const sectionRef = useRef(null);
  const scrollRef = useRef(0); // 0 → 1 khi cuộn hết chiều cao hero, cảnh 3D đọc mỗi khung hình

  // Cuộn: chữ trôi chậm, vòng xơ mướp phía sau xoay dần, mô hình 3D xoay theo tiến độ cuộn
  useScrollFrame(() => {
    const el = sectionRef.current;
    if (!el) return;
    const y = Math.min(window.scrollY, el.offsetHeight);
    el.style.setProperty('--sy', y.toFixed(1));
    scrollRef.current = y / el.offsetHeight;
  });

  const handleScrollTo = (e, targetHref) => {
    e.preventDefault();
    const element = document.getElementById(targetHref.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const lines = hero.titleLines || [{ text: hero.title }];

  return (
    <section id="hero" className="hero-section" ref={sectionRef}>
      {/* Vòng lát cắt quả mướp — nét vẽ nền */}
      <svg className="hero-ring" viewBox="0 0 600 600" fill="none" aria-hidden="true">
        <circle cx="300" cy="300" r="296" />
        <circle cx="300" cy="300" r="262" strokeDasharray="2 9" />
        <ellipse cx="300" cy="196" rx="74" ry="62" />
        <ellipse cx="210" cy="352" rx="74" ry="62" transform="rotate(-60 210 352)" />
        <ellipse cx="390" cy="352" rx="74" ry="62" transform="rotate(60 390 352)" />
      </svg>

      <div className="container hero-grid">
        <div className="hero-content">
          {hero.badge && (
            <p className="eyebrow hero-eyebrow">
              <span className="eyebrow-rule" />
              {hero.badge}
            </p>
          )}

          <h1 className="hero-title">
            {lines.map((line, index) => (
              <span key={line.text} className="hero-line">
                <span
                  className={`hero-line-inner ${line.emphasis ? 'is-emphasis' : ''}`}
                  style={{ '--i': index }}
                >
                  {line.text}
                </span>{' '}
              </span>
            ))}
          </h1>

          <p className="hero-description">{hero.subtitle}</p>

          <div className="hero-cta-group">
            <a
              href={hero.ctaPrimary.href}
              className="btn btn-primary"
              onClick={(e) => handleScrollTo(e, hero.ctaPrimary.href)}
            >
              <span>{hero.ctaPrimary.label}</span>
              <ArrowRight size={18} />
            </a>

            <a
              href={hero.ctaSecondary.href}
              className="btn-link"
              onClick={(e) => handleScrollTo(e, hero.ctaSecondary.href)}
            >
              <span>{hero.ctaSecondary.label}</span>
              <ArrowDown size={16} />
            </a>
          </div>
        </div>

        <div className="hero-media">
          <div className="hero-product">
            {hero.photo ? (
              <img src={hero.photo} alt={hero.imageAlt} fetchPriority="high" />
            ) : (
              <Product3D
                config={product3d}
                mode="hero"
                view={product3d.heroView}
                scrollRef={scrollRef}
                label={product3d.alt}
                hint={product3d.hint}
                fallback={
                  <img
                    className="product3d-flat"
                    src={product3d.panels.front}
                    alt={product3d.fallbackAlt}
                  />
                }
              />
            )}
          </div>
          {hero.caption && <p className="hero-caption">{hero.caption}</p>}
        </div>
      </div>

      {hero.tags && (
        <div className="container">
          <ul className="hero-facts">
            {hero.tags.map((tag, index) => (
              <li key={tag} className="hero-fact" style={{ '--i': index }}>
                <span className="hero-fact-num">0{index + 1}</span>
                <span>{tag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
