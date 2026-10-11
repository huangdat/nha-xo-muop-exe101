import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { siteData } from '../../data/siteData';
import ImagePlaceholder from '../common/ImagePlaceholder';
import Product3D from '../three/Product3D';
import './ProductShowcase.css';

export default function ProductShowcase() {
  const { productShowcase, product3d } = siteData;
  const [viewId, setViewId] = useState(product3d.views[0].id);
  const [stageStatus, setStageStatus] = useState('loading');
  const view = product3d.views.find((v) => v.id === viewId) || product3d.views[0];

  const handleScrollToContact = (e) => {
    e.preventDefault();
    const target = document.getElementById('contact');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="product" className="section showcase-section">
      <div className="container">
        <div className="showcase-grid">
          {/* Khung xem mô hình 3D: kéo để xoay, các nút bên dưới đưa về từng góc nhìn */}
          <div className="showcase-media">
            <div className="showcase-main-card" data-reveal>
              <Product3D
                config={product3d}
                mode="viewer"
                view={view}
                label={`${product3d.alt}. Góc nhìn: ${view.label}`}
                hint={product3d.hint}
                onStatus={setStageStatus}
                fallback={
                  <ImagePlaceholder
                    src={productShowcase.mainImage}
                    alt={productShowcase.mainImageAlt}
                    aspectRatio="7 / 6"
                    label={productShowcase.title}
                  />
                }
              />
            </div>

            {stageStatus !== 'fallback' && (
              <div
                className="showcase-views"
                role="group"
                aria-label="Chọn góc nhìn sản phẩm"
                data-reveal
              >
                {product3d.views.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`showcase-view-btn ${item.id === viewId ? 'active' : ''}`}
                    aria-pressed={item.id === viewId}
                    onClick={() => setViewId(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Specifications & Details */}
          <div className="showcase-info">
            <div className="showcase-header">
              <p className="eyebrow" data-reveal>
                <span className="eyebrow-index">02</span>
                <span className="eyebrow-rule" />
                {productShowcase.badge}
              </p>
              <h2 className="showcase-prod-title" data-reveal style={{ '--i': 1 }}>
                {productShowcase.title}
              </h2>
              <p className="showcase-prod-desc" data-reveal style={{ '--i': 2 }}>
                {productShowcase.subtitle}
              </p>
            </div>

            {/* Specifications Box */}
            {productShowcase.specs && (
              <dl className="showcase-specs">
                {productShowcase.specs.map((spec, idx) => (
                  <div key={idx} className="showcase-spec-item" data-reveal style={{ '--i': idx }}>
                    <dt className="spec-label">{spec.label}</dt>
                    <dd className="spec-value">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* CTA */}
            {productShowcase.cta && (
              <div className="showcase-cta" data-reveal>
                <a
                  href={productShowcase.cta.href}
                  className="btn btn-primary"
                  onClick={handleScrollToContact}
                >
                  <span>{productShowcase.cta.label}</span>
                  <ArrowRight size={18} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
