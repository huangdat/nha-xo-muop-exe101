import React from 'react';
import { siteData } from '../../data/siteData';
import SectionTitle from '../common/SectionTitle';
import FeatureCard from '../common/FeatureCard';
import './Features.css';

export default function Features() {
  const { features } = siteData;

  return (
    <section id="features" className="section features-section">
      <div className="container">
        <SectionTitle
          index="03"
          badge={features.badge}
          title={features.title}
          subtitle={features.subtitle}
        />

        <ul className="features-grid">
          {features.items.map((item, idx) => (
            <FeatureCard
              key={idx}
              iconName={item.icon}
              title={item.title}
              description={item.desc}
              index={idx}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
