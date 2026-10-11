import React, { useEffect, useRef, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { siteData } from '../../data/siteData';
import SectionTitle from '../common/SectionTitle';
import ImagePlaceholder from '../common/ImagePlaceholder';
import './Gallery.css';

export default function Gallery() {
  const { gallery } = siteData;
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [activeModalItem, setActiveModalItem] = useState(null);
  const closeBtnRef = useRef(null);
  const lastTriggerRef = useRef(null);

  // Derive unique categories from gallery items
  const categories = ['Tất cả', ...new Set(gallery.items.map((item) => item.category))];

  const filteredItems =
    selectedCategory === 'Tất cả'
      ? gallery.items
      : gallery.items.filter((item) => item.category === selectedCategory);

  // Lightbox: khóa cuộn nền, đóng bằng Escape, trả focus về ảnh vừa mở
  useEffect(() => {
    if (!activeModalItem) return undefined;

    const trigger = lastTriggerRef.current;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') setActiveModalItem(null);
      // Chỉ có một điều khiển trong hộp thoại nên giữ focus tại đó
      if (e.key === 'Tab') {
        e.preventDefault();
        closeBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      trigger?.focus();
    };
  }, [activeModalItem]);

  return (
    <section id="gallery" className="section gallery-section">
      <div className="container">
        <SectionTitle
          index="07"
          badge={gallery.badge}
          title={gallery.title}
          subtitle={gallery.subtitle}
        />

        {/* Category Filter */}
        <div className="gallery-filter-bar" role="group" aria-label="Lọc ảnh theo danh mục" data-reveal>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`gallery-filter-btn ${
                selectedCategory === cat ? 'active' : ''
              }`}
              aria-pressed={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid: ảnh đầu tiên chiếm ô lớn */}
        <div className="gallery-grid" data-reveal data-count={filteredItems.length}>
          {filteredItems.map((item, idx) => (
            <button
              key={`${selectedCategory}-${item.id}`}
              type="button"
              className="gallery-item"
              style={{ '--i': idx }}
              aria-label={`Phóng to ảnh: ${item.title}`}
              onClick={(e) => {
                lastTriggerRef.current = e.currentTarget;
                setActiveModalItem(item);
              }}
            >
              <span className="gallery-media">
                <ImagePlaceholder
                  src={item.image}
                  alt=""
                  aspectRatio="5 / 4"
                  label={item.title}
                  style={{
                    objectFit: item.fit || 'cover',
                    objectPosition: item.position || 'center',
                  }}
                />
                <span className="gallery-zoom" aria-hidden="true">
                  <Plus size={18} strokeWidth={1.5} />
                </span>
              </span>

              <span className="gallery-caption">
                <span className="gallery-item-title">{item.title}</span>
                <span className="gallery-category-tag">{item.category}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Lightbox Modal */}
        {activeModalItem && (
          <div
            className="gallery-modal-backdrop"
            onClick={() => setActiveModalItem(null)}
          >
            <div
              className="gallery-modal-content"
              role="dialog"
              aria-modal="true"
              aria-label={activeModalItem.title}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="gallery-modal-close"
                ref={closeBtnRef}
                onClick={() => setActiveModalItem(null)}
                aria-label="Đóng ảnh"
              >
                <X size={20} />
              </button>

              <ImagePlaceholder
                src={activeModalItem.image}
                alt={activeModalItem.title}
                aspectRatio="16 / 10"
                label={activeModalItem.title}
                eager
                className="gallery-modal-img"
                style={{ objectFit: 'contain' }}
              />

              <div className="gallery-modal-body">
                <p className="gallery-modal-caption">{activeModalItem.title}</p>
                <span className="gallery-modal-category">
                  {activeModalItem.category}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
