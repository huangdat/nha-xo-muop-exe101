import React from 'react';
import { siteData } from '../../data/siteData';
import SectionTitle from '../common/SectionTitle';
import ImagePlaceholder from '../common/ImagePlaceholder';
import './Ingredients.css';

export default function Ingredients() {
  const { ingredients } = siteData;

  return (
    <section id="ingredients" className="section ingredients-section">
      <div className="container">
        <SectionTitle
          index="04"
          badge={ingredients.badge}
          title={ingredients.title}
          subtitle={ingredients.subtitle}
        />

        <div className="ingredients-grid">
          {ingredients.items.map((item, idx) => (
            <div key={idx} className="ingredient-card">
              <div className="ingredient-media" data-reveal="mask" style={{ '--i': idx }}>
                <ImagePlaceholder
                  src={item.image}
                  alt={item.name}
                  aspectRatio="4 / 5"
                  label={item.name}
                  style={{ objectPosition: item.imagePosition || 'center' }}
                />
              </div>
              <div className="ingredient-body" data-reveal style={{ '--i': idx + 2 }}>
                <h3 className="ingredient-title">{item.name}</h3>
                <p className="ingredient-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
