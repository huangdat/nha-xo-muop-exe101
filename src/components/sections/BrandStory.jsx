import React from 'react';
import { siteData } from '../../data/siteData';
import SectionTitle from '../common/SectionTitle';
import ImagePlaceholder from '../common/ImagePlaceholder';
import './BrandStory.css';

export default function BrandStory() {
  const { brandStory } = siteData;

  return (
    <section id="brand-story" className="section brand-story-section">
      <div className="container">
        <div className="brand-story-grid">
          {/* Media image */}
          <div className="brand-story-media">
            <div className="brand-story-image-card" data-reveal="mask">
              <ImagePlaceholder
                src={brandStory.image}
                alt={brandStory.imageAlt}
                aspectRatio="4 / 5"
                label="Câu chuyện giàn mướp quê"
                style={{ objectPosition: brandStory.imagePosition || 'center' }}
              />
            </div>
          </div>

          {/* Content & Quote */}
          <div className="brand-story-content">
            <SectionTitle
              index="08"
              badge={brandStory.badge}
              title={brandStory.title}
              align="left"
            />

            {brandStory.quote && (
              <figure className="brand-story-quote-card" data-reveal>
                <blockquote className="brand-story-quote">{brandStory.quote}</blockquote>
                {brandStory.founder && (
                  <figcaption className="brand-story-author">{brandStory.founder}</figcaption>
                )}
              </figure>
            )}

            {brandStory.paragraphs &&
              brandStory.paragraphs.map((p, idx) => (
                <p key={idx} className="brand-story-paragraph" data-reveal style={{ '--i': idx }}>
                  {p}
                </p>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
